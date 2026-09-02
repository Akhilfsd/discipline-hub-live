'use client';

import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  title: string;
  category: string;
  frequency: string;
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

const ACTIVITIES_KEY = 'disc_hub_acts_v3';
const LOGS_KEY = 'disc_hub_logs_v3';
const SQL_KEY = 'disc_hub_sql_v3';
const TARGET_KEY = 'disc_hub_target_v3';

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

    const savedTarget = localStorage.getItem(TARGET_KEY);
    if (savedTarget) setTargetDate(savedTarget);

    const savedNote = localStorage.getItem(`note_${currentDate}`);
    if (savedNote) setNote(savedNote);
    else setNote('');
  }, [currentDate]);

  function saveActivities(newActs: Activity[]) {
    setActivities(newActs);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(newActs));
  }

  function saveLogs(newLogs: DailyLog[]) {
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
    saveActivities([...activities, newAct]);
    setTitle('');
    setShowAddForm(false);
  }

  function handleDeleteActivity(id: string) {
    saveActivities(activities.filter(a => a.id !== id));
    saveLogs(logs.filter(l => l.activityId !== id));
  }

  function toggleLog(activityId: string) {
    const idx = logs.findIndex(l => l.activityId === activityId && l.date === currentDate);
    let updated = [...logs];
    if (idx > -1) {
      updated[idx].completed = !updated[idx].completed;
    } else {
      updated.push({ id: Math.random().toString(36).substring(2, 9), activityId, date: currentDate, completed: true });
    }
    saveLogs(updated);
  }

  function toggleSql(topicId: string, sub: string) {
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
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* HEADER */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#34d399', margin: 0 }}>⚡ Discipline & Habit Hub Pro</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Uncompromising focus, clean execution.</p>
          </div>
          <input 
            type="date" 
            value={currentDate} 
            onChange={e => setCurrentDate(e.target.value)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px', padding: '8px 12px', borderRadius: '10px', outline: 'none' }}
          />
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#818cf8', textTransform: 'uppercase' }}>Target Countdown</span>
              <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '2px' }}>{daysLeft} Days</div>
            </div>
            <input 
              type="date" 
              value={targetDate} 
              onChange={e => { setTargetDate(e.target.value); localStorage.setItem(TARGET_KEY, e.target.value); }}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '10px', padding: '4px', borderRadius: '6px' }}
            />
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#34d399', textTransform: 'uppercase' }}>Today's Progress</span>
              <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '2px' }}>{completionRate}%</div>
            </div>
            <div style={{ fontSize: '11px', background: 'rgba(6, 78, 59, 0.6)', border: '1px solid #065f46', color: '#34d399', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
              {todayLogs.length}/{activities.length} Done
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '6px', display: 'flex', gap: '6px' }}>
          <button onClick={() => setActiveTab('habits')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '10px', border: 'none', background: activeTab === 'habits' ? '#059669' : 'transparent', color: activeTab === 'habits' ? '#fff' : '#94a3b8', cursor: 'pointer' }}>Daily Habits</button>
          <button onClick={() => setActiveTab('sql')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '10px', border: 'none', background: activeTab === 'sql' ? '#059669' : 'transparent', color: activeTab === 'sql' ? '#fff' : '#94a3b8', cursor: 'pointer' }}>SQL Roadmap ({sqlRate}%)</button>
          <button onClick={() => setActiveTab('matrix')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '10px', border: 'none', background: activeTab === 'matrix' ? '#059669' : 'transparent', color: activeTab === 'matrix' ? '#fff' : '#94a3b8', cursor: 'pointer' }}>Weekly Matrix</button>
        </div>

        {/* TAB 1: HABITS */}
        {activeTab === 'habits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Daily Task Board</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{showAddForm ? 'Cancel' : '+ New Habit'}</button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddActivity} style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Habit title..." value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '12px', outline: 'none' }}>
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                  </select>
                  <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '20px 0', margin: 0 }}>No habits added yet. Click '+ New Habit' to begin.</p>
                ) : (
                  activities.map(act => {
                    const isDone = logs.some(l => l.activityId === act.id && l.date === currentDate && l.completed);
                    return (
                      <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDone ? 'rgba(6, 78, 59, 0.2)' : '#1e293b', border: `1px solid ${isDone ? '#065f46' : '#334155'}`, padding: '12px 16px', borderRadius: '12px' }}>
                        <div onClick={() => toggleLog(act.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `1px solid ${isDone ? '#34d399' : '#475569'}`, background: isDone ? '#34d399' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', fontSize: '11px', fontWeight: 'bold' }}>
                            {isDone ? '✓' : ''}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: isDone ? '#6ee7b7' : '#f8fafc', textDecoration: isDone ? 'line-through' : 'none' }}>{act.title}</div>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{act.category}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteActivity(act.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}>Daily Focus Note ({currentDate})</label>
              <textarea 
                rows={3}
                value={note}
                onChange={e => { setNote(e.target.value); localStorage.setItem(`note_${currentDate}`, e.target.value); }}
                placeholder="Log your deep work wins or distractions conquered..."
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#f8fafc', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: SQL ROADMAP */}
        {activeTab === 'sql' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>SQL Mastery Progress</span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#34d399', fontWeight: 'bold' }}>{doneSubs} / {totalSubs} subtopics ({sqlRate}%)</span>
            </div>

            {sqlTopics.map(topic => (
              <div key={topic.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{topic.title}</h3>
                  <span style={{ fontSize: '10px', background: '#1e293b', border: '1px solid #334155', color: '#818cf8', padding: '4px 8px', borderRadius: '6px' }}>{topic.module}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {topic.subtopics.map((sub, idx) => {
                    const isDone = topic.completedSubtopics.includes(sub);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleSql(topic.id, sub)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isDone ? 'rgba(6, 78, 59, 0.2)' : '#1e293b', border: `1px solid ${isDone ? '#065f46' : '#334155'}`, padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', color: isDone ? '#6ee7b7' : '#cbd5e1' }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `1px solid ${isDone ? '#34d399' : '#475569'}`, background: isDone ? '#34d399' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', fontSize: '10px', fontWeight: 'bold' }}>
                          {isDone ? '✓' : ''}
                        </div>
                        <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{sub}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: MATRIX */}
        {activeTab === 'matrix' && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'auto' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Weekly Consistency Matrix (Past 7 Days)</h2>
            {activities.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '20px 0', margin: 0 }}>No habits recorded yet.</p>
            ) : (
              <div style={{ minWidth: '420px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(7, 1fr)', gap: '4px', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <div>Habit</div>
                  {pastDays.map(d => <div key={d} style={{ textAlign: 'center' }}>{d.slice(5)}</div>)}
                </div>
                {activities.map(act => (
                  <div key={act.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(7, 1fr)', gap: '4px', alignItems: 'center', fontSize: '11px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1', fontWeight: '500' }}>{act.title}</div>
                    {pastDays.map(d => {
                      const logged = logs.some(l => l.activityId === act.id && l.date === d && l.completed);
                      return (
                        <div key={d} style={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: logged ? '#34d399' : '#1e293b', color: logged ? '#020617' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                            {logged ? '✓' : '·'}
                          </div>
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
    </div>
  );
}
