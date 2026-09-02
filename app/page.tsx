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
  notes: string;
  syntax: string;
  problem: string;
  solution: string;
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
  notes: `Core concept notes for module ${i + 1}. Focuses on execution flow, optimization techniques, and avoiding common query pitfalls in production databases.`,
  syntax: `SELECT column1, aggregate_function(column2)\nFROM table_name\nWHERE condition\nGROUP BY column1;`,
  problem: `Practical Challenge ${i + 1}: Write a query to retrieve records matching specific conditional aggregations while filtering out null datasets.`,
  solution: `SELECT column1, COUNT(*) \nFROM table_name \nWHERE column2 IS NOT NULL \nGROUP BY column1;`
}));

const disciplineQuotes = [
  "Your future self is built in the hours you spend alone working in silence.",
  "Discipline is choosing between what you want now and what you want most.",
  "We suffer more in imagination than in reality. Execution cures all anxiety.",
  "Small daily disciplines repeated consistently lead to great achievements.",
  "Action isn't just the effect of motivation; it's also the cause of it.",
  "Focus is saying no to a hundred other good ideas that exist.",
  "Consistency beats intensity when intensity refuses to be consistent.",
  "Success is neither magical nor mysterious. It is the natural consequence of consistent fundamentals."
];

export default function DisciplineHubPro() {
  const [activeTab, setActiveTab] = useState<Tab>('Daily Habits & Scan');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState<string>('2026-12-02');
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [sqlRoadmap, setSqlRoadmap] = useState<SqlTopic[]>(initialSqlRoadmap);
  const [selectedSqlTopic, setSelectedSqlTopic] = useState<SqlTopic | null>(null);

  const [reflection, setReflection] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Health' | 'Productivity' | 'Mindset' | 'Habits'>('Productivity');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Pomodoro States
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  // Load persistence on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('dh_habits');
    if (savedHabits) setHabits(JSON.parse(savedHabits));

    const savedSql = localStorage.getItem('dh_sql_roadmap');
    if (savedSql) setSqlRoadmap(JSON.parse(savedSql));

    const savedTarget = localStorage.getItem('dh_target_date');
    if (savedTarget) setTargetDate(savedTarget);
  }, []);

  // Load reflection when currentDate changes
  useEffect(() => {
    const savedReflection = localStorage.getItem(`dh_reflection_${currentDate}`);
    setReflection(savedReflection || '');
  }, [currentDate]);

  // Save habits
  useEffect(() => {
    localStorage.setItem('dh_habits', JSON.stringify(habits));
  }, [habits]);

  // Save SQL roadmap
  useEffect(() => {
    localStorage.setItem('dh_sql_roadmap', JSON.stringify(sqlRoadmap));
  }, [sqlRoadmap]);

  const handleTargetDateChange = (newDate: string) => {
    setTargetDate(newDate);
    localStorage.setItem('dh_target_date', newDate);
    setIsEditingTarget(false);
  };

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

  const getDailyQuote = (dateStr: string) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % disciplineQuotes.length;
    return disciplineQuotes[index];
  };

  const currentQuote = getDailyQuote(currentDate);

  const todayHabits = habits.filter(h => h.completed[currentDate]);
  const completionPercent = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;
  const grade = completionPercent >= 90 ? 'A' : completionPercent >= 80 ? 'B' : completionPercent >= 70 ? 'C' : completionPercent >= 60 ? 'D' : 'F';

  const completedSqlCount = sqlRoadmap.filter(s => s.completed).length;

  const timeDifference = new Date(targetDate).getTime() - new Date().getTime();
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

  const toggleSqlTopic = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSqlRoadmap(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleReflectionChange = (value: string) => {
    setReflection(value);
    localStorage.setItem(`dh_reflection_${currentDate}`, value);
  };

  const renderIcon = (name: string) => {
    const attr = { width: 18, height: 18, style: { minWidth: 18, minHeight: 18 } };
    switch (name) {
      case 'Shield': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.059A11.955 11.955 0 012.944 12c0 3.346 1.432 6.357 3.708 8.456a11.955 11.955 0 008.618 3.059A11.955 11.955 0 0021.056 12c0-3.346-1.432-6.357-3.708-8.456z"></path></svg>;
      case 'Book': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
      case 'List': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
      case 'SQL': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
      case 'Clock': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case 'Chart': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
      case 'Calendar': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
      case 'Plus': return <svg {...attr} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
      default: return null;
    }
  };

  const filteredHabits = filterCategory === 'All' ? habits : habits.filter(h => h.category === filterCategory);

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', width: '100%', padding: '16px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* MISSION COUNTDOWN BANNER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px', display: 'flex' }}>{renderIcon('Shield')}</div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', letterSpacing: '0.05em', margin: 0 }}>MISSION COUNTDOWN TARGET</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc', margin: '2px 0 0 0' }}>{daysRemaining} Days remaining until target date</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditingTarget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', padding: '6px 10px', borderRadius: '10px', border: '1px solid #334155' }}>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => handleTargetDateChange(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                />
                <button 
                  onClick={() => setIsEditingTarget(false)}
                  style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingTarget(true)}
                style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '12px', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
              >
                {renderIcon('Calendar')}
                Target: {targetDate} (Edit)
              </button>
            )}
          </div>
        </div>

        {/* ROTATING DAILY QUOTE CARD */}
        <div style={{ backgroundColor: '#161b2e', borderRadius: '12px', padding: '14px 18px', border: '1px solid #1e293b', fontStyle: 'italic', color: '#cbd5e1', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span>"{currentQuote}"</span>
          <span style={{ fontSize: '10px', fontStyle: 'normal', fontWeight: '700', backgroundColor: '#1e293b', color: '#818cf8', padding: '4px 8px', borderRadius: '6px' }}>
            Focus ({currentDate})
          </span>
        </div>

        {/* MAIN DASHBOARD HEADER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', padding: '12px', borderRadius: '12px', display: 'flex' }}>{renderIcon('Book')}</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', margin: 0 }}>Discipline & Habit Hub Pro</h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>Uncompromising focus, smart tracking, and granular SQL mastery.</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
            {renderIcon('Calendar')}
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '8px', borderRadius: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                  flex: '1 1 140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #059669' : '1px solid transparent',
                  backgroundColor: isSelected ? '#064e3b' : 'transparent',
                  color: isSelected ? '#34d399' : '#94a3b8',
                }}
              >
                {renderIcon(tab.icon)}
                <span style={{ whiteSpace: 'nowrap' }}>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DAILY HABITS & SCAN */}
        {activeTab === 'Daily Habits & Scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderIcon('List')}
                  <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Today's Completion Rate ({currentDate})</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#451a03', color: '#fde047', border: '1px solid #713f12' }}>
                    GRADE: {grade}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#34d399' }}>{completionPercent}%</span>
                </div>
              </div>
              <div style={{ width: '100%', backgroundColor: '#1e293b', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercent}%`, backgroundColor: '#34d399', height: '100%', transition: 'width 0.3s ease' }}></div>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', margin: 0 }}>
                {todayHabits.length} of {habits.length} habits completed
              </p>
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {renderIcon('Book')}
                <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Daily Reflection & Focus Log ({currentDate})</h2>
              </div>
              <textarea
                rows={3}
                value={reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="Log your deep work wins or distractions conquered today..."
                style={{ width: '100%', backgroundColor: '#161b2e', border: '1px solid #334155', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#f8fafc', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Daily Task Board</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap', flex: '1 1 auto' }}>
                    {['All', 'Health', 'Productivity', 'Mindset', 'Habits'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        style={{
                          fontSize: '11px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          backgroundColor: filterCategory === cat ? '#334155' : 'transparent',
                          color: filterCategory === cat ? '#f8fafc' : '#94a3b8',
                          flex: '1 1 auto'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    style={{ backgroundColor: '#059669', color: '#fff', border: 'none', fontSize: '12px', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                  >
                    {renderIcon('Plus')}
                    New Activity
                  </button>
                </div>
              </div>

              {showAddModal && (
                <form onSubmit={handleAddHabit} style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '12px', borderRadius: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Enter activity title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ flex: '1 1 180px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#fff', outline: 'none' }}
                    autoFocus
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Habits">Habits</option>
                  </select>
                  <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>Add</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
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
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isCompleted ? '1px solid #065f46' : '1px solid #1e293b',
                          backgroundColor: isCompleted ? '#064e3b33' : '#161b2e',
                          gap: '12px'
                        }}
                      >
                        <div 
                          onClick={() => toggleHabit(habit.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold',
                            border: isCompleted ? '1px solid #34d399' : '1px solid #475569',
                            backgroundColor: isCompleted ? '#34d399' : '#0f172a',
                            color: isCompleted ? '#020617' : 'transparent'
                          }}>
                            ✓
                          </div>
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', display: 'block', color: isCompleted ? '#34d399' : '#f8fafc', textDecoration: isCompleted ? 'line-through' : 'none', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              {habit.title}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', marginTop: '3px', display: 'inline-block', backgroundColor: '#1e293b', color: '#94a3b8' }}>
                              {habit.category}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteHabit(habit.id)}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
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

        {/* TAB 2: SQL ROADMAP WITH NOTES, SYNTAX & PRACTICE PROBLEMS */}
        {activeTab === 'SQL Roadmap (0/41)' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#34d399', margin: 0 }}>SQL Mastery Roadmap ({completedSqlCount}/41)</h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Click any module to inspect short notes, syntax formulae, and practical interview problems.</p>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#818cf8' }}>
                {Math.round((completedSqlCount / 41) * 100)}% Finished
              </div>
            </div>
            
            <div style={{ width: '100%', backgroundColor: '#1e293b', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(completedSqlCount / 41) * 100}%`, backgroundColor: '#34d399', height: '100%', transition: 'width 0.3s ease' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
              {sqlRoadmap.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedSqlTopic(topic)}
                  style={{
                    backgroundColor: topic.completed ? '#064e3b33' : '#161b2e',
                    border: topic.completed ? '1px solid #059669' : '1px solid #1e293b',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div 
                      onClick={(e) => toggleSqlTopic(topic.id, e)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0,
                        border: topic.completed ? '1px solid #34d399' : '1px solid #475569',
                        backgroundColor: topic.completed ? '#34d399' : '#0f172a',
                        color: topic.completed ? '#020617' : 'transparent'
                      }}
                    >
                      ✓
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: topic.completed ? '#34d399' : '#f8fafc', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {topic.title}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', display: 'inline-block' }}>
                        {topic.category}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold', padding: '2px 6px', backgroundColor: '#1e293b', borderRadius: '4px', flexShrink: 0 }}>View</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL FOR SQL TOPIC DETAILS (NOTES, SYNTAX, PRACTICAL PROBLEM) */}
        {selectedSqlTopic && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000, boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '4px' }}>{selectedSqlTopic.category}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: '6px 0 0 0' }}>{selectedSqlTopic.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedSqlTopic(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Module Notes Section */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', margin: 0, letterSpacing: '0.03em' }}>📖 Key Concept Notes</h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{selectedSqlTopic.notes}</p>
              </div>

              {/* Important Syntax & Formula Section */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', margin: 0, letterSpacing: '0.03em' }}>⚡ Important Syntax & Formula</h4>
                <pre style={{ backgroundColor: '#020617', color: '#34d399', padding: '10px', borderRadius: '8px', fontSize: '11px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                  {selectedSqlTopic.syntax}
                </pre>
              </div>

              {/* Practical Interview Problem Section */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', margin: 0, letterSpacing: '0.03em' }}>💡 Practical Problem & Solution</h4>
                <p style={{ fontSize: '12px', color: '#f8fafc', margin: 0, fontWeight: '600' }}>{selectedSqlTopic.problem}</p>
                <div style={{ marginTop: '4px' }}>
                  <p style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold', margin: '0 0 2px 0' }}>Solution Template:</p>
                  <pre style={{ backgroundColor: '#020617', color: '#818cf8', padding: '10px', borderRadius: '8px', fontSize: '11px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                    {selectedSqlTopic.solution}
                  </pre>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button 
                  onClick={() => toggleSqlTopic(selectedSqlTopic.id)}
                  style={{ backgroundColor: selectedSqlTopic.completed ? '#065f46' : '#1e293b', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {selectedSqlTopic.completed ? '✓ Module Completed' : 'Mark as Completed'}
                </button>
                <button 
                  onClick={() => setSelectedSqlTopic(null)}
                  style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: POMODORO TIMER */}
        {activeTab === 'Pomodoro Timer' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#34d399', margin: 0 }}>Uncompromising Deep Work Timer</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => { setPomodoroMode('work'); setPomodoroSeconds(25 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: pomodoroMode === 'work' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
              >
                Work (25m)
              </button>
              <button 
                onClick={() => { setPomodoroMode('break'); setPomodoroSeconds(5 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: pomodoroMode === 'break' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
              >
                Break (5m)
              </button>
            </div>
            
            <div style={{ fontSize: 'clamp(48px, 10vw, 72px)', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.05em' }}>
              {String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0')}:{String(pomodoroSeconds % 60).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                style={{ backgroundColor: isPomodoroRunning ? '#dc2626' : '#059669', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isPomodoroRunning ? 'Pause Session' : 'Start Focus'}
              </button>
              <button 
                onClick={() => { setIsPomodoroRunning(false); setPomodoroSeconds(pomodoroMode === 'work' ? 25 * 60 : 5 * 60); }}
                style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '10px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & HEATMAP */}
        {activeTab === 'Analytics & Heatmap' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#34d399', margin: 0 }}>Consistency Matrix & Analytics</h2>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Review your cumulative execution scores and long-term discipline scorecards.</p>
            
            <div style={{ backgroundColor: '#161b2e', padding: '16px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Current Streak Status</p>
              <p style={{ fontSize: '20px', fontWeight: '900', color: '#34d399', margin: 0 }}>🔥 Active Streak Tracking</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Keep logging your daily habits before midnight to maintain momentum toward target date ({targetDate}).</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
