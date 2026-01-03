import React, { useMemo, useRef, useState } from "react";

const STRING_NAMES = ["e", "B", "G", "D", "A", "E"];
const DEFAULT_SECTIONS = [
  {
    id: "intro",
    name: "Intro",
    repeats: 1,
    measures: 8,
    beatsPerMeasure: 4,
    chordOnly: false,
    strumPattern: ""
  },
  {
    id: "verse",
    name: "Verse",
    repeats: 2,
    measures: 8,
    beatsPerMeasure: 4,
    chordOnly: false,
    strumPattern: ""
  },
  {
    id: "chorus",
    name: "Chorus",
    repeats: 2,
    measures: 8,
    beatsPerMeasure: 4,
    chordOnly: false,
    strumPattern: ""
  }
];

const DEFAULT_SONG = {
  title: "Untitled Song",
  artist: "",
  tuning: "Standard (EADGBE)",
  tempo: 120,
  timeSignature: "4/4"
};

const DEFAULT_MEASURES = 8;
const DEFAULT_BEATS = 4;

function buildEmptyGrid(measures, beats) {
  const totalBeats = measures * beats;
  return Array.from({ length: STRING_NAMES.length }, () =>
    Array.from({ length: totalBeats }, () => "")
  );
}

function buildEmptyChords(measures, beats) {
  const totalBeats = measures * beats;
  return Array.from({ length: totalBeats }, () => "");
}

