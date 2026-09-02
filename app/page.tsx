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
  completed: { [date: string]: boolean }; // Date string format: YYYY-MM-DD
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

  useEffect(() => {
    // Load habits from local storage on mount
    const savedHabits = localStorage.getItem('dh_habits');
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    
    const savedReflection = localStorage.getItem(`dh_reflection_${currentDate}`);
    if (savedReflection) setReflection(savedReflection);
  }, [currentDate]);

  useEffect(() => {
    // Save habits to local storage on change
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

  const handleReflectionChange = (value: string) => {
    setReflection(value);
    localStorage.setItem(`dh_reflection_${currentDate}`, value);
  };

  // --- Render Helpers ---
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
      case 'Camera': return <svg className="w-4 h-4 text-gray-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
      case 'Plus': return <svg className="w-4 h-4 text-gray-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>;
      default: return null;
    }
  };

  const categoryColors: { [key: string]: string } = {
    Health: 'bg-red-900/40 text-red-300 border-red-800',
    Productivity: 'bg-sky-900/40 text-sky-300 border-sky-800',
    Mindset: 'bg-purple-900/40 text-purple-300 border-purple-800',
    Habits: 'bg-emerald-900/40 text-emerald-300 border-emerald-800',
  };

  // ==========================================
  // RENDER RETURN
  // ==========================================

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* MISSION COUNTDOWN BANNER */}
        <section className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e293b] p-3 rounded-2xl">{renderIcon('Shield')}</div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">MISSION COUNTDOWN TARGET</p>
              <p className="text-2xl font-black tracking-tight text-slate-50 mt-0.5">{daysRemaining} Days remaining until target date</p>
            </div>
          </div>
          <button className="bg-[#1e293b] border border-slate-700/60 text-slate-200 text-xs px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-700 transition whitespace-nowrap">
            {renderIcon('Calendar')}
            Change Target Date ({MISSION_TARGET_DATE})
          </button>
        </section>

        {/* QUOTE CARD */}
        <section className="bg-[#161b2e] rounded-2xl p-6 border border-slate-800/70 italic text-slate-300 text-base relative before:content-['“'] before:absolute before:-left-2 before:top-1 before:text-6xl before:text-slate-700 before:opacity-50">
          "Your future self is built in the hours you spend alone working in silence."
        </section>

        {/* MAIN DASHBOARD HEADER */}
        <header className="bg-[#0f172a] border border-slate-800/60 rounded-3xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-inner shadow-black/10">
          <div className="flex items-center gap-6">
            <div className="bg-[#064e3b] border border-[#059669]/50 p-4 rounded-3xl">{renderIcon('Book')}</div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-[#34d399]">Discipline & Habit Hub Pro</h1>
              <p className="text-slate-400 text-base mt-1">Uncompromising focus, smart tracking, and granular SQL mastery.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#1e293b] border border-slate-700/60 text-slate-200 text-sm px-5 py-3 rounded-2xl font-medium flex items-center gap-2.5">
              {renderIcon('Calendar')}
              {currentDate.split('-').reverse().join('-')}
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <button className="bg-[#1e293b] border border-slate-700/60 p-3.5 rounded-2xl hover:bg-slate-700 transition">
              {renderIcon('Download')}
            </button>
          </div>
        </header>

        {/* TABS NAVIGATION */}
        <nav className="bg-[#0f172a] border border-slate-800/60 p-2 rounded-2xl flex flex-wrap gap-1.5">
          {[
            { name: 'Daily Habits & Scan', icon: 'List' },
            { name: 'SQL Roadmap (0/41)', icon: 'SQL' },
            { name: 'Pomodoro Timer', icon: 'Clock' },
            { name: 'Analytics & Heatmap', icon: 'Chart' },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name as Tab)}
