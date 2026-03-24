import { useState, useEffect, useCallback } from "react";

const EXERCISES = {
  A: [
    { name: "Barbell Squat", sets: 3, targetReps: 8 },
    { name: "Incline DB Bench", sets: 3, targetReps: 10 },
    { name: "Barbell Row", sets: 3, targetReps: 8 },
    { name: "Overhead Press", sets: 3, targetReps: 10 },
    { name: "Face Pulls", sets: 3, targetReps: 15 },
    { name: "Plank / Ab Wheel", sets: 3, targetReps: 1 },
  ],
  B: [
    { name: "Romanian Deadlift", sets: 3, targetReps: 10 },
    { name: "DB Chest Fly", sets: 3, targetReps: 12 },
    { name: "Lat Pulldown", sets: 3, targetReps: 10 },
    { name: "Lateral Raises", sets: 3, targetReps: 15 },
    { name: "Bicep Curls", sets: 3, targetReps: 12 },
    { name: "Tricep Pushdowns", sets: 3, targetReps: 12 },
  ],
  C: [
    { name: "Bulgarian Split Squat", sets: 3, targetReps: 10 },
    { name: "Push Ups (weighted/slow)", sets: 3, targetReps: 15 },
    { name: "Cable Rows", sets: 3, targetReps: 12 },
    { name: "Dips", sets: 3, targetReps: 10 },
    { name: "Farmer Walks", sets: 3, targetReps: 1 },
    { name: "Hanging Leg Raises", sets: 3, targetReps: 10 },
  ],
};

