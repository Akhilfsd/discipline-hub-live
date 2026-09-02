'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'Daily Habits & Scan' | 'SQL Roadmap' | 'Pomodoro Timer' | 'Analytics & Heatmap';

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
  { id: 'h1', title: 'Power BI Lecture & Practice', category: 'Productivity', completed: {} },
  { id: 'h2', title: 'LeetCode SQL Medium Problem', category: 'Productivity', completed: {} },
  { id: 'h3', title: 'Morning Workout & Stretching', category: 'Health', completed: {} },
];

const detailedSqlTopics: Omit<SqlTopic, 'completed'>[] = [
  {
    id: 1,
    title: 'SELECT, WHERE, and Filtering',
    category: 'Basics',
    notes: 'Fundamental data retrieval. Use WHERE to filter rows based on conditions. Remember execution order: FROM -> WHERE -> SELECT.',
    syntax: `SELECT column1, column2\nFROM table_name\nWHERE condition = 'value'\nORDER BY column1 DESC;`,
    problem: 'Find all employees in the "Engineering" department with a salary greater than 75000.',
    solution: `SELECT emp_name, salary \nFROM employees \nWHERE department = 'Engineering' AND salary > 75000;`
  },
  {
    id: 2,
    title: 'GROUP BY & HAVING Aggregations',
    category: 'Aggregations',
    notes: 'GROUP BY aggregates rows sharing common values. Use HAVING to filter groups (since WHERE cannot filter aggregate functions like SUM or COUNT).',
    syntax: `SELECT category, COUNT(*), AVG(price)\nFROM products\nGROUP BY category\nHAVING AVG(price) > 50;`,
    problem: 'List departments that have an average salary greater than 60000, along with their average salary.',
    solution: `SELECT department, AVG(salary) AS avg_sal \nFROM employees \nGROUP BY department \nHAVING AVG(salary) > 60000;`
  },
  {
    id: 3,
    title: 'INNER JOIN vs LEFT JOIN',
    category: 'Joins',
    notes: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table, and matched rows from the right table (NULLs if no match).',
    syntax: `SELECT a.name, b.order_date\nFROM customers a\nLEFT JOIN orders b ON a.id = b.customer_id;`,
    problem: 'Retrieve a list of all customers and their corresponding order IDs, including customers who have never placed an order.',
    solution: `SELECT c.customer_name, o.order_id \nFROM customers c \nLEFT JOIN orders o ON c.id = o.customer_id;`
  },
  {
    id: 4,
    title: 'Subqueries & Nested Selects',
    category: 'Subqueries',
    notes: 'A query nested inside another query (SELECT, FROM, or WHERE). Use scalar subqueries for single values, or IN/EXISTS for multi-row checks.',
    syntax: `SELECT emp_name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);`,
    problem: 'Find employees who earn more than the department average salary.',
    solution: `SELECT e.emp_name, e.salary \nFROM employees e \nWHERE e.salary > (\n    SELECT AVG(sub.salary) \n    FROM employees sub \n    WHERE sub.department = e.department\n);`
  },
  {
    id: 5,
    title: 'Common Table Expressions (CTEs)',
    category: 'Advanced',
    notes: 'CTEs (WITH clause) provide a temporary result set that you can reference within a SELECT, INSERT, UPDATE, or DELETE statement. Improves readability over subqueries.',
    syntax: `WITH HighEarners AS (\n    SELECT id, name, salary FROM employees WHERE salary > 80000\n)\nSELECT * FROM HighEarners ORDER BY salary DESC;`,
    problem: 'Find the top 2 highest-paid employees in each department using a CTE and ranking logic.',
    solution: `WITH RankedEmp AS (\n    SELECT emp_name, department, salary,\n           ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) as rn\n    FROM employees\n)\nSELECT emp_name, department, salary \nFROM RankedEmp \nWHERE rn <= 2;`
  },
  {
    id: 6,
    title: 'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
    category: 'Window Functions',
    notes: 'Window functions perform calculations across a set of table rows that are somehow related to the current row, without collapsing rows like GROUP BY does.',
    syntax: `SELECT emp_name, salary,\n       RANK() OVER(PARTITION BY department ORDER BY salary DESC) as rnk\nFROM employees;`,
    problem: 'Assign a dense rank to employees based on their salary within their respective departments.',
    solution: `SELECT emp_name, department, salary,\n       DENSE_RANK() OVER(PARTITION BY department ORDER BY salary DESC) as dense_rk\nFROM employees;`
  },
  {
    id: 7,
    title: 'Self Joins & Hierarchical Data',
    category: 'Joins',
    notes: 'A self join is a regular join, but the table is joined with itself. Useful for hierarchical data like organizational charts (Manager -> Employee).',
    syntax: `SELECT e.name AS Employee, m.name AS Manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;`,
    problem: 'Write a query to display each employee name alongside their direct manager name.',
    solution: `SELECT emp.emp_name AS Employee, mgr.emp_name AS Manager \nFROM employees emp \nLEFT JOIN employees mgr ON emp.manager_id = mgr.id;`
  },
  {
    id: 8,
    title: 'Conditional Expressions (CASE WHEN)',
    category: 'Logic',
    notes: 'Evaluates a list of conditions and returns one of multiple possible result expressions. Equivalent to if-then-else statements in programming.',
    syntax: `SELECT name,\n       CASE \n           When salary > 90000 THEN 'Senior'\n           ELSE 'Standard'\n       END AS level\nFROM employees;`,
    problem: 'Categorize employees into salary brackets: "High" (>100k), "Medium" (50k-100k), and "Low" (<50k).',
    solution: `SELECT emp_name, salary,\n       CASE \n           WHEN salary > 100000 THEN 'High'\n           WHEN salary BETWEEN 50000 AND 100000 THEN 'Medium'\n           ELSE 'Low'\n       END AS salary_bracket\nFROM employees;`
  }
];

