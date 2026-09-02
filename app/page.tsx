'use client';

import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  title: string;
  category: string;
  frequency: string;
  targetTime?: string;
}

interface DailyLog {
  id: string;
  date: string;
  completed: boolean;
  activityId: string;
}

interface SqlTopic {
  id: string;
  module: string;
  title: string;
  subtopics: string[];
  completedSubtopics: string[];
}

const ACTIVITIES_KEY = 'disc_hub_activities_v2';
const LOGS_KEY = 'disc_hub_logs_v2';
const SQL_KEY = 'disc_hub_sql_v2';
const TARGET_DATE_KEY = 'disc_hub_target_v2';

const DEFAULT_SQL_TOPICS: Omit<SqlTopic, 'completedSubtopics'>[] = [
  {
    id: 'm1',
    module: 'Fundamentals',
    title: 'Basic Queries & Filtering',
    subtopics: [
      'SELECT statements & retrieving columns',
      'Using aliases (AS keyword)',
      'Filtering rows with WHERE clause',
      'Combining conditions with AND, OR, NOT',
      'Using IN, NOT IN, and BETWEEN',
      'Pattern matching with LIKE',
      'Handling NULL values',
      'Removing duplicates with DISTINCT'
    ]
  },
  {
    id: 'm2',
    module: 'Aggregations',
    title: 'Aggregate Functions & Grouping',
    subtopics: [
      'Counting records with COUNT()',
      'Calculating SUM() and AVG()',
      'Finding MIN() and MAX()',
      'Grouping data with GROUP BY',
      'Filtering groups with HAVING',
      'Conditional logic with CASE WHEN'
    ]
  },
  {
    id: 'm3',
    module: 'Joins',
    title: 'Table Relationships & Joins',
    subtopics: [
      'Primary Keys & Foreign Keys',
      'Inner Joins',
      'Left & Right Outer Joins',
      'Full Outer Joins & Self Joins',
      'Set Operations (UNION, INTERSECT)'
    ]
  },
  {
    id: 'm4',
    module: 'Advanced',
    title: 'Subqueries & Window Functions',
    subtopics: [
      'Scalar & Correlated Subqueries',
      'Common Table Expressions (CTEs)',
      'Window Functions (OVER, PARTITION BY)',
      'Ranking (ROW_NUMBER, RANK, DENSE_RANK)',
      'Value analysis (LAG, LEAD)'
    ]
  }
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<'habits' | 'sql' | 'matrix'>('habits');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');
  const [sqlTopics, setSqlTopics] = useState<SqlTopic[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    // Load local storage data safely
    const savedActs = localStorage.getItem(ACTIVITIES_KEY);
    if (savedActs) setActivities(JSON.parse(savedActs));

    const savedLogs = localStorage.getItem(LOGS_KEY);
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedSql = localStorage.getItem(SQL_KEY);
    if (savedSql) {
      setSqlTopics(JSON.parse(savedSql));
    } else {
      const initial = DEFAULT_SQL_TOPICS.map(t => ({ ...t, completedSubtopics: [] }));
      setSqlTopics(initial);
      localStorage.setItem(SQL_KEY, JSON.stringify(initial));
    }

    const savedTarget = localStorage.getItem(TARGET_DATE_KEY);
    if (savedTarget) setTargetDate(savedTarget);

    const savedNote = localStorage.getItem(`note_${currentDate}`);
    if (savedNote) setNote(savedNote);
    else setNote('');
  }, [currentDate]);

  function saveActivitiesToStorage(newActs: Activity[]) {
    setActivities(newActs);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(newActs));
  }

  function saveLogsToStorage(newLogs: DailyLog[]) {
    setLogs(newLogs);
    localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
  }

  function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const newAct: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      category,
      frequency: 'Daily'
    };
    saveActivitiesToStorage([...activities, newAct]);
    setTitle('');
    setShowAddForm(false);
  }

  function handleDeleteActivity(id: string) {
    saveActivitiesToStorage(activities.filter(a => a.id !== id));
    saveLogsToStorage(logs.filter(l => l.activityId !== id));
  }

  function toggleLogCompletion(activityId: string) {
    const existingIndex = logs.findIndex(l => l.activityId === activityId && l.date === currentDate);
    let updatedLogs = [...logs];
    if (existingIndex > -1) {
      updatedLogs[existingIndex].completed = !updatedLogs[existingIndex].completed;
    } else {
      updatedLogs.push({
        id: Math.random().toString(36).substring(2, 9),
        activityId,
        date: currentDate,
        completed: true
      });
    }
    saveLogsToStorage(updatedLogs);
  }

  function toggleSqlSubtopic(topicId: string, sub: string) {
    const updated = sqlTopics.map(t => {
      if (t.id === topicId) {
        const exists = t.completedSubtopics.includes(sub);
        const newSubs = exists ? t.completedSubtopics.filter(s => s !== sub) : [...t.completedSubtopics, sub];
        return { ...t, completedSubtopics: newSubs };
      }
      return t;
    });
    setSqlTopics(updated);
    localStorage.setItem(SQL_KEY, JSON.stringify(updated));
  }

  function handleNoteChange(val: string) {
    setNote(val);
    localStorage.setItem(`note_${currentDate}`, val);
  }

  // Calculations
  const todayLogs = logs.filter(l => l.date === currentDate && l.completed);
  const completionRate = activities.length > 0 ? Math.round((todayLogs.length / activities.length) * 100) : 0;

  let totalSubs = 0;
  let doneSubs = 0;
  sqlTopics.forEach(t => {
    totalSubs += t.subtopics.length;
    doneSubs += t.completedSubtopics.length;
  });
  const sqlRate = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

  const daysLeft = Math.max(0, Math.ceil((new Date(targetDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)));

  // Past 7 days matrix
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              ⚡ Discipline & Habit Hub Pro
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Uncompromising focus, granular tracking, and clean execution.</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={currentDate} 
              onChange={e => setCurrentDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-xl text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* STATS & TARGET BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Mission Target Countdown</span>
              <div className="text-2xl font-black mt-0.5">{daysLeft} Days Left</div>
            </div>
            <input 
              type="date" 
              value={targetDate} 
              onChange={e => { setTargetDate(e.target.value); localStorage.setItem(TARGET_DATE_KEY, e.target.value); }}
              className="bg-slate-800 border border-slate-700 text-[10px] p-1.5 rounded-lg text-slate-300"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Today's Progress</span>
              <div className="text-2xl font-black mt-0.5">{completionRate}% Done</div>
            </div>
            <div className="text-xs px-2.5 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg font-bold">
              {todayLogs.length}/{activities.length} Habits
            </div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1">
          <button 
            onClick={() => setActiveTab('habits')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${activeTab === 'habits' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Daily Habits
          </button>
          <button 
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${activeTab === 'sql' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            SQL Roadmap ({sqlRate}%)
          </button>
          <button 
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${activeTab === 'matrix' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Weekly Matrix
          </button>
        </div>

        {/* TAB 1: HABITS */}
        {activeTab === 'habits' && (
          <div className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-200">Daily Task Board ({currentDate})</h2>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition"
                >
                  {showAddForm ? 'Cancel' : '+ New Habit'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddActivity} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="Habit title (e.g. Study SQL, Workout)..." 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                  </select>
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium">Save</button>
                </form>
              )}

              <div className="space-y-2">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No habits added yet. Click '+ New Habit' to begin.</p>
                ) : (
                  activities.map(act => {
                    const isDone = logs.some(l => l.activityId === act.id && l.date === currentDate && l.completed);
                    return (
                      <div key={act.id} className={`flex items-center justify-between p-3 rounded-xl border transition ${isDone ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-slate-800/40 border-slate-700/60'}`}>
                        <div onClick={() => toggleLogCompletion(act.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900 text-transparent'}`}>
                            ✓
                          </div>
                          <div>
                            <div className={`text-xs font-medium ${isDone ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>{act.title}</div>
                            <span className="text-[10px] text-slate-400">{act.category}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteActivity(act.id)} className="text-slate-500 hover:text-red-400 text-xs px-2 py-1">
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Daily Reflection Note */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
              <label className="text-xs font-bold text-slate-300">Daily Focus Note ({currentDate})</label>
              <textarea 
                rows={2}
                value={note}
                onChange={e => handleNoteChange(e.target.value)}
                placeholder="Log your deep work notes or key takeaways..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SQL ROADMAP */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">SQL Mastery Progress</span>
              <span className="text-xs font-mono text-emerald-400">{doneSubs} / {totalSubs} subtopics ({sqlRate}%)</span>
            </div>

            {sqlTopics.map(topic => (
              <div key={topic.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-200">{topic.title}</h3>
                  <span className="text-[10px] bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded-md">{topic.module}</span>
                </div>
                <div className="space-y-1.5">
                  {topic.subtopics.map((sub, idx) => {
                    const isDone = topic.completedSubtopics.includes(sub);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleSqlSubtopic(topic.id, sub)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition ${isDone ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900 text-transparent'}`}>
                          ✓
                        </div>
                        <span className={isDone ? 'line-through' : ''}>{sub}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: WEEKLY MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl overflow-x-auto">
            <h2 className="text-xs font-bold text-slate-200">Weekly Consistency Matrix (Past 7 Days)</h2>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No habits recorded yet.</p>
            ) : (
              <div className="min-w-[450px] space-y-2">
                <div className="grid grid-cols-8 gap-1 text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                  <div>Habit</div>
                  {pastDays.map(d => (
                    <div key={d} className="text-center">{d.slice(5)}</div>
                  ))}
                </div>
                {activities.map(act => (
                  <div key={act.id} className="grid grid-cols-8 gap-1 items-center text-xs py-1">
                    <div className="truncate text-slate-300 font-medium pr-1">{act.title}</div>
                    {pastDays.map(d => {
                      const logged = logs.some(l => l.activityId === act.id && l.date === d && l.completed);
                      return (
                        <div key={d} className="flex justify-center">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${logged ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                            {logged ? '✓' : '·'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
