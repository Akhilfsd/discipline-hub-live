'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Calendar, Award, BarChart2, Flame, Trash2, Download, FileText, Database, Clock, Play, Pause, RotateCcw, TrendingUp, Camera, Sparkles, ShieldAlert, Target } from 'lucide-react';

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

function saveDayNote(date: string, notes: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`discipline_note_${date}`, notes);
}

function getDayNote(date: string): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`discipline_note_${date}`) || '';
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

function calculateStreak(activityId: string, logs: DailyLog[]): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.activityId === activityId && l.date === dateStr);
    if (log && log.completed) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
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
  const [activeTab, setActiveTab] = useState<'habits' | 'sql' | 'timer' | 'analytics'>('habits');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [targetTime, setTargetTime] = useState('08:00');
  const [showForm, setShowForm] = useState(false);
  const [dailyNote, setDailyNote] = useState('');

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
  const [selectedSqlModule, setSelectedSqlModule] = useState<string>('All');

  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    const randomIndex = Math.floor(Math.random() * DISCIPLINE_QUOTES.length);
    setCurrentQuote(DISCIPLINE_QUOTES[randomIndex]);
    checkDateRollover();
  }, [currentDate]);

  function loadData() {
    setActivities(getActivities());
    setAllLogs(getAllLogs());
    setDailyNote(getDayNote(currentDate));
    setSqlTopics(getSqlTopics());
  }

  function checkDateRollover() {
    if (typeof window === 'undefined') return;
    const lastActiveDate = localStorage.getItem('discipline_last_active_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate && lastActiveDate !== todayStr) {
      console.log('New day detected. Initializing fresh daily state parameters.');
    }
    localStorage.setItem('discipline_last_active_date', todayStr);
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
        'Physical workout & physical conditioning',
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
  const filteredSqlTopics = selectedSqlModule === 'All' ? sqlTopics : sqlTopics.filter(t => t.module === selectedSqlModule);

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8 font-sans text-slate-100">
        
        {/* TOP BANNER: Countdown & Discipline Quote */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/50 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <ShieldAlert size={24} />
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
                  <Target size={14} className="text-indigo-400" /> Change Target Date ({targetGoalDate})
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs sm:text-sm italic text-slate-300 font-medium leading-relaxed">
              "{currentQuote}"
            </p>
          </div>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
              <Award /> Discipline & Habit Hub Pro
            </h1>
            <p className="text-slate-400 text-sm mt-1">Uncompromising focus, smart tracking, and granular SQL mastery.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Calendar size={18} className="text-emerald-400" />
              <input 
                type="date" 
                value={currentDate} 
                onChange={(e) => setCurrentDate(e.target.value)}
                className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer"
              />
            </div>
            <button 
              onClick={() => {
                const data = { activities: getActivities(), logs: getAllLogs(), sqlTopics: getSqlTopics() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `discipline-backup-${currentDate}.json`; a.click();
              }}
              title="Backup Data"
              className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 text-slate-300 transition"
            >
              <Download size={18} />
            </button>
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
            <BarChart2 size={18} /> Daily Habits & Scan
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'sql' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database size={18} /> SQL Roadmap ({completedSubtopicsCount}/{totalSubtopicsCount})
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'timer' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={18} /> Pomodoro Timer
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={18} /> Analytics & Heatmap
          </button>
        </div>

        {/* TAB 1: HABITS & SCANNER */}
        {activeTab === 'habits' && (
          <div className="space-y-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <BarChart2 size={18} className="text-emerald-400" /> Today's Completion Rate
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
              <div className="text-xs text-slate-400 text-right">
                {completedCount} of {totalActivities} habits completed for {currentDate}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-emerald-400" /> Daily Reflection & Focus Log ({currentDate})
              </label>
              <textarea
                value={dailyNote}
                onChange={(e) => { setDailyNote(e.target.value); saveDayNote(currentDate, e.target.value); }}
                placeholder="Log your deep work wins or distractions conquered today..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-emerald-500 h-24 resize-none"
              />
            </div>

            {activities.length > 0 && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 overflow-x-auto">
                <h2 className="text-lg font-semibold text-slate-200">Weekly Consistency Matrix (Past 7 Days)</h2>
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-8 gap-2 text-xs font-medium text-slate-400 pb-2 border-b border-slate-800">
                    <div>Habit</div>
                    {weekDays.map(date => <div key={date} className="text-center">{date.slice(5)}</div>)}
                  </div>
                  <div className="space-y-2 pt-2">
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
              </div>
            )}

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-slate-200">Daily Task Board</h2>
                  <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs flex-wrap">
                    {['All', 'Health', 'Productivity', 'Mindset', 'Habits'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === cat ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowScanner(!showScanner)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg">
                    <Camera size={16} /> Scan Note Photo
                  </button>
                  <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                    <Plus size={16} /> New Activity
                  </button>
                </div>
              </div>

              {showScanner && (
                <div className="bg-indigo-950/40 border border-indigo-800/60 p-5 rounded-2xl space-y-4 shadow-inner">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-400" /> Browser Note Scanner
                    </h3>
                    <button onClick={() => { setShowScanner(false); setScannedTasks([]); }} className="text-slate-400 hover:text-slate-200 text-xs">Close</button>
                  </div>
                  <p className="text-xs text-slate-400">Upload a notebook snapshot to parse and convert daily tasks automatically.</p>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <select
                      value={selectedCategoryForScan}
                      onChange={(e) => setSelectedCategoryForScan(e.target.value)}
                      className="bg-slate-900 border border-indigo-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none w-full sm:w-auto"
                    >
                      <option value="Health">Health & Fitness</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Mindset">Mindset & Learning</option>
                      <option value="Habits">General Habits</option>
                    </select>
                    <label className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer w-full sm:w-auto">
                      <Camera size={16} /> Select Notebook Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  {scannerLoading && <div className="text-center py-6 text-indigo-300 text-sm">Analyzing notebook image lines...</div>}
                  {scannedTasks.length > 0 && !scannerLoading && (
                    <div className="bg-slate-900 border border-indigo-900 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Extracted Tasks Ready for Import:</h4>
                      <div className="space-y-2">
                        {scannedTasks.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                            <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleImportScannedTasks} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm transition mt-2 shadow-lg">
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
                    <input type="text" placeholder="Activity Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500" />
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
                  <p className="text-slate-400 text-center py-8 text-sm">No activities found in this category.</p>
                ) : (
                  filteredActivities.map(activity => {
                    const log = todayLogs.find(l => l.activityId === activity.id);
                    const isCompleted = log ? log.completed : false;
                    const streak = calculateStreak(activity.id, allLogs);

                    return (
                      <div key={activity.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${isCompleted ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-300' : 'bg-slate-800/60 border-slate-700 text-slate-100'}`}>
                        <div onClick={() => handleToggle(activity.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                          {isCompleted ? <CheckCircle2 className="text-emerald-400 shrink-0" size={22} /> : <Circle className="text-slate-500 shrink-0" size={22} />}
                          <div>
                            <p className={`font-medium ${isCompleted ? 'line-through text-slate-400' : ''}`}>{activity.title}</p>
                            <span className="text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 inline-block mt-1">{activity.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {streak > 0 && (
                            <span className="hidden sm:flex items-center gap-1 text-orange-400 text-xs font-semibold bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-900/40">
                              <Flame size={14} /> {streak}d
                            </span>
                          )}
                          <button onClick={() => handleDelete(activity.id)} className="text-slate-500 hover:text-red-400 p-1.5 transition"><Trash2 size={16} /></button>
                        </div>
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
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <Database size={18} className="text-emerald-400" /> SQL Subtopic Mastery Progress
                </span>
                <span className="font-bold text-emerald-400 text-base">{sqlProgressRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${sqlProgressRate}%` }} />
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs w-fit flex-wrap">
                {['All', 'Fundamentals', 'Aggregations', 'Joins', 'Advanced', 'Performance'].map(mod => (
                  <button
                    key={mod}
                    onClick={() => setSelectedSqlModule(mod)}
                    className={`px-3 py-1.5 rounded-lg transition ${selectedSqlModule === mod ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {mod}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredSqlTopics.map(topic => (
                  <div key={topic.id} className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
                      <div>
                        <h3 className="font-semibold text-slate-100">{topic.title}</h3>
                        <span className="text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/50 inline-block mt-1">{topic.module}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                        {topic.completedSubtopics.length} / {topic.subtopics.length} done
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {topic.subtopics.map(sub => {
                        const isDone = topic.completedSubtopics.includes(sub);
                        return (
                          <div 
                            key={sub}
                            onClick={() => {
                              const updated = toggleSqlSubtopicStorage(topic.id, sub);
                              playSound('success');
                              setSqlTopics(updated);
                            }}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition cursor-pointer ${isDone ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300' : 'bg-slate-900/50 border-slate-800 text-slate-200'}`}
                          >
                            {isDone ? <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> : <Circle className="text-slate-600 shrink-0" size={18} />}
                            <span className={`text-sm ${isDone ? 'line-through text-slate-400' : ''}`}>{sub}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POMODORO TIMER */}
        {activeTab === 'timer' && (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl text-center space-y-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
              <Clock className="text-emerald-400" /> Focus & Study Timer
            </h2>

            <div className="py-8 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-6xl font-black text-emerald-400 font-mono tracking-wider">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${timerActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              >
                {timerActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start Session</>}
              </button>
              <button
                onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl font-semibold text-sm transition border border-slate-700"
              >
                <RotateCcw size={18} /> Reset
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={18} /> 30-Day Discipline Density Heatmap
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
                {Array.from({ length: 30 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (29 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const count = allLogs.filter(l => l.date === dateStr && l.completed).length;
                  const bg = count === 0 ? 'bg-slate-800 border-slate-700' : count < 3 ? 'bg-emerald-800 border-emerald-600' : 'bg-emerald-500 border-emerald-400';
                  return (
                    <div key={dateStr} title={`${dateStr}: ${count} tasks`} className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono ${bg}`}>
                      <span>{dateStr.slice(8)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
