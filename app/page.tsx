'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

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

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

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

  // --- Calculations ---
  const todayHabits = habits.filter(h => h.completed[currentDate]);
  const completionPercent = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;
  const grade = completionPercent >= 90 ? 'A' : completionPercent >= 80 ? 'B' : completionPercent >= 70 ? 'C' : completionPercent >= 60 ? 'D' : 'F';

  const timeDifference = new Date(MISSION_TARGET_DATE).getTime() - new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));

  // --- Handlers ---
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

  // --- Icon Helper ---
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Shield': return <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.059A11.955 11.955 0 012.944 12c0 3.346 1.432 6.357 3.708 8.456a11.955 11.955 0 008.618 3.059A11.955 11.955 0 0021.056 12c0-3.346-1.432-6.357-3.708-8.456z"></path></svg>;
      case 'Book': return <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
      case 'List': return <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
      case 'SQL': return <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
      case 'Clock': return <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
      case 'Chart': return <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
      case 'Calendar': return <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
      case 'Download': return <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
      case 'Camera': return <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
      case 'Plus': return <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>;
      default: return null;
    }
  };

  const filteredHabits = filterCategory === 'All' 
    ? habits 
    : habits.filter(h => h.category === filterCategory);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* MISSION COUNTDOWN BANNER */}
        <section className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e293b] p-3 rounded-2xl">{renderIcon('Shield')}</div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">MISSION COUNTDOWN TARGET</p>
              <p className="text-xl font-black tracking-tight text-slate-50 mt-0.5">{daysRemaining} Days remaining until target date</p>
            </div>
          </div>
          <button className="bg-[#1e293b] border border-slate-700/60 text-slate-200 text-xs px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-700 transition whitespace-nowrap">
            {renderIcon('Calendar')}
            Change Target Date ({MISSION_TARGET_DATE})
          </button>
        </section>

        {/* QUOTE CARD */}
        <section className="bg-[#161b2e] rounded-2xl p-5 border border-slate-800/70 italic text-slate-300 text-sm relative before:content-['“'] before:absolute before:-left-2 before:top-1 before:text-5xl before:text-slate-700 before:opacity-50">
          "Your future self is built in the hours you spend alone working in silence."
        </section>

        {/* MAIN DASHBOARD HEADER */}
        <header className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-inner">
          <div className="flex items-center gap-5">
            <div className="bg-[#064e3b] border border-[#059669]/50 p-4 rounded-3xl">{renderIcon('Book')}</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#34d399]">Discipline & Habit Hub Pro</h1>
              <p className="text-slate-400 text-xs md:text-sm mt-1">Uncompromising focus, smart tracking, and granular SQL mastery.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#1e293b] border border-slate-700/60 text-slate-200 text-xs px-4 py-2.5 rounded-2xl font-medium flex items-center gap-2">
              {renderIcon('Calendar')}
              {currentDate.split('-').reverse().join('-')}
            </div>
            <button className="bg-[#1e293b] border border-slate-700/60 p-3 rounded-2xl hover:bg-slate-700 transition">
              {renderIcon('Download')}
            </button>
          </div>
        </header>

        {/* TABS NAVIGATION */}
        <nav className="bg-[#0f172a] border border-slate-800/60 p-2 rounded-2xl flex flex-wrap gap-2">
          {[
            { name: 'Daily Habits & Scan', icon: 'List' },
            { name: 'SQL Roadmap (0/41)', icon: 'SQL' },
            { name: 'Pomodoro Timer', icon: 'Clock' },
            { name: 'Analytics & Heatmap', icon: 'Chart' },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name as Tab)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.name
                  ? 'bg-[#064e3b] text-[#34d399] border border-[#059669]/40 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/50'
              }`}
            >
              {renderIcon(tab.icon)}
              {tab.name}
            </button>
          ))}
        </nav>

        {/* TAB CONTENT: DAILY HABITS & SCAN */}
        {activeTab === 'Daily Habits & Scan' && (
          <div className="space-y-6">

            {/* COMPLETION RATE PROGRESS BAR */}
            <section className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {renderIcon('List')}
                  <h2 className="text-sm font-bold text-slate-200">Today's Completion Rate</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                    grade === 'A' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' :
                    grade === 'B' ? 'bg-sky-950 border-sky-800 text-sky-300' :
                    grade === 'C' ? 'bg-amber-950 border-amber-800 text-amber-300' :
                    'bg-red-950 border-red-800 text-red-300'
                  }`}>
                    GRADE: {grade}
                  </span>
                  <span className="text-sm font-black text-emerald-400">{completionPercent}%</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-[#1e293b] h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-slate-400 text-right">
                {todayHabits.length} of {habits.length} habits completed for {currentDate}
              </p>
            </section>

            {/* DAILY REFLECTION & FOCUS LOG */}
            <section className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                {renderIcon('Book')}
                <h2 className="text-sm font-bold text-slate-200">Daily Reflection & Focus Log ({currentDate})</h2>
              </div>
              <textarea
                rows={3}
                value={reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="Log your deep work wins or distractions conquered today..."
                className="w-full bg-[#161b2e] border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </section>

            {/* DAILY TASK BOARD */}
            <section className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-sm font-bold text-slate-200">Daily Task Board</h2>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category filters */}
                  <div className="bg-[#161b2e] border border-slate-800 p-1 rounded-xl flex gap-1">
                    {['All', 'Health', 'Productivity', 'Mindset', 'Habits'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition ${
                          filterCategory === cat ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Scan Note Photo Button */}
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition shadow">
                    {renderIcon('Camera')}
                    Scan Note Photo
                  </button>

                  {/* New Activity Button */}
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition shadow"
                  >
                    {renderIcon('Plus')}
                    New Activity
                  </button>
                </div>
              </div>

              {/* Add Habit Inline Form Modal */}
              {showAddModal && (
                <form onSubmit={handleAddHabit} className="bg-[#161b2e] border border-slate-700/70 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter activity title (e.g., Read 10 pages)..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                    autoFocus
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Habits">Habits</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-xl font-medium">Add</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl">Cancel</button>
                  </div>
                </form>
              )}

              {/* Habit List */}
              <div className="space-y-3">
                {filteredHabits.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No tasks found in this category.</p>
                ) : (
                  filteredHabits.map(habit => {
                    const isCompleted = !!habit.completed[currentDate];
                    return (
                      <div 
                        key={habit.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                          isCompleted 
                            ? 'bg-emerald-950/20 border-emerald-800/40' 
                            : 'bg-[#161b2e] border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div 
                          onClick={() => toggleHabit(habit.id)}
                          className="flex items-center gap-3.5 cursor-pointer flex-1"
                        >
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border text-xs font-bold transition ${
                            isCompleted ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900 text-transparent'
                          }`}>
                            ✓
                          </div>
                          <div>
                            <span className={`text-xs font-medium block ${isCompleted ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>
                              {habit.title}
                            </span>
                            <span className={`text-[10px] inline-block px-2 py-0.5 rounded-md mt-1 border ${
                              habit.category === 'Health' ? 'bg-red-950/50 text-red-300 border-red-900' :
                              habit.category === 'Productivity' ? 'bg-sky-950/50 text-sky-300 border-sky-900' :
                              habit.category === 'Mindset' ? 'bg-purple-950/50 text-purple-300 border-purple-900' :
                              'bg-emerald-950/50 text-emerald-300 border-emerald-900'
                            }`}>
                              {habit.category}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="text-slate-500 hover:text-red-400 p-2 transition text-xs"
                          title="Delete Habit"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>
        )}

        {/* TAB CONTENT: PLACEHOLDERS FOR OTHER TABS */}
        {activeTab !== 'Daily Habits & Scan' && (
          <div className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-slate-300">{activeTab} Module</h3>
            <p className="text-xs text-slate-500">This section is synced and fully prepped for your roadmap data.</p>
          </div>
        )}

      </div>
    </main>
  );
}