function App() {
  const nextSectionId = useRef(1);
  const [song, setSong] = useState(DEFAULT_SONG);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState("intro");
  const [sectionTabs, setSectionTabs] = useState(() => {
    const initial = {};
    DEFAULT_SECTIONS.forEach((section) => {
      initial[section.id] = buildEmptyGrid(section.measures, section.beatsPerMeasure);
    });
    return initial;
  });
  const [sectionChords, setSectionChords] = useState(() => {
    const initial = {};
    DEFAULT_SECTIONS.forEach((section) => {
      initial[section.id] = buildEmptyChords(section.measures, section.beatsPerMeasure);
    });
    return initial;
  });

  const activeSectionData = sections.find((section) => section.id === activeSection) ||
    sections[0];
  const activeMeasures = activeSectionData?.measures ?? DEFAULT_MEASURES;
  const activeBeatsPerMeasure = activeSectionData?.beatsPerMeasure ?? DEFAULT_BEATS;
  const activeTotalBeats = activeMeasures * activeBeatsPerMeasure;
  const activeChordOnly = activeSectionData?.chordOnly ?? false;

  const activeGrid = sectionTabs[activeSection] ||
    buildEmptyGrid(activeMeasures, activeBeatsPerMeasure);
  const activeChords = sectionChords[activeSection] ||
    buildEmptyChords(activeMeasures, activeBeatsPerMeasure);

  const beatLabels = useMemo(() => {
    return Array.from({ length: activeTotalBeats }, (_, index) => index + 1);
  }, [activeTotalBeats]);

  function updateSongField(field, value) {
    setSong((prev) => ({ ...prev, [field]: value }));
  }

  function updateSectionRepeats(id, repeats) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, repeats } : section
      )
    );
  }

  function updateSectionName(id, name) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, name } : section
      )
    );
  }

  function updateSectionChordOnly(id, chordOnly) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, chordOnly } : section
      )
    );
  }

  function updateSectionStrumPattern(id, strumPattern) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, strumPattern } : section
      )
    );
  }

  function updateSectionTiming(id, measures, beatsPerMeasure) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, measures, beatsPerMeasure } : section
      )
    );
    const nextTotalBeats = measures * beatsPerMeasure;
    setSectionTabs((prev) => {
      const next = { ...prev };
      const grid = next[id] || buildEmptyGrid(measures, beatsPerMeasure);
      const resized = Array.from({ length: STRING_NAMES.length }, (_, rowIndex) => {
        const row = grid[rowIndex] || [];
        const trimmed = row.slice(0, nextTotalBeats);
        while (trimmed.length < nextTotalBeats) trimmed.push("");
        return trimmed;
      });
      next[id] = resized;
      return next;
    });
    setSectionChords((prev) => {
      const next = { ...prev };
      const row = next[id] || buildEmptyChords(measures, beatsPerMeasure);
      const trimmed = row.slice(0, nextTotalBeats);
      while (trimmed.length < nextTotalBeats) trimmed.push("");
      next[id] = trimmed;
      return next;
    });
  }

  function addSection() {
    const id = `section-${nextSectionId.current++}`;
    const name = `Section ${sections.length + 1}`;
    setSections((prev) => [
      ...prev,
      {
        id,
        name,
        repeats: 1,
        measures: DEFAULT_MEASURES,
        beatsPerMeasure: DEFAULT_BEATS,
        chordOnly: false,
        strumPattern: ""
      }
    ]);
    setSectionTabs((prev) => ({
      ...prev,
      [id]: buildEmptyGrid(DEFAULT_MEASURES, DEFAULT_BEATS)
    }));
    setSectionChords((prev) => ({
      ...prev,
      [id]: buildEmptyChords(DEFAULT_MEASURES, DEFAULT_BEATS)
    }));
    setActiveSection(id);
  }

  function duplicateSection(id) {
    const source = sections.find((section) => section.id === id);
    if (!source) return;
    const newId = `section-${nextSectionId.current++}`;
    const name = `${source.name} Copy`;
    setSections((prev) => [...prev, { ...source, id: newId, name }]);
    setSectionTabs((prev) => ({
      ...prev,
      [newId]: (prev[id] || buildEmptyGrid(source.measures, source.beatsPerMeasure))
        .map((row) => row.slice())
    }));
    setSectionChords((prev) => ({
      ...prev,
      [newId]: (prev[id] || buildEmptyChords(source.measures, source.beatsPerMeasure)).slice()
    }));
    setActiveSection(newId);
  }

  function deleteSection(id) {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((section) => section.id !== id));
    setSectionTabs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSectionChords((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeSection === id) {
      const nextActive = sections.find((section) => section.id !== id);
      if (nextActive) setActiveSection(nextActive.id);
    }
  }

  function moveSection(id, direction) {
    setSections((prev) => {
      const index = prev.findIndex((section) => section.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      const [removed] = next.splice(index, 1);
      next.splice(target, 0, removed);
      return next;
    });
  }

  function handleGridChange(stringIndex, beatIndex, value) {
    setSectionTabs((prev) => {
      const next = { ...prev };
      const grid = (next[activeSection] || buildEmptyGrid(activeMeasures, activeBeatsPerMeasure))
        .map((row) => row.slice());
      grid[stringIndex][beatIndex] = value.replace(/[^0-9xXhHpP()\/\\bB~]/g, "");
      next[activeSection] = grid;
      return next;
    });
  }

  function handleChordChange(beatIndex, value) {
    setSectionChords((prev) => {
      const next = { ...prev };
      const row = (next[activeSection] || buildEmptyChords(activeMeasures, activeBeatsPerMeasure))
        .slice();
      const cleaned = value.replace(/[^A-Za-z0-9#b/()+%\-]/g, "").slice(0, 8);
      row[beatIndex] = cleaned;
      next[activeSection] = row;
      return next;
    });
  }

  const exportTitle = `${song.title}${song.artist ? " - " + song.artist : ""}`;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Tab Generator</h1>
          <p className="muted">Build your song tabs and export to PDF.</p>
        </div>
        <button className="primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </header>

      <main className="app__main">
        <section className="panel panel--song-info">
          <h2>Song Info</h2>
          <div className="form-grid">
            <label>
              Title
              <input
                type="text"
                value={song.title}
                onChange={(event) => updateSongField("title", event.target.value)}
              />
            </label>
            <label>
              Artist
              <input
                type="text"
                value={song.artist}
                onChange={(event) => updateSongField("artist", event.target.value)}
              />
            </label>
            <label>
              Tuning
              <input
                type="text"
                value={song.tuning}
                onChange={(event) => updateSongField("tuning", event.target.value)}
              />
            </label>
            <label>
              Tempo (BPM)
              <input
                type="number"
                min="30"
                max="240"
                value={song.tempo}
                onChange={(event) => updateSongField("tempo", Number(event.target.value))}
              />
            </label>
            <label>
              Time Signature
              <input
                type="text"
                value={song.timeSignature}
                onChange={(event) => updateSongField("timeSignature", event.target.value)}
              />
            </label>
            <div className="form-note">
              Measures and beats per section are set below.
            </div>
          </div>
        </section>

        <section className="panel panel--sections">
          <h2>Sections</h2>
          <div className="sections-list">
            {sections.map((section, index) => (
              <div key={section.id} className="section-row">
                <button
                  className={section.id === activeSection ? "tab active" : "tab"}
                  onClick={() => setActiveSection(section.id)}
                >
                  Edit
                </button>
                <input
                  className="section-name"
                  value={section.name}
                  onChange={(event) => updateSectionName(section.id, event.target.value)}
                />
                <label className="section-repeats">
                  Repeats
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={section.repeats}
                    onChange={(event) =>
                      updateSectionRepeats(section.id, Number(event.target.value))
                    }
                  />
                </label>
                <label className="section-timing">
                  Measures
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={section.measures}
                    onChange={(event) =>
                      updateSectionTiming(
                        section.id,
                        Number(event.target.value),
                        section.beatsPerMeasure
                      )
                    }
                  />
                </label>
                <label className="section-timing">
                  Beats / Measure
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={section.beatsPerMeasure}
                    onChange={(event) =>
                      updateSectionTiming(
                        section.id,
                        section.measures,
                        Number(event.target.value)
                      )
                    }
                  />
                </label>
                <label className="section-toggle">
                  Chord-only
                  <input
                    type="checkbox"
                    checked={section.chordOnly}
                    onChange={(event) =>
                      updateSectionChordOnly(section.id, event.target.checked)
                    }
                  />
                </label>
                <label className="section-strum">
                  Strumming
                  <input
                    type="text"
                    placeholder="D D U D U"
                    value={section.strumPattern}
                    onChange={(event) =>
                      updateSectionStrumPattern(section.id, event.target.value)
                    }
                  />
                </label>
                <div className="section-actions">
                  <button onClick={() => moveSection(section.id, "up")} disabled={index === 0}>
                    Up
                  </button>
                  <button
                    onClick={() => moveSection(section.id, "down")}
                    disabled={index === sections.length - 1}
                  >
                    Down
                  </button>
                  <button onClick={() => duplicateSection(section.id)}>Duplicate</button>
                  <button onClick={() => deleteSection(section.id)} disabled={sections.length <= 1}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="primary add-section" onClick={addSection}>
            Add Section
          </button>
        </section>

        <section className="panel panel--editor">
          <h2>{sections.find((section) => section.id === activeSection)?.name} Tab</h2>
          <div className={activeChordOnly ? "grid-wrapper grid-wrapper--chord-only" : "grid-wrapper"}>
            <div className="grid-header">
              <div className="grid-label">String</div>
              {beatLabels.map((label, index) => (
                <div key={index} className="grid-cell grid-cell--header">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid-row">
              <div className="grid-label">Chord</div>
              {activeChords.map((value, beatIndex) => (
                <input
                  key={`chord-${beatIndex}`}
                  className="grid-cell grid-cell--chord"
                  value={value}
                  title={value}
                  onChange={(event) => handleChordChange(beatIndex, event.target.value)}
                />
              ))}
            </div>
            {!activeChordOnly && STRING_NAMES.map((stringName, stringIndex) => (
              <div key={stringName} className="grid-row">
                <div className="grid-label">{stringName}</div>
                {activeGrid[stringIndex].map((value, beatIndex) => (
                  <input
                    key={`${stringName}-${beatIndex}`}
                    className="grid-cell"
                    inputMode="text"
                    value={value}
                    onChange={(event) =>
                      handleGridChange(stringIndex, beatIndex, event.target.value)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel--preview">
          <div className="preview" id="print-area">
            <div className="preview__header">
              <div>
                <h2>{exportTitle}</h2>
                <p>
                  Tuning: {song.tuning} | Tempo: {song.tempo} BPM | Time: {song.timeSignature}
                </p>
              </div>
              <div className="preview__meta">
                {sections.map((section) => (
                  <div key={section.id}>
                    {section.name} x {section.repeats}
                  </div>
                ))}
              </div>
            </div>

            <div className="preview__sections">
              {sections.map((section) => {
                const totalBeats = section.measures * section.beatsPerMeasure;
                const beatWidth = section.chordOnly ? 69 : 46;
                const grid = sectionTabs[section.id] ||
                  buildEmptyGrid(section.measures, section.beatsPerMeasure);
                const chords = sectionChords[section.id] ||
                  buildEmptyChords(section.measures, section.beatsPerMeasure);
                return (
                  <div key={section.id} className="preview__section">
                    <h3>
                      {section.name}
                      {section.strumPattern ? ` - Strumming ${section.strumPattern}` : ""}
                    </h3>
                    <svg
                      viewBox={`0 0 ${totalBeats * beatWidth + 160} 200`}
                      width="100%"
                      height="200"
                      role="img"
                      aria-label={`${section.name} tab`}
                    >
                      {!section.chordOnly && STRING_NAMES.map((_, stringIndex) => {
                        const y = 34 + stringIndex * 30;
                        return (
                          <line
                            key={stringIndex}
                            x1="60"
                            y1={y}
                            x2={totalBeats * 46 + 60}
                            y2={y}
                            stroke="#111"
                            strokeOpacity="0.55"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        );
                      })}
                      {section.chordOnly && Array.from({ length: section.measures + 1 }, (_, index) => {
                        const measureWidth = section.beatsPerMeasure * beatWidth;
                        const x = 60 + index * measureWidth;
                        return (
                          <line
                            key={`measure-${index}`}
                            x1={x}
                            y1="54"
                            x2={x}
                            y2="122"
                            stroke="#d5c3a6"
                            strokeWidth="1"
                          />
                        );
                      })}
                      {chords.map((value, beatIndex) => {
                        if (!value) return null;
                        const cellCenterX = 60 + beatIndex * beatWidth + beatWidth / 2;
                        const chordY = section.chordOnly ? 93 : 20;
                        const chordTextLength = 32;
                        const shouldShrinkChord = section.chordOnly && value.length > 3;
                        return (
                          <text
                            key={`chord-${beatIndex}`}
                            x={cellCenterX}
                            y={chordY}
                            fontFamily="monospace"
                            fontSize={section.chordOnly ? "18" : "13"}
                            fill="#111"
                            textAnchor="middle"
                            lengthAdjust={shouldShrinkChord ? "spacingAndGlyphs" : undefined}
                            textLength={shouldShrinkChord ? chordTextLength : undefined}
                          >
                            {value}
                          </text>
                        );
                      })}
                      {!section.chordOnly && grid[0].map((_, beatIndex) => {
                        const x = 60 + beatIndex * beatWidth;
                        return (
                          <line
                            key={beatIndex}
                            x1={x}
                            y1="20"
                            x2={x}
                            y2="180"
                            stroke={beatIndex % section.beatsPerMeasure === 0 ? "#111" : "#ccc"}
                            strokeWidth={beatIndex % section.beatsPerMeasure === 0 ? "1.2" : "1"}
                          />
                        );
                      })}
                      {!section.chordOnly && STRING_NAMES.map((_, stringIndex) =>
                        grid[stringIndex].map((value, beatIndex) => {
                          if (!value) return null;
                          const x = 72 + beatIndex * beatWidth;
                          const y = 38 + stringIndex * 30;
                          return (
                            <g key={`${stringIndex}-${beatIndex}`}>
                              <rect
                                x={x - 6}
                                y={y - 16}
                                width={28}
                                height={20}
                                fill="#ffffff"
                              />
                              <text
                                x={x}
                                y={y}
                                fontFamily="monospace"
                                fontSize="18"
                                fill="#111"
                              >
                                {value}
                              </text>
                            </g>
                          );
                        })
                      )}
                      {!section.chordOnly && STRING_NAMES.map((name, index) => (
                        <text
                          key={name}
                          x="20"
                          y={38 + index * 30}
                          fontFamily="monospace"
                          fontSize="15"
                        >
                          {name}
                        </text>
                      ))}
                      <text
                        x={totalBeats * beatWidth + 90}
                        y="100"
                        fontFamily="monospace"
                        fontSize="25"
                        fill="#111"
                      >
                        x{section.repeats}
                      </text>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
