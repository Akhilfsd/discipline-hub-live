'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'Daily Habits & Scan' | 'SQL Roadmap (0/41)' | 'Pomodoro Timer' | 'Analytics & Heatmap';

interface Habit {
  id: string;
  title: string;
  category: 'Health' | 'Productivity' | 'Mindset' | 'Habits';
  completed: { [date: string]: boolean };
}

const initialHabits: Habit[] = [
  { id: 'h1', title: 'power bi lecture', category: 'Productivity', completed: {} },
];

const MISSION_TARGET_DATE = '2026-12-02';

export default function DisciplineHubPro() {
  const [activeTab, setActiveTab] = useState<Tab>('Daily Habits & Scan');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [reflection, setReflection] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Health' | 'Productivity' | 'Mindset' | 'Habits'>('Productivity');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    const savedHabits = localStorage.getItem('dh_habits');
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    
    const savedReflection = localStorage.getItem(`dh_reflection_${currentDate}`);
    if (savedReflection) setReflection(savedReflection);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dh_habits', JSON.stringify(habits));
  }, [habits]);

  const todayHabits = habits.filter(h => h.completed[currentDate]);
  const completionPercent = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;
  const grade = completionPercent >= 90 ? 'A' : completionPercent >= 80 ? 'B' : completionPercent >= 70 ? 'C' : completionPercent >= 60 ? 'D' : 'F';

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

  const handleReflectionChange = (value: string) => {
    setReflection(value);
    localStorage.setItem(`dh_reflection_${currentDate}`, value);
  };

  // Explicit width/height on SVGs to prevent blowup bugs
  const renderIcon = (name: string) => {
    const attr = { width: 18, height: 18, style: { minWidth: 18, minHeight: 18 } };
    switch (name) {
      case 'Shield': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.059A11.955 11.955 0 012.944 12c0 3.346 1.432 6.357 3.708 8.456a11.955 11.955 0 008.618 3.059A11.955 11.955 0 0021.056 12c0-3.346-1.432-6.357-3.708-8.456z"></path></svg>;
      case 'Book': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
      case 'List': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
      case 'SQL': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
      case 'Clock': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case 'Chart': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
      case 'Calendar': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
      case 'Download': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
      case 'Camera': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
      case 'Plus': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>;
      default: return null;
    }
  };

  const filteredHabits = filterCategory === 'All' 
    ? habits 
    : habits.filter(h => h.category === filterCategory);

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* MISSION COUNTDOWN BANNER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '14px', display: 'flex' }}>{renderIcon('Shield')}</div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', letterSpacing: '0.05em', margin: 0 }}>MISSION COUNTDOWN TARGET</p>
              <p style={{ fontSize: '18px', fontWeight: '900', color: '#f8fafc', margin: '4px 0 0 0' }}>{daysRemaining} Days remaining until target date</p>
            </div>
          </div>
          <button style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '12px', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderIcon('Calendar')}
            Change Target Date ({MISSION_TARGET_DATE})
          </button>
        </div>

        {/* QUOTE CARD */}
        <div style={{ backgroundColor: '#161b2e', borderRadius: '16px', padding: '16px 20px', border: '1px solid #1e293b', fontStyle: 'italic', color: '#cbd5e1', fontSize: '14px' }}>
          "Your future self is built in the hours you spend alone working in silence."
        </div>

        {/* MAIN DASHBOARD HEADER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', padding: '14px', borderRadius: '16px', display: 'flex' }}>{renderIcon('Book')}</div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', margin: 0 }}>Discipline & Habit Hub Pro</h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Uncompromising focus, smart tracking, and granular SQL mastery.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {renderIcon('Calendar')}
              {currentDate.split('-').reverse().join('-')}
            </div>
            <button style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex' }}>
              {renderIcon('Download')}
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '8px', borderRadius: '16px', display: 'flex', gap: '8px' }}>
          {[
            { name: 'Daily Habits & Scan', icon: 'List' },
            { name: 'SQL Roadmap (0/41)', icon: 'SQL' },
            { name: 'Pomodoro Timer', icon: 'Clock' },
            { name: 'Analytics & Heatmap', icon: 'Chart' },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name as Tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                border: activeTab === tab.name ? '1px solid #059669' : '1px solid transparent',
                backgroundColor: activeTab === tab.name ? '#064e3b' : 'transparent',
                color: activeTab === tab.name ? '#34d399' : '#94a3b8',
              }}
            >
              {renderIcon(tab.icon)}
              {tab.name}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: DAILY HABITS & SCAN */}
        {activeTab === 'Daily Habits & Scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* COMPLETION RATE */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderIcon('List')}
                  <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Today's Completion Rate</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#451a03', color: '#fde047', border: '1px solid #713f12' }}>
                    GRADE: {grade}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#34d399' }}>{completionPercent}%</span>
                </div>
              </div>
              <div style={{ width: '100%', backgroundColor: '#1e293b', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercent}%`, backgroundColor: '#34d399', height: '100%', transition: 'width 0.3s ease' }}></div>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', margin: 0 }}>
                {todayHabits.length} of {habits.length} habits completed for {currentDate}
              </p>
            </div>

            {/* DAILY REFLECTION */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {renderIcon('Book')}
                <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Daily Reflection & Focus Log ({currentDate})</h2>
              </div>
              <textarea
                rows={3}
                value={reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="Log your deep work wins or distractions conquered today..."
                style={{ width: '100%', backgroundColor: '#161b2e', border: '1px solid #334155', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#f8fafc', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* DAILY TASK BOARD */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Daily Task Board</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
                    {['All', 'Health', 'Productivity', 'Mindset', 'Habits'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
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
                    style={{ backgroundColor: '#059669', color: '#fff', border: 'none', fontSize: '12px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                  >
                    {renderIcon('Plus')}
                    New Activity
                  </button>
                </div>
              </div>

              {showAddModal && (
                <form onSubmit={handleAddHabit} style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '12px', borderRadius: '12px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter activity title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontSize: '12px', color: '#fff', outline: 'none' }}
                    autoFocus
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontSize: '12px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Habits">Habits</option>
                  </select>
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredHabits.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No tasks found in this category.</p>
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
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: isCompleted ? '1px solid #065f46' : '1px solid #1e293b',
                          backgroundColor: isCompleted ? '#064e3b33' : '#161b2e'
                        }}
                      >
                        <div 
                          onClick={() => toggleHabit(habit.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold',
                            border: isCompleted ? '1px solid #34d399' : '1px solid #475569',
                            backgroundColor: isCompleted ? '#34d399' : '#0f172a',
                            color: isCompleted ? '#020617' : 'transparent'
                          }}>
                            ✓
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '500', display: 'block', color: isCompleted ? '#34d399' : '#f8fafc', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                              {habit.title}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block', backgroundColor: '#1e293b', color: '#94a3b8' }}>
                              {habit.category}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteHabit(habit.id)}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
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

        {activeTab !== 'Daily Habits & Scan' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>{activeTab} Module</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>This section is synced and prepped.</p>
          </div>
        )}

      </div>
    </div>
  );
}
