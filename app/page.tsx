'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'Daily Habits & Scan' | 'SQL Roadmap (0/41)' | 'Pomodoro Timer' | 'Analytics & Heatmap';

interface Habit {
  id: string;
  title: string;
  category: 'Health' | 'Productivity' | 'Mindset' | 'Habits';
  completed: { [date: string]: boolean };
}

interface SqlTopic {
  id: number;
  title: string;
  category: string;
  completed: boolean;
}

const initialHabits: Habit[] = [
  { id: 'h1', title: 'power bi lecture', category: 'Productivity', completed: {} },
  { id: 'h2', title: 'LeetCode SQL Practice', category: 'Productivity', completed: {} },
  { id: 'h3', title: 'Morning Workout', category: 'Health', completed: {} },
];

const initialSqlRoadmap: SqlTopic[] = Array.from({ length: 41 }, (_, i) => ({
  id: i + 1,
  title: `SQL Topic Module ${i + 1}: Fundamentals & Advanced Queries`,
  category: i < 15 ? 'Basics & Joins' : i < 30 ? 'Aggregations & Subqueries' : 'Window Functions & Performance',
  completed: false,
}));

const MISSION_TARGET_DATE = '2026-12-02';

export default function DisciplineHubPro() {
  const [activeTab, setActiveTab] = useState<Tab>('Daily Habits & Scan');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [sqlRoadmap, setSqlRoadmap] = useState<SqlTopic[]>(initialSqlRoadmap);
  const [reflection, setReflection] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Health' | 'Productivity' | 'Mindset' | 'Habits'>('Productivity');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Pomodoro States
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  // Load persistence
  useEffect(() => {
    const savedHabits = localStorage.getItem('dh_habits');
    if (savedHabits) setHabits(JSON.parse(savedHabits));

    const savedSql = localStorage.getItem('dh_sql_roadmap');
    if (savedSql) setSqlRoadmap(JSON.parse(savedSql));
  }, []);

  useEffect(() => {
    const savedReflection = localStorage.getItem(`dh_reflection_${currentDate}`);
    setReflection(savedReflection || '');
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dh_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('dh_sql_roadmap', JSON.stringify(sqlRoadmap));
  }, [sqlRoadmap]);

  // Pomodoro Timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => setPomodoroSeconds(prev => prev - 1), 1000);
    } else if (pomodoroSeconds === 0) {
      setIsPomodoroRunning(false);
      alert(pomodoroMode === 'work' ? 'Pomodoro Session Finished! Take a break.' : 'Break ended! Back to work.');
    }
    return () => clearInterval(timer);
  }, [isPomodoroRunning, pomodoroSeconds, pomodoroMode]);

  const todayHabits = habits.filter(h => h.completed[currentDate]);
  const completionPercent = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;
  const grade = completionPercent >= 90 ? 'A' : completionPercent >= 80 ? 'B' : completionPercent >= 70 ? 'C' : completionPercent >= 60 ? 'D' : 'F';

  const completedSqlCount = sqlRoadmap.filter(s => s.completed).length;

  const timeDifference = new Date(MISSION_TARGET_DATE).getTime() - new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));

  const toggleHabit = (id: string) => {
    setHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === id
          ? { ...h, completed: { ...h.completed, [currentDate]: !h.completed[currentDate] } }
          : h
      )
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newHabitItem: Habit = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      category: newCategory,
      completed: {}
    };
    setHabits([...habits, newHabitItem]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleSqlTopic = (id: number) => {
    setSqlRoadmap(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleReflectionChange = (value: string) => {
    setReflection(value);
    localStorage.setItem(`dh_reflection_${currentDate}`, value);
  };

  const renderIcon = (name: string) => {
    const attr = { width: 22, height: 22, style: { minWidth: 22, minHeight: 22 } };
    switch (name) {
      case 'Shield': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.059A11.955 11.955 0 012.944 12c0 3.346 1.432 6.357 3.708 8.456a11.955 11.955 0 008.618 3.059A11.955 11.955 0 0021.056 12c0-3.346-1.432-6.357-3.708-8.456z"></path></svg>;
      case 'Book': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
      case 'List': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
      case 'SQL': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
      case 'Clock': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case 'Chart': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
      case 'Calendar': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
      case 'Plus': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v16m8-8H4"></path></svg>;
      default: return null;
    }
  };

  const filteredHabits = filterCategory === 'All' ? habits : habits.filter(h => h.category === filterCategory);

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '32px 48px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* MISSION COUNTDOWN BANNER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '18px', display: 'flex' }}>{renderIcon('Shield')}</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#818cf8', letterSpacing: '0.05em', margin: 0 }}>MISSION COUNTDOWN TARGET</p>
              <p style={{ fontSize: '22px', fontWeight: '900', color: '#f8fafc', margin: '6px 0 0 0' }}>{daysRemaining} Days remaining until target date</p>
            </div>
          </div>
          <button style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '14px', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            {renderIcon('Calendar')}
            Target Date ({MISSION_TARGET_DATE})
          </button>
        </div>

        {/* QUOTE CARD */}
        <div style={{ backgroundColor: '#161b2e', borderRadius: '20px', padding: '20px 28px', border: '1px solid #1e293b', fontStyle: 'italic', color: '#cbd5e1', fontSize: '16px' }}>
          "Your future self is built in the hours you spend alone working in silence."
        </div>

        {/* MAIN DASHBOARD HEADER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', padding: '18px', borderRadius: '20px', display: 'flex' }}>{renderIcon('Book')}</div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#34d399', margin: 0 }}>Discipline & Habit Hub Pro</h1>
              <p style={{ fontSize: '15px', color: '#94a3b8', margin: '6px 0 0 0' }}>Uncompromising focus, smart tracking, and granular SQL mastery.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', padding: '10px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
              {renderIcon('Calendar')}
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '10px', borderRadius: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { name: 'Daily Habits & Scan', icon: 'List' },
            { name: `SQL Roadmap (${completedSqlCount}/41)`, icon: 'SQL' },
            { name: 'Pomodoro Timer', icon: 'Clock' },
            { name: 'Analytics & Heatmap', icon: 'Chart' },
          ].map((tab) => {
            const rawName = tab.name.startsWith('SQL Roadmap') ? 'SQL Roadmap (0/41)' : tab.name;
            const isSelected = activeTab === rawName;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(rawName as Tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 22px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #059669' : '1px solid transparent',
                  backgroundColor: isSelected ? '#064e3b' : 'transparent',
                  color: isSelected ? '#34d399' : '#94a3b8',
                }}
              >
                {renderIcon(tab.icon)}
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DAILY HABITS & SCAN */}
        {activeTab === 'Daily Habits & Scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderIcon('List')}
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Today's Completion Rate ({currentDate})</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#451a03', color: '#fde047', border: '1px solid #713f12' }}>
                    GRADE: {grade}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>{completionPercent}%</span>
                </div>
              </div>
              <div style={{ width: '100%', backgroundColor: '#1e293b', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercent}%`, backgroundColor: '#34d399', height: '100%', transition: 'width 0.3s ease' }}></div>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'right', margin: 0 }}>
                {todayHabits.length} of {habits.length} habits completed
              </p>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {renderIcon('Book')}
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Daily Reflection & Focus Log ({currentDate})</h2>
              </div>
              <textarea
                rows={4}
                value={reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="Log your deep work wins or distractions conquered today..."
                style={{ width: '100%', backgroundColor: '#161b2e', border: '1px solid #334155', borderRadius: '16px', padding: '16px', fontSize: '14px', color: '#f8fafc', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Daily Task Board</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '6px', borderRadius: '14px', display: 'flex', gap: '6px' }}>
                    {['All', 'Health', 'Productivity', 'Mindset', 'Habits'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        style={{
                          fontSize: '13px',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          backgroundColor: filterCategory === cat ? '#334155' : 'transparent',
                          color: filterCategory === cat ? '#f8fafc' : '#94a3b8'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    style={{ backgroundColor: '#059669', color: '#fff', border: 'none', fontSize: '14px', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}
                  >
                    {renderIcon('Plus')}
                    New Activity
                  </button>
                </div>
              </div>

              {showAddModal && (
                <form onSubmit={handleAddHabit} style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Enter activity title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ flex: 1, minWidth: '220px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px', fontSize: '14px', color: '#fff', outline: 'none' }}
                    autoFocus
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px', fontSize: '14px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Habits">Habits</option>
                  </select>
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: '700' }}>Add</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredHabits.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '30px' }}>No tasks found in this category.</p>
                ) : (
                  filteredHabits.map(habit => {
                    const isCompleted = !!habit.completed[currentDate];
                    return (
                      <div 
                        key={habit.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderRadius: '16px',
                          border: isCompleted ? '1px solid #065f46' : '1px solid #1e293b',
                          backgroundColor: isCompleted ? '#064e3b33' : '#161b2e'
                        }}
                      >
                        <div 
                          onClick={() => toggleHabit(habit.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flex: 1 }}
                        >
                          <div style={{
                            width: '26px', height: '26px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold',
                            border: isCompleted ? '1px solid #34d399' : '1px solid #475569',
                            backgroundColor: isCompleted ? '#34d399' : '#0f172a',
                            color: isCompleted ? '#020617' : 'transparent'
                          }}>
                            ✓
                          </div>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: '600', display: 'block', color: isCompleted ? '#34d399' : '#f8fafc', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                              {habit.title}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', marginTop: '6px', display: 'inline-block', backgroundColor: '#1e293b', color: '#94a3b8' }}>
                              {habit.category}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteHabit(habit.id)}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px', padding: '6px' }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SQL ROADMAP (0/41) */}
        {activeTab === 'SQL Roadmap (0/41)' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', margin: 0 }}>SQL Mastery Roadmap ({completedSqlCount}/41 Completed)</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Check off each modular concept as you lock it in.</p>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#818cf8' }}>
                {Math.round((completedSqlCount / 41) * 100)}% Finished
              </div>
            </div>
            
            <div style={{ width: '100%', backgroundColor: '#1e293b', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${(completedSqlCount / 41) * 100}%`, backgroundColor: '#34d399', height: '100%', transition: 'width 0.3s ease' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', maxHeight: '600px', overflowY: 'auto', paddingRight: '6px' }}>
              {sqlRoadmap.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => toggleSqlTopic(topic.id)}
                  style={{
                    backgroundColor: topic.completed ? '#064e3b33' : '#161b2e',
                    border: topic.completed ? '1px solid #059669' : '1px solid #1e293b',
                    padding: '16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                    border: topic.completed ? '1px solid #34d399' : '1px solid #475569',
                    backgroundColor: topic.completed ? '#34d399' : '#0f172a',
                    color: topic.completed ? '#020617' : 'transparent'
                  }}>
                    ✓
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: topic.completed ? '#34d399' : '#f8fafc', display: 'block' }}>
                      {topic.title}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', display: 'inline-block' }}>
                      {topic.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: POMODORO TIMER */}
        {activeTab === 'Pomodoro Timer' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', margin: 0 }}>Uncompromising Deep Work Timer</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setPomodoroMode('work'); setPomodoroSeconds(25 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: pomodoroMode === 'work' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Work (25m)
              </button>
              <button 
                onClick={() => { setPomodoroMode('break'); setPomodoroSeconds(5 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: pomodoroMode === 'break' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Break (5m)
              </button>
            </div>
            
            <div style={{ fontSize: '72px', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.05em' }}>
              {String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0')}:{String(pomodoroSeconds % 60).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                style={{ backgroundColor: isPomodoroRunning ? '#dc2626' : '#059669', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isPomodoroRunning ? 'Pause Session' : 'Start Focus'}
              </button>
              <button 
                onClick={() => { setIsPomodoroRunning(false); setPomodoroSeconds(pomodoroMode === 'work' ? 25 * 60 : 5 * 60); }}
                style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '14px 24px', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & HEATMAP */}
        {activeTab === 'Analytics & Heatmap' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', margin: 0 }}>Consistency Matrix & Analytics</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Review your cumulative execution scores and long-term discipline scorecards.</p>
            
            <div style={{ backgroundColor: '#161b2e', padding: '24px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Current Streak Status</p>
              <p style={{ fontSize: '28px', fontWeight: '900', color: '#34d399', margin: 0 }}>🔥 3 Day Active Streak</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Keep logging your daily habits before midnight to maintain momentum.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