const DAILY_HABITS = [
  { id: "creatine", label: "5g Creatine", icon: "⚡" },
  { id: "shake_am", label: "Morning Shake", icon: "🥤" },
  { id: "protein_target", label: "140g+ Protein", icon: "🥩" },
  { id: "calories", label: "2700+ Calories", icon: "🔥" },
  { id: "water", label: "2.5L+ Water", icon: "💧" },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const emptyWorkout = (type) =>
  EXERCISES[type].map((ex) => ({
    name: ex.name,
    sets: Array.from({ length: ex.sets }, () => ({ weight: "", reps: "" })),
  }));

export default function FitnessTracker() {
  const [tab, setTab] = useState("today");
  const [habits, setHabits] = useState({});
  const [bodyLog, setBodyLog] = useState([]);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [bfInput, setBfInput] = useState("");
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load all data
  useEffect(() => {
    (async () => {
      try {
        const [hRes, bRes, wRes] = await Promise.all([
          window.storage.get("habits").catch(() => null),
          window.storage.get("bodylog").catch(() => null),
          window.storage.get("workoutlog").catch(() => null),
        ]);
        if (hRes?.value) setHabits(JSON.parse(hRes.value));
        if (bRes?.value) setBodyLog(JSON.parse(bRes.value));
        if (wRes?.value) setWorkoutLog(JSON.parse(wRes.value));
      } catch (e) {
        console.error("Load error:", e);
      }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(
    async (key, data) => {
      setSaving(true);
      try {
        await window.storage.set(key, JSON.stringify(data));
      } catch (e) {
        console.error("Save error:", e);
      }
      setSaving(false);
    },
    []
  );

  const toggleHabit = async (id) => {
    const today = todayKey();
    const dayHabits = habits[today] || {};
    const updated = {
      ...habits,
      [today]: { ...dayHabits, [id]: !dayHabits[id] },
    };
    setHabits(updated);
    save("habits", updated);
  };

  const logBody = async () => {
    if (!weightInput) return;
    const entry = {
      date: todayKey(),
      weight: parseFloat(weightInput),
      bf: bfInput ? parseFloat(bfInput) : null,
    };
    const updated = [...bodyLog.filter((b) => b.date !== todayKey()), entry].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
    setBodyLog(updated);
    setWeightInput("");
    setBfInput("");
    save("bodylog", updated);
  };

  const startWorkout = (type) => {
    setActiveWorkout(type);
    setWorkoutData(emptyWorkout(type));
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    setWorkoutData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[exIdx].sets[setIdx][field] = val;
      return next;
    });
  };

  const finishWorkout = async () => {
    const entry = {
      date: todayKey(),
      type: activeWorkout,
      exercises: workoutData,
      ts: Date.now(),
    };
    const updated = [...workoutLog, entry];
    setWorkoutLog(updated);
    save("workoutlog", updated);
    setActiveWorkout(null);
    setWorkoutData(null);
  };

  const resetAll = async () => {
    if (!confirm("Reset ALL data? This cannot be undone.")) return;
    setHabits({});
    setBodyLog([]);
    setWorkoutLog([]);
    await Promise.all([
      window.storage.delete("habits").catch(() => {}),
      window.storage.delete("bodylog").catch(() => {}),
      window.storage.delete("workoutlog").catch(() => {}),
    ]);
  };

  const todayHabits = habits[todayKey()] || {};
  const habitsCompleted = DAILY_HABITS.filter((h) => todayHabits[h.id]).length;
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      const dayH = habits[key] || {};
      const done = DAILY_HABITS.filter((h) => dayH[h.id]).length;
      if (done < 3 && count > 0) break;
      if (done < 3 && count === 0) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const latestWeight = bodyLog.length ? bodyLog[bodyLog.length - 1].weight : 70.5;
  const progressToGoal = Math.min(100, ((latestWeight - 70.5) / (75 - 70.5)) * 100);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={{ color: "#94a3b8", marginTop: 16 }}>Loading your data...</p>
        </div>
      </div>
    );
  }

  if (activeWorkout && workoutData) {
    return (
      <div style={styles.container}>
        <div style={styles.workoutHeader}>
          <button onClick={() => setActiveWorkout(null)} style={styles.backBtn}>
            ← Back
          </button>
          <h2 style={styles.workoutTitle}>Full Body {activeWorkout}</h2>
        </div>
        <div style={styles.exerciseList}>
          {workoutData.map((ex, exIdx) => {
            const template = EXERCISES[activeWorkout][exIdx];
            return (
              <div key={exIdx} style={styles.exerciseCard}>
                <div style={styles.exerciseName}>{ex.name}</div>
                <div style={styles.targetText}>
                  Target: {template.sets}×{template.targetReps}
                  {template.targetReps === 1 ? " (hold/carry)" : ""}
                </div>
                <div style={styles.setsGrid}>
                  {ex.sets.map((s, sIdx) => (
                    <div key={sIdx} style={styles.setRow}>
                      <span style={styles.setLabel}>Set {sIdx + 1}</span>
                      <input
                        type="number"
                        placeholder="kg"
                        value={s.weight}
                        onChange={(e) =>
                          updateSet(exIdx, sIdx, "weight", e.target.value)
                        }
                        style={styles.setInput}
                      />
                      <input
                        type="number"
                        placeholder="reps"
                        value={s.reps}
                        onChange={(e) =>
                          updateSet(exIdx, sIdx, "reps", e.target.value)
                        }
                        style={styles.setInput}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={finishWorkout} style={styles.finishBtn}>
          ✓ Finish Workout
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>GYM BUDDY GEMINI</h1>
          <p style={styles.subtitle}>70.5 → 75kg · 18% → 13% BF</p>
        </div>
        <div style={styles.streakBadge}>
          <span style={styles.streakNum}>{streak}</span>
          <span style={styles.streakLabel}>day streak</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["today", "log", "progress"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              ...(tab === t ? styles.tabActive : {}),
            }}
          >
            {t === "today" ? "Today" : t === "log" ? "Workouts" : "Progress"}
          </button>
        ))}
      </div>

      {/* Today Tab */}
      {tab === "today" && (
        <div style={styles.content}>
          {/* Habits */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Daily Habits</h3>
              <span style={styles.habitCount}>
                {habitsCompleted}/{DAILY_HABITS.length}
              </span>
            </div>
            <div style={styles.habitBar}>
              <div
                style={{
                  ...styles.habitBarFill,
                  width: `${(habitsCompleted / DAILY_HABITS.length) * 100}%`,
                }}
              />
            </div>
            {DAILY_HABITS.map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                style={{
                  ...styles.habitRow,
                  ...(todayHabits[h.id] ? styles.habitDone : {}),
                }}
              >
                <span style={styles.habitIcon}>{h.icon}</span>
                <span
                  style={{
                    ...styles.habitLabel,
                    textDecoration: todayHabits[h.id]
                      ? "line-through"
                      : "none",
                    opacity: todayHabits[h.id] ? 0.5 : 1,
                  }}
                >
                  {h.label}
                </span>
                <span style={styles.habitCheck}>
                  {todayHabits[h.id] ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Workout Start */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Start Workout</h3>
            <div style={styles.workoutBtns}>
              {["A", "B", "C"].map((type) => (
                <button
                  key={type}
                  onClick={() => startWorkout(type)}
                  style={styles.workoutTypeBtn}
                >
                  <span style={styles.workoutTypeLetter}>{type}</span>
                  <span style={styles.workoutTypeLabel}>
                    {type === "A"
                      ? "Compound"
                      : type === "B"
                      ? "Hypertrophy"
                      : "Hybrid"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Log */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Log Weight</h3>
            <div style={styles.bodyInputRow}>
              <input
                type="number"
                step="0.1"
                placeholder="kg"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                style={styles.bodyInput}
              />
              <input
                type="number"
                step="0.5"
                placeholder="BF%"
                value={bfInput}
                onChange={(e) => setBfInput(e.target.value)}
                style={styles.bodyInput}
              />
              <button onClick={logBody} style={styles.logBtn}>
                Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workouts Tab */}
      {tab === "log" && (
        <div style={styles.content}>
          {workoutLog.length === 0 ? (
            <p style={styles.emptyText}>
              No workouts yet. Start your first one from the Today tab.
            </p>
          ) : (
            [...workoutLog]
              .reverse()
              .slice(0, 20)
              .map((w, i) => (
                <div key={i} style={styles.workoutLogCard}>
                  <div style={styles.logCardHeader}>
                    <span style={styles.logCardType}>Full Body {w.type}</span>
                    <span style={styles.logCardDate}>{w.date}</span>
                  </div>
                  {w.exercises.map((ex, j) => {
                    const filledSets = ex.sets.filter(
                      (s) => s.weight || s.reps
                    );
                    if (filledSets.length === 0) return null;
                    return (
                      <div key={j} style={styles.logExercise}>
                        <span style={styles.logExName}>{ex.name}</span>
                        <span style={styles.logExSets}>
                          {filledSets
                            .map((s) => `${s.weight || "?"}kg×${s.reps || "?"}`)
                            .join("  ·  ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
          )}
        </div>
      )}

      {/* Progress Tab */}
      {tab === "progress" && (
        <div style={styles.content}>
          {/* Weight Progress */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Weight Progress</h3>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: `${Math.max(0, Math.min(100, progressToGoal))}%`,
                }}
              />
            </div>
            <div style={styles.progressLabels}>
              <span>70.5kg (start)</span>
              <span style={styles.currentWeight}>{latestWeight}kg</span>
              <span>75kg (goal)</span>
            </div>
          </div>

          {/* Body Log History */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Body Log</h3>
            {bodyLog.length === 0 ? (
              <p style={styles.emptyText}>No entries yet.</p>
            ) : (
              <div style={styles.bodyLogGrid}>
                <div style={styles.bodyLogHeader}>
                  <span>Date</span>
                  <span>Weight</span>
                  <span>BF%</span>
                </div>
                {[...bodyLog]
                  .reverse()
                  .slice(0, 15)
                  .map((b, i) => (
                    <div key={i} style={styles.bodyLogRow}>
                      <span style={styles.bodyLogDate}>{b.date}</span>
                      <span style={styles.bodyLogVal}>{b.weight}kg</span>
                      <span style={styles.bodyLogVal}>
                        {b.bf ? `${b.bf}%` : "—"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Workout Stats */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Workout Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statNum}>{workoutLog.length}</span>
                <span style={styles.statLabel}>Total Sessions</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNum}>
                  {workoutLog.filter((w) => w.date >= todayKey().slice(0, 7))
                    .length}
                </span>
                <span style={styles.statLabel}>This Month</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNum}>
                  {(() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 6);
                    const weekAgo = d.toISOString().slice(0, 10);
                    return workoutLog.filter((w) => w.date >= weekAgo).length;
                  })()}
                </span>
                <span style={styles.statLabel}>This Week</span>
              </div>
            </div>
          </div>

          {/* Reset */}
          <button onClick={resetAll} style={styles.resetBtn}>
            Reset All Data
          </button>
        </div>
      )}

      {saving && <div style={styles.saveIndicator}>Saving...</div>}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    background: "#0a0a0f",
    color: "#e2e8f0",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    padding: "0 16px 32px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #1e293b",
    borderTop: "3px solid #f97316",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 0 16px",
    borderBottom: "1px solid #1e293b",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 4,
    color: "#f97316",
    margin: 0,
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    letterSpacing: 1,
  },
  streakBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#1a1a2e",
    borderRadius: 10,
    padding: "8px 14px",
    border: "1px solid #f9731630",
  },
  streakNum: {
    fontSize: 24,
    fontWeight: 800,
    color: "#f97316",
  },
  streakLabel: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tabs: {
    display: "flex",
    gap: 4,
    padding: "12px 0",
    borderBottom: "1px solid #1e293b",
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    background: "transparent",
    border: "1px solid #1e293b",
    borderRadius: 6,
    color: "#64748b",
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#f97316",
    color: "#0a0a0f",
    borderColor: "#f97316",
    fontWeight: 700,
  },
  content: { paddingTop: 16 },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#94a3b8",
    margin: "0 0 12px",
  },
  habitCount: {
    fontSize: 13,
    fontWeight: 700,
    color: "#f97316",
    marginBottom: 12,
  },
  habitBar: {
    height: 4,
    background: "#1e293b",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  habitBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f97316, #fb923c)",
    borderRadius: 2,
    transition: "width 0.3s ease",
  },
  habitRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 12px",
    background: "#111118",
    border: "1px solid #1e293b",
    borderRadius: 8,
    marginBottom: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#e2e8f0",
    fontSize: 13,
    transition: "all 0.15s",
    textAlign: "left",
  },
  habitDone: {
    borderColor: "#f9731640",
    background: "#f9731610",
  },
  habitIcon: { marginRight: 10, fontSize: 16 },
  habitLabel: { flex: 1, transition: "all 0.15s" },
  habitCheck: { color: "#f97316", fontWeight: 700, fontSize: 16 },
  workoutBtns: {
    display: "flex",
    gap: 8,
  },
  workoutTypeBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 8px",
    background: "#111118",
    border: "1px solid #1e293b",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#e2e8f0",
    transition: "all 0.15s",
  },
  workoutTypeLetter: {
    fontSize: 28,
    fontWeight: 800,
    color: "#f97316",
  },
  workoutTypeLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  bodyInputRow: {
    display: "flex",
    gap: 8,
  },
  bodyInput: {
    flex: 1,
    padding: "10px 12px",
    background: "#111118",
    border: "1px solid #1e293b",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  logBtn: {
    padding: "10px 20px",
    background: "#f97316",
    border: "none",
    borderRadius: 8,
    color: "#0a0a0f",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  // Workout screen
  workoutHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 0 16px",
    borderBottom: "1px solid #1e293b",
  },
  backBtn: {
    padding: "6px 12px",
    background: "#1e293b",
    border: "none",
    borderRadius: 6,
    color: "#94a3b8",
    fontFamily: "inherit",
    fontSize: 12,
    cursor: "pointer",
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#f97316",
    margin: 0,
    letterSpacing: 2,
  },
  exerciseList: { paddingTop: 16 },
  exerciseCard: {
    background: "#111118",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e2e8f0",
    marginBottom: 4,
  },
  targetText: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  setsGrid: { display: "flex", flexDirection: "column", gap: 6 },
  setRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  setLabel: {
    fontSize: 11,
    color: "#64748b",
    width: 40,
    flexShrink: 0,
  },
  setInput: {
    flex: 1,
    padding: "7px 10px",
    background: "#0a0a0f",
    border: "1px solid #1e293b",
    borderRadius: 6,
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    maxWidth: 80,
  },
  finishBtn: {
    width: "100%",
    padding: "14px 0",
    background: "#f97316",
    border: "none",
    borderRadius: 10,
    color: "#0a0a0f",
    fontWeight: 800,
    fontSize: 15,
    fontFamily: "inherit",
    cursor: "pointer",
    marginTop: 16,
    letterSpacing: 1,
  },
  // Log tab
  workoutLogCard: {
    background: "#111118",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  logCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logCardType: { fontWeight: 700, color: "#f97316", fontSize: 13 },
  logCardDate: { color: "#64748b", fontSize: 11 },
  logExercise: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    borderTop: "1px solid #1e293b10",
  },
  logExName: { fontSize: 12, color: "#94a3b8" },
  logExSets: { fontSize: 11, color: "#64748b" },
  emptyText: { color: "#475569", fontSize: 13, textAlign: "center", padding: 32 },
  // Progress tab
  progressBar: {
    height: 8,
    background: "#1e293b",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f97316, #fbbf24)",
    borderRadius: 4,
    transition: "width 0.5s ease",
  },
  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#64748b",
  },
  currentWeight: {
    color: "#f97316",
    fontWeight: 700,
  },
  bodyLogGrid: {},
  bodyLogHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    padding: "6px 0",
    fontSize: 10,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "1px solid #1e293b",
  },
  bodyLogRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    padding: "8px 0",
    fontSize: 12,
    borderBottom: "1px solid #1e293b10",
  },
  bodyLogDate: { color: "#64748b" },
  bodyLogVal: { color: "#e2e8f0", fontWeight: 600 },
  statsGrid: {
    display: "flex",
    gap: 8,
  },
  statCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    background: "#111118",
    border: "1px solid #1e293b",
    borderRadius: 10,
  },
  statNum: { fontSize: 28, fontWeight: 800, color: "#f97316" },
  statLabel: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
    textAlign: "center",
  },
  resetBtn: {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    border: "1px solid #ef444440",
    borderRadius: 8,
    color: "#ef4444",
    fontSize: 11,
    fontFamily: "inherit",
    cursor: "pointer",
    marginTop: 24,
  },
  saveIndicator: {
    position: "fixed",
    bottom: 16,
    right: 16,
    padding: "6px 12px",
    background: "#f97316",
    color: "#0a0a0f",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
};