const initialSqlRoadmap: SqlTopic[] = detailedSqlTopics.map(item => ({
  ...item,
  completed: false
}));

const disciplineQuotes = [
  "Your future self is built in the hours you spend alone working in silence.",
  "Discipline is choosing between what you want now and what you want most.",
  "We suffer more in imagination than in reality. Execution cures all anxiety.",
  "Small daily disciplines repeated consistently lead to great achievements."
];

export default function DisciplineHubPro() {
  const [activeTab, setActiveTab] = useState<Tab>('SQL Roadmap');
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

  useEffect(() => {
    const savedHabits = localStorage.getItem('dh_habits');
    if (savedHabits) setHabits(JSON.parse(savedHabits));

    const savedSql = localStorage.getItem('dh_sql_roadmap_v2');
    if (savedSql) setSqlRoadmap(JSON.parse(savedSql));

    const savedTarget = localStorage.getItem('dh_target_date');
    if (savedTarget) setTargetDate(savedTarget);
  }, []);

  useEffect(() => {
    const savedReflection = localStorage.getItem(`dh_reflection_${currentDate}`);
    setReflection(savedReflection || '');
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dh_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('dh_sql_roadmap_v2', JSON.stringify(sqlRoadmap));
  }, [sqlRoadmap]);

  const handleTargetDateChange = (newDate: string) => {
    setTargetDate(newDate);
    localStorage.setItem('dh_target_date', newDate);
    setIsEditingTarget(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => setPomodoroSeconds(prev => prev - 1), 1000);
    } else if (pomodoroSeconds === 0) {
      setIsPomodoroRunning(false);
    }
    return () => clearInterval(timer);
  }, [isPomodoroRunning, pomodoroSeconds]);

  const getDailyQuote = (dateStr: string) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return disciplineQuotes[Math.abs(hash) % disciplineQuotes.length];
  };

  const currentQuote = getDailyQuote(currentDate);
  const todayHabits = habits.filter(h => h.completed[currentDate]);
  const completionPercent = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;
  const grade = completionPercent >= 90 ? 'A' : completionPercent >= 80 ? 'B' : completionPercent >= 70 ? 'C' : 'D';
  const completedSqlCount = sqlRoadmap.filter(s => s.completed).length;

  const timeDifference = new Date(targetDate).getTime() - new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));

  const toggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => h.id === id ? { ...h, completed: { ...h.completed, [currentDate]: !h.completed[currentDate] } } : h)
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setHabits([...habits, { id: Math.random().toString(36).substring(2, 9), title: newTitle.trim(), category: newCategory, completed: {} }]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const toggleSqlTopic = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSqlRoadmap(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    if (selectedSqlTopic && selectedSqlTopic.id === id) {
      setSelectedSqlTopic(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const filteredHabits = filterCategory === 'All' ? habits : habits.filter(h => h.category === filterCategory);

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', width: '100%', padding: '20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* TOP HEADER */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#34d399', margin: 0 }}>Discipline & SQL Mastery Hub</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Target Date: {daysRemaining} days remaining ({targetDate})</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '13px', padding: '8px 12px', borderRadius: '10px', outline: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* QUOTE BANNER */}
        <div style={{ backgroundColor: '#161b2e', borderRadius: '12px', padding: '14px 20px', border: '1px solid #1e293b', fontStyle: 'italic', color: '#cbd5e1', fontSize: '14px' }}>
          "{currentQuote}"
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '8px', borderRadius: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { name: 'SQL Roadmap' },
            { name: 'Daily Habits & Scan' },
            { name: 'Pomodoro Timer' },
            { name: 'Analytics & Heatmap' },
          ].map((tab) => {
            const isSelected = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name as Tab)}
                style={{
                  flex: '1 1 150px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #059669' : '1px solid transparent',
                  backgroundColor: isSelected ? '#064e3b' : 'transparent',
                  color: isSelected ? '#34d399' : '#94a3b8',
                }}
              >
                {tab.name === 'SQL Roadmap' ? `SQL Roadmap (${completedSqlCount}/${sqlRoadmap.length})` : tab.name}
              </button>
            );
          })}
        </div>

        {/* TAB: SQL ROADMAP WITH DETAILED CONTENT */}
        {activeTab === 'SQL Roadmap' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>SQL Interview & Practice Modules</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Click any module card below to view detailed concept notes, important syntax formulae, and practical problem statements.</p>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '8px' }}>
                Progress: {Math.round((completedSqlCount / sqlRoadmap.length) * 100)}%
              </span>
            </div>

            {/* Grid of Topics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {sqlRoadmap.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedSqlTopic(topic)}
                  style={{
                    backgroundColor: topic.completed ? '#064e3b22' : '#161b2e',
                    border: topic.completed ? '1px solid #059669' : '1px solid #334155',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '6px' }}>
                      {topic.category}
                    </span>
                    <div 
                      onClick={(e) => toggleSqlTopic(topic.id, e)}
                      style={{
                        width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0,
                        border: topic.completed ? '1px solid #34d399' : '1px solid #475569',
                        backgroundColor: topic.completed ? '#34d399' : '#0f172a',
                        color: topic.completed ? '#020617' : 'transparent'
                      }}
                    >
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: topic.completed ? '#34d399' : '#f8fafc', margin: '0 0 6px 0' }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {topic.notes}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '600' }}>📖 View Notes & Practice</span>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL FOR SQL TOPIC DETAILS */}
        {selectedSqlTopic && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '6px' }}>{selectedSqlTopic.category}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', margin: '8px 0 0 0' }}>{selectedSqlTopic.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedSqlTopic(null)}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '16px', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* Notes */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>📖 Concept Notes</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{selectedSqlTopic.notes}</p>
              </div>

              {/* Syntax & Formula */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>⚡ Important Syntax & Formula</h4>
                <pre style={{ backgroundColor: '#020617', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                  {selectedSqlTopic.syntax}
                </pre>
              </div>

              {/* Practical Problem & Solution */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>💡 Practical Problem</h4>
                <p style={{ fontSize: '13px', color: '#f8fafc', margin: 0, fontWeight: '600' }}>{selectedSqlTopic.problem}</p>
                <div>
                  <p style={{ fontSize: '11px', color: '#818cf8', fontWeight: 'bold', margin: '0 0 4px 0' }}>Optimal Solution:</p>
                  <pre style={{ backgroundColor: '#020617', color: '#818cf8', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                    {selectedSqlTopic.solution}
                  </pre>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button 
                  onClick={() => toggleSqlTopic(selectedSqlTopic.id)}
                  style={{ backgroundColor: selectedSqlTopic.completed ? '#065f46' : '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {selectedSqlTopic.completed ? '✓ Module Completed' : 'Mark as Completed'}
                </button>
                <button 
                  onClick={() => setSelectedSqlTopic(null)}
                  style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: DAILY HABITS & SCAN */}
        {activeTab === 'Daily Habits & Scan' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>Daily Task Board & Completion</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', backgroundColor: '#451a03', color: '#fde047', padding: '4px 10px', borderRadius: '6px' }}>Grade: {grade}</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>{completionPercent}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Health', 'Productivity', 'Mindset', 'Habits'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      fontSize: '12px', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                      backgroundColor: filterCategory === cat ? '#334155' : '#161b2e',
                      color: filterCategory === cat ? '#f8fafc' : '#94a3b8'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                style={{ backgroundColor: '#059669', color: '#fff', border: 'none', fontSize: '13px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
              >
                + Add Activity
              </button>
            </div>

            {showAddModal && (
              <form onSubmit={handleAddHabit} style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '14px', borderRadius: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Activity title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ flex: '1 1 200px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#fff', outline: 'none' }}
                  autoFocus
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#fff', outline: 'none' }}
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Health">Health</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Habits">Habits</option>
                </select>
                <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>Save</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredHabits.map(habit => {
                const isCompleted = !!habit.completed[currentDate];
                return (
                  <div 
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', cursor: 'pointer',
                      border: isCompleted ? '1px solid #065f46' : '1px solid #1e293b',
                      backgroundColor: isCompleted ? '#064e3b33' : '#161b2e'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                        border: isCompleted ? '1px solid #34d399' : '1px solid #475569',
                        backgroundColor: isCompleted ? '#34d399' : '#0f172a',
                        color: isCompleted ? '#020617' : 'transparent'
                      }}>
                        ✓
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: isCompleted ? '#34d399' : '#f8fafc', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {habit.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#94a3b8' }}>
                      {habit.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: POMODORO TIMER */}
        {activeTab === 'Pomodoro Timer' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>Deep Focus Session</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setPomodoroMode('work'); setPomodoroSeconds(25 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: pomodoroMode === 'work' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Work (25m)
              </button>
              <button 
                onClick={() => { setPomodoroMode('break'); setPomodoroSeconds(5 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: pomodoroMode === 'break' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Break (5m)
              </button>
            </div>
            
            <div style={{ fontSize: 'clamp(54px, 12vw, 84px)', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.05em' }}>
              {String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0')}:{String(pomodoroSeconds % 60).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                style={{ backgroundColor: isPomodoroRunning ? '#dc2626' : '#059669', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isPomodoroRunning ? 'Pause Session' : 'Start Focus'}
              </button>
              <button 
                onClick={() => { setIsPomodoroRunning(false); setPomodoroSeconds(pomodoroMode === 'work' ? 25 * 60 : 5 * 60); }}
                style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS & HEATMAP */}
        {activeTab === 'Analytics & Heatmap' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>Analytics & Consistency</h2>
            <div style={{ backgroundColor: '#161b2e', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Active Execution Scorecard</p>
              <p style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', margin: 0 }}>🔥 On Track</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Keep completing your daily SQL modules and task items consistently to achieve your goals by {targetDate}.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
