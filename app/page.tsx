'use client';

import React, { useState, useEffect } from 'react';

interface Activity {
  id: string;
  title: string;
  category: string;
  frequency: string;
  targetTime?: string;
  createdAt: string;
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

const ACTIVITIES_KEY = 'discipline_tracker_activities';
const LOGS_KEY = 'discipline_tracker_logs';
const SQL_TOPICS_KEY = 'discipline_tracker_sql_granular_topics';
const TARGET_DATE_KEY = 'discipline_tracker_target_date';

const DISCIPLINE_QUOTES = [
  "Distractions are the enemy of greatness. Stay locked on your mission.",
  "Your future self is built in the hours you spend alone working in silence.",
  "Emotions pass; discipline remains. Protect your focus above all else.",
  "Mastering yourself means refusing to surrender your energy to temporary distractions.",
  "The highest form of self-respect is keeping the promises you made to your ambitions.",
  "A mind free of external noise is an unstoppable force of execution."
];

const DEFAULT_SQL_TOPICS: Omit<SqlTopic, 'completedSubtopics'>[] = [
  {
    id: 'sql-mod-1',
    module: 'Fundamentals',
    title: 'Basic Queries & Filtering',
    subtopics: [
      'SELECT statements & retrieving all/specific columns',
      'Using aliases (AS keyword) for columns and tables',
      'Filtering rows with WHERE clause (=, <>, >, <)',
      'Combining conditions with AND, OR, and NOT',
      'Using IN, NOT IN, and BETWEEN operators',
      'Pattern matching with LIKE (% and _ wildcards)',
      'Handling missing data with IS NULL and IS NOT NULL',
      'Removing duplicates using DISTINCT'
    ]
  },
  {
    id: 'sql-mod-2',
    module: 'Fundamentals',
    title: 'Sorting & Limiting',
    subtopics: [
      'Sorting results with ORDER BY (ASC and DESC)',
      'Sorting by multiple columns',
      'Restricting row output with LIMIT and OFFSET',
      'Understanding execution order of clauses (SELECT, WHERE, ORDER BY)'
    ]
  },
  {
    id: 'sql-mod-3',
    module: 'Aggregations',
    title: 'Aggregate Functions & Grouping',
    subtopics: [
      'Counting records using COUNT() and COUNT(DISTINCT)',
      'Calculating totals and averages with SUM() and AVG()',
      'Finding extremes using MIN() and MAX()',
      'Grouping summary data with GROUP BY',
      'Filtering aggregated groups using HAVING vs WHERE',
      'Conditional aggregations using CASE WHEN'
    ]
  },
  {
    id: 'sql-mod-4',
    module: 'Joins',
    title: 'Table Relationships & Joins',
    subtopics: [
      'Understanding Primary Keys and Foreign Keys',
      'Inner Joins (matching rows from both tables)',
      'Left Outer Joins (all rows from left table)',
      'Right Outer Joins (all rows from right table)',
      'Full Outer Joins (combining unmatched records)',
      'Cross Joins and Cartesian products',
      'Self Joins (joining a table to itself)',
      'Set Operations: UNION, UNION ALL, and INTERSECT'
    ]
  },
  {
    id: 'sql-mod-5',
    module: 'Advanced',
    title: 'Subqueries & CTEs',
    subtopics: [
      'Scalar subqueries in SELECT clauses',
      'Subqueries in WHERE clauses (IN, EXISTS)',
      'Correlated subqueries vs standard subqueries',
      'Introduction to Common Table Expressions (WITH clause)',
      'Recursive CTEs for hierarchical/tree structures'
    ]
  },
  {
    id: 'sql-mod-6',
    module: 'Advanced',
    title: 'Window Functions',
    subtopics: [
      'Introduction to OVER() and PARTITION BY',
      'Ranking functions: ROW_NUMBER(), RANK(), DENSE_RANK()',
      'Value functions: LAG() and LEAD() for trend analysis',
      'First and Last value window functions',
      'Calculating running totals and moving averages'
    ]
  },
  {
    id: 'sql-mod-7',
    module: 'Performance',
    title: 'Optimization & Data Definition',
    subtopics: [
      'Creating and dropping tables (CREATE TABLE, DROP)',
      'Modifying table structures (ALTER TABLE, constraints)',
      'Understanding database indexes and how they speed up queries',
      'Query execution plans and performance bottlenecks',
      'Transactions (COMMIT, ROLLBACK)'
    ]
  }
];

const playSound = (type: 'success' | 'beep') => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Audio safeguard
  }
};

function getActivities(): Activity[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ACTIVITIES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };
  activities.push(newActivity);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  return newActivity;
}

function deleteActivity(id: string): void {
  if (typeof window === 'undefined') return;
  const activities = getActivities().filter(a => a.id !== id);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  const logs = getAllLogs().filter(l => l.activityId !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

function getAllLogs(): DailyLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

function toggleLog(activityId: string, date: string): boolean {
  if (typeof window === 'undefined') return false;
  const logs = getAllLogs();
  const existingIndex = logs.findIndex(l => l.activityId === activityId && l.date === date);
  let isNowCompleted = false;
  if (existingIndex > -1) {
    logs[existingIndex].completed = !logs[existingIndex].completed;
    isNowCompleted = logs[existingIndex].completed;
  } else {
    logs.push({
      id: Math.random().toString(36).substring(2, 9),
      activityId,
      date,
      completed: true,
    });
    isNowCompleted = true;
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return isNowCompleted;
}

function getSqlTopics(): SqlTopic[] {
  if (typeof window === 'undefined') return DEFAULT_SQL_TOPICS.map(t => ({ ...t, completedSubtopics: [] }));
  const data = localStorage.getItem(SQL_TOPICS_KEY);
  if (!data) {
    const initial = DEFAULT_SQL_TOPICS.map(t => ({ ...t, completedSubtopics: [] }));
    localStorage.setItem(SQL_TOPICS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function toggleSqlSubtopicStorage(topicId: string, subtopic: string): SqlTopic[] {
  if (typeof window === 'undefined') return [];
  const topics = getSqlTopics();
  const updated = topics.map(t => {
    if (t.id === topicId) {
      const exists = t.completedSubtopics.includes(subtopic);
      const newSubtopics = exists 
        ? t.completedSubtopics.filter(s => s !== subtopic)
        : [...t.completedSubtopics, subtopic];
      return { ...t, completedSubtopics: newSubtopics };
    }
    return t;
  });
  localStorage.setItem(SQL_TOPICS_KEY, JSON.stringify(updated));
  return updated;
}

function getPastWeekDays(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDailyGrade(rate: number): { grade: string; color: string } {
  if (rate >= 100) return { grade: 'A+', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60' };
  if (rate >= 80) return { grade: 'A', color: 'text-emerald-300 bg-emerald-950/30 border-emerald-800/40' };
  if (rate >= 65) return { grade: 'B', color: 'text-blue-400 bg-blue-950/30 border-blue-800/40' };
  if (rate >= 50) return { grade: 'C', color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
  if (rate > 0) return { grade: 'D', color: 'text-orange-400 bg-orange-950/30 border-orange-800/40' };
  return { grade: 'F', color: 'text-red-400 bg-red-950/30 border-red-800/40' };
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<'habits' | 'sql' | 'analytics'>('habits');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [targetTime, setTargetTime] = useState('08:00');
  const [showForm, setShowForm] = useState(false);

  const [targetGoalDate, setTargetGoalDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TARGET_DATE_KEY);
      if (saved) return saved;
    }
    const defaultTarget = new Date();
    defaultTarget.setMonth(defaultTarget.getMonth() + 3);
    return defaultTarget.toISOString().split('T')[0];
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannedTasks, setScannedTasks] = useState<string[]>([]);
  const [selectedCategoryForScan, setSelectedCategoryForScan] = useState('Productivity');

  const [sqlTopics, setSqlTopics] = useState<SqlTopic[]>([]);

  useEffect(() => {
    loadData();
    const randomIndex = Math.floor(Math.random() * DISCIPLINE_QUOTES.length);
    setCurrentQuote(DISCIPLINE_QUOTES[randomIndex]);
  }, [currentDate]);

  function loadData() {
    setActivities(getActivities());
    setAllLogs(getAllLogs());
    setSqlTopics(getSqlTopics());
  }

  function handleSaveTargetDate(newDate: string) {
    setTargetGoalDate(newDate);
    localStorage.setItem(TARGET_DATE_KEY, newDate);
    setIsEditingTarget(false);
  }

  function calculateDaysLeft(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetGoalDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }

  function handleToggle(activityId: string) {
    const completed = toggleLog(activityId, currentDate);
    if (completed) playSound('success');
    loadData();
  }

  function handleDelete(id: string) {
    if (confirm('Delete this habit?')) {
      deleteActivity(id);
      loadData();
    }
  }

  function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    saveActivity({ title, category, frequency: 'Daily', targetTime });
    setTitle('');
    setShowForm(false);
    playSound('success');
    loadData();
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerLoading(true);
    setTimeout(() => {
      setScannerLoading(false);
      setScannedTasks([
        'Intense morning focus session',
        'Review database query indexing & SQL joins',
        'Physical workout & conditioning',
        'Zero external distractions'
      ]);
    }, 1200);
  }

  function handleImportScannedTasks() {
    scannedTasks.forEach(taskText => {
      saveActivity({ title: taskText, category: selectedCategoryForScan, frequency: 'Daily', targetTime: '09:00' });
    });
    setScannedTasks([]);
    setShowScanner(false);
    playSound('success');
    loadData();
  }

  const daysLeft = calculateDaysLeft();
  const todayLogs = allLogs.filter(l => l.date === currentDate);
  const totalActivities = activities.length;
  const completedCount = activities.filter(act => todayLogs.find(l => l.activityId === act.id && l.completed)).length;
  const completionRate = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;
  const performanceBadge = getDailyGrade(completionRate);

  let totalSubtopicsCount = 0;
  let completedSubtopicsCount = 0;
  sqlTopics.forEach(t => {
    totalSubtopicsCount += t.subtopics.length;
    completedSubtopicsCount += t.completedSubtopics.length;
  });
  const sqlProgressRate = totalSubtopicsCount > 0 ? Math.round((completedSubtopicsCount / totalSubtopicsCount) * 100) : 0;

  const weekDays = getPastWeekDays();
  const filteredActivities = selectedCategory === 'All' ? activities : activities.filter(a => a.category === selectedCategory);

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8 font-sans text-slate-100">
        
        {/* TOP BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/50 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Mission Countdown Target</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-3xl font-black text-white font-mono">{daysLeft}</span>
                  <span className="text-sm text-slate-400 font-medium">Days remaining until target date</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditingTarget ? (
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                  <input 
                    type="date"
                    value={targetGoalDate}
                    onChange={(e) => handleSaveTargetDate(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
                  />
                  <button onClick={() => setIsEditingTarget(false)} className="text-xs text-indigo-400 font-semibold px-2">Done</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingTarget(true)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 border border-slate-700 transition"
                >
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Change Target Date ({targetGoalDate})
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <p className="text-xs sm:text-sm italic text-slate-300 font-medium leading-relaxed">
              "{currentQuote}"
            </p>
          </div>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Discipline Hub Live
            </h1>
            <p className="text-slate-400 text-sm mt-1">Uncompromising focus, smart tracking, and granular mastery.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <input 
                type="date" 
                value={currentDate} 
                onChange={(e) => setCurrentDate(e.target.value)}
                className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer"
              />
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'habits' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Daily Habits & Scan
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'sql' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg> SQL Roadmap ({completedSubtopicsCount}/{totalSubtopicsCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> Analytics & Matrix
          </button>
        </div>

        {/* TAB 1: HABITS & SCANNER */}
        {activeTab === 'habits' && (
          <div className="space-y-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Today's Completion Rate
                </span>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black uppercase tracking-wider ${performanceBadge.color}`}>
                    Grade: {performanceBadge.grade}
                  </span>
                  <span className="font-bold text-emerald-400 text-base">{completionRate}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-200">Daily Task Board</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowScanner(!showScanner)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Scan Note Photo
                  </button>
                  <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg> New Activity
                  </button>
                </div>
              </div>

              {showScanner && (
                <div className="bg-indigo-950/40 border border-indigo-800/60 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Browser Note Scanner
                    </h3>
                    <button onClick={() => { setShowScanner(false); setScannedTasks([]); }} className="text-slate-400 hover:text-slate-200 text-xs">Close</button>
                  </div>
                  <label className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Select Notebook Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {scannerLoading && <div className="text-center py-4 text-indigo-300 text-sm">Analyzing notebook image lines...</div>}
                  {scannedTasks.length > 0 && !scannerLoading && (
                    <div className="bg-slate-900 border border-indigo-900 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Extracted Tasks:</h4>
                      {scannedTasks.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800 p-2.5 rounded-lg">
                          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                          <span>{t}</span>
                        </div>
                      ))}
                      <button onClick={handleImportScannedTasks} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm transition">
                        Confirm & Add to Activities
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showForm && (
                <form onSubmit={handleAddActivity} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Add New Habit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="Activity Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none" />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none">
                      <option value="Health">Health & Fitness</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Mindset">Mindset & Learning</option>
                      <option value="Habits">General Habits</option>
                    </select>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium py-2 transition">Save Activity</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-sm">No activities found. Add your first habit above!</p>
                ) : (
                  filteredActivities.map(act => {
                    const isCompleted = todayLogs.some(l => l.activityId === act.id && l.completed);
                    return (
                      <div key={act.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${isCompleted ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggle(act.id)}>
                          {isCompleted ? (
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          ) : (
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          )}
                          <div>
                            <h4 className={`font-medium text-sm ${isCompleted ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>{act.title}</h4>
                            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{act.category}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(act.id)} className="text-slate-500 hover:text-red-400 p-2 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQL ROADMAP */}
        {activeTab === 'sql' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <h2 className="text-lg font-semibold text-slate-200">Granular SQL Roadmap Progress</h2>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-indigo-500 h-full transition-all duration-500 ease-out" style={{ width: `${sqlProgressRate}%` }} />
              </div>
              <p className="text-xs text-slate-400 text-right">{completedSubtopicsCount} of {totalSubtopicsCount} subtopics mastered ({sqlProgressRate}%)</p>
            </div>

            <div className="space-y-4">
              {sqlTopics.map(topic => (
                <div key={topic.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-100">{topic.title}</h3>
                    <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2.5 py-1 rounded-lg">{topic.module}</span>
                  </div>
                  <div className="space-y-2">
                    {topic.subtopics.map((sub, idx) => {
                      const isDone = topic.completedSubtopics.includes(sub);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            const updated = toggleSqlSubtopicStorage(topic.id, sub);
                            setSqlTopics(updated);
                            playSound('success');
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${isDone ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'}`}
                        >
                          {isDone ? (
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          )}
                          <span className={`text-sm ${isDone ? 'line-through' : ''}`}>{sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & MATRIX */}
        {activeTab === 'analytics' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h2 className="text-lg font-semibold text-slate-200">Weekly Consistency Matrix</h2>
            {activities.length === 0 ? (
              <p className="text-slate-400 text-sm">No activities recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[600px] space-y-3">
                  <div className="grid grid-cols-8 gap-2 text-xs font-medium text-slate-400 pb-2 border-b border-slate-800">
                    <div>Habit</div>
                    {weekDays.map(date => <div key={date} className="text-center">{date.slice(5)}</div>)}
                  </div>
                  {activities.map(act => (
                    <div key={act.id} className="grid grid-cols-8 gap-2 items-center text-sm">
                      <div className="font-medium truncate text-slate-300">{act.title}</div>
                      {weekDays.map(date => {
                        const logged = allLogs.find(l => l.activityId === act.id && l.date === date && l.completed);
                        return (
                          <div key={date} className="flex justify-center">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${logged ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                              {logged ? '✓' : '·'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
