'use client';

import React, { useState, useEffect, useRef } from 'react';

type Tab = 'Daily Habits & Scan' | 'SQL Roadmap' | 'Pomodoro Timer' | 'Analytics & Heatmap';

interface Habit {
  id: string;
  title: string;
  category: 'Health' | 'Productivity' | 'Mindset' | 'Habits';
  completed: { [date: string]: boolean };
}

interface SubTopic {
  id: string;
  title: string;
  notes: string;
  syntax: string;
  problem: string;
  solution: string;
}

interface SqlModule {
  id: number;
  title: string;
  category: string;
  completed: boolean;
  overview: string;
  subtopics: SubTopic[];
}

const initialHabits: Habit[] = [
  { id: 'h1', title: 'Power BI Lecture & Practice', category: 'Productivity', completed: {} },
  { id: 'h2', title: 'LeetCode SQL Medium Problem', category: 'Productivity', completed: {} },
  { id: 'h3', title: 'Morning Workout & Stretching', category: 'Health', completed: {} },
];

const detailedSqlModules: Omit<SqlModule, 'completed'>[] = [
  {
    id: 1,
    title: '1. Fundamentals: SELECT, WHERE, and Filtering',
    category: 'Basics',
    overview: 'Master data retrieval, conditional filtering, projection, and ordering from single relational database tables.',
    subtopics: [
      {
        id: '1a',
        title: '1.1 Basic SELECT and Column Projections',
        notes: 'Retrieving exact columns reduces network traffic and database overhead compared to SELECT *. Use DISTINCT to filter out duplicate rows from your result set.',
        syntax: `SELECT DISTINCT column1, column2 \nFROM table_name \nLIMIT 10;`,
        problem: 'Fetch unique job titles from the employees table.',
        solution: `SELECT DISTINCT job_title \nFROM employees;`
      },
      {
        id: '1b',
        title: '1.2 WHERE Clause Conditional Filtering',
        notes: 'Filters rows prior to aggregation. Supports operators like =, <>, >, <, BETWEEN, LIKE (wildcards % and _), and IN.',
        syntax: `SELECT * \nFROM employees \nWHERE department = 'Sales' AND salary BETWEEN 50000 AND 90000;`,
        problem: 'Find employees whose names start with letter "A" and earn more than 60000.',
        solution: `SELECT * \nFROM employees \nWHERE emp_name LIKE 'A%' AND salary > 60000;`
      },
      {
        id: '1c',
        title: '1.3 Sorting with ORDER BY & Limiting',
        notes: 'Controls result presentation order using ASC (ascending, default) or DESC (descending). Use LIMIT/OFFSET for pagination.',
        syntax: `SELECT * \nFROM employees \nORDER BY salary DESC, emp_name ASC \nLIMIT 5;`,
        problem: 'Find the top 3 highest paid employees.',
        solution: `SELECT emp_name, salary \nFROM employees \nORDER BY salary DESC \nLIMIT 3;`
      }
    ]
  },
  {
    id: 2,
    title: '2. Aggregations: GROUP BY & HAVING',
    category: 'Aggregations',
    overview: 'Summarize large datasets using aggregate functions (COUNT, SUM, AVG, MIN, MAX) across categories.',
    subtopics: [
      {
        id: '2a',
        title: '2.1 Aggregate Functions & GROUP BY',
        notes: 'GROUP BY collapses rows with identical grouping keys into single summary rows. Every column in SELECT must either be in GROUP BY or wrapped in an aggregate function.',
        syntax: `SELECT department, COUNT(*) AS total_staff, AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department;`,
        problem: 'Calculate the total count and average salary of employees per department.',
        solution: `SELECT department, COUNT(id) AS headcount, AVG(salary) AS avg_salary \nFROM employees \nGROUP BY department;`
      },
      {
        id: '2b',
        title: '2.2 Filtering Groups with HAVING',
        notes: 'WHERE filters individual rows BEFORE grouping. HAVING filters aggregated groups AFTER GROUP BY execution.',
        syntax: `SELECT department, AVG(salary)\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 75000;`,
        problem: 'List departments that have a total salary expenditure exceeding 300,000.',
        solution: `SELECT department, SUM(salary) AS total_exp\nFROM employees\nGROUP BY department\nHAVING SUM(salary) > 300000;`
      }
    ]
  },
  {
    id: 3,
    title: '3. Relational Joins (INNER, LEFT, RIGHT, FULL)',
    category: 'Joins',
    overview: 'Combine columns from two or more tables based on related logical columns between them.',
    subtopics: [
      {
        id: '3a',
        title: '3.1 INNER JOIN',
        notes: 'Returns only the records that have matching values in both tables.',
        syntax: `SELECT e.emp_name, d.dept_name\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.id;`,
        problem: 'Get a list of all employees along with their respective department names.',
        solution: `SELECT e.emp_name, d.dept_name \nFROM employees e \nINNER JOIN departments d ON e.dept_id = d.id;`
      },
      {
        id: '3b',
        title: '3.2 LEFT JOIN & Unmatched Null Checks',
        notes: 'Returns all records from the left table, and the matched records from the right table. Unmatched right rows evaluate to NULL.',
        syntax: `SELECT c.customer_name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.order_id IS NULL;`,
        problem: 'Find all customers who have never placed an order.',
        solution: `SELECT c.customer_name \nFROM customers c \nLEFT JOIN orders o ON c.id = o.customer_id \nWHERE o.order_id IS NULL;`
      }
    ]
  },
  {
    id: 4,
    title: '4. Subqueries & Nested Queries',
    category: 'Subqueries',
    overview: 'Execute independent inner queries to supply dynamic criteria or datasets to outer queries.',
    subtopics: [
      {
        id: '4a',
        title: '4.1 Scalar & Multi-Row Subqueries (IN / EXISTS)',
        notes: 'Scalar subqueries return a single value. Multi-row subqueries work with operators like IN, ANY, ALL, or EXISTS for high-performance correlation.',
        syntax: `SELECT emp_name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);`,
        problem: 'Find employees earning higher than the company-wide average salary.',
        solution: `SELECT emp_name, salary \nFROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);`
      },
      {
        id: '4b',
        title: '4.2 Correlated Subqueries',
        notes: 'A subquery that depends on values from the outer query, executed repeatedly for each row evaluated by the outer query.',
        syntax: `SELECT e.emp_name, e.department, e.salary\nFROM employees e\nWHERE e.salary > (\n    SELECT AVG(sub.salary)\n    FROM employees sub\n    WHERE sub.department = e.department\n);`,
        problem: 'Find employees who earn more than their own department average salary.',
        solution: `SELECT e.emp_name, e.department, e.salary \nFROM employees e \nWHERE e.salary > (\n    SELECT AVG(sub.salary) FROM employees sub WHERE sub.department = e.department\n);`
      }
    ]
  },
  {
    id: 5,
    title: '5. Common Table Expressions (CTEs)',
    category: 'Advanced',
    overview: 'Write modular, highly readable temporary result sets using the WITH clause syntax.',
    subtopics: [
      {
        id: '5a',
        title: '5.1 Standard CTEs vs Subqueries',
        notes: 'CTEs improve query readability, allow self-referencing recursion, and can be referenced multiple times within a single main query.',
        syntax: `WITH HighEarners AS (\n    SELECT * FROM employees WHERE salary > 90000\n)\nSELECT department, COUNT(*) FROM HighEarners GROUP BY department;`,
        problem: 'Find the count of high earners (salary > 90k) per department using a CTE.',
        solution: `WITH HighEarners AS (\n    SELECT department FROM employees WHERE salary > 90000\n)\nSELECT department, COUNT(*) AS count_high \nFROM HighEarners \nGROUP BY department;`
      }
    ]
  },
  {
    id: 6,
    title: '6. Window Functions & Ranking',
    category: 'Window Functions',
    overview: 'Perform calculations across partitions of rows without collapsing the underlying row count.',
    subtopics: [
      {
        id: '6a',
        title: '6.1 ROW_NUMBER, RANK, and DENSE_RANK',
        notes: 'ROW_NUMBER gives unique sequential numbers. RANK skips numbers after ties. DENSE_RANK assigns consecutive ranks without gaps.',
        syntax: `SELECT emp_name, salary,\n       ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) as rn\nFROM employees;`,
        problem: 'Find the single highest-paid employee in each department.',
        solution: `WITH Ranked AS (\n    SELECT emp_name, department, salary,\n           ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) as rn\n    FROM employees\n)\nSELECT emp_name, department, salary FROM Ranked WHERE rn = 1;`
      }
    ]
  },
  {
    id: 7,
    title: '7. Advanced Logic & Conditional Expressions',
    category: 'Logic',
    overview: 'Implement conditional branching and data transformation directly inside SQL queries.',
    subtopics: [
      {
        id: '7a',
        title: '7.1 CASE WHEN Conditional Branching',
        notes: 'Performs if-then-else logic within SELECT, ORDER BY, or GROUP BY statements.',
        syntax: `SELECT emp_name,\n       CASE \n           WHEN salary >= 100000 THEN 'Executive'\n           WHEN salary >= 60000 THEN 'Senior'\n           ELSE 'Standard'\n       END AS tier\nFROM employees;`,
        problem: 'Categorize employees into salary brackets ("High", "Medium", "Low").',
        solution: `SELECT emp_name, salary,\n       CASE \n           WHEN salary > 100000 THEN 'High'\n           WHEN salary BETWEEN 50000 AND 100000 THEN 'Medium'\n           ELSE 'Low'\n       END AS bracket\nFROM employees;`
      }
    ]
  }
];

const initialSqlRoadmap: SqlModule[] = detailedSqlModules.map(item => ({
  ...item,
  completed: false
}));

const disciplineQuotes = [
  "Your future self is built in the hours you spend alone working in silence.",
  "Discipline is choosing between what you want now and what you want most.",
  "We suffer more in imagination than in reality. Execution cures all anxiety.",
  "Small daily disciplines repeated consistently lead to great achievements."
];

export default function DisciplineHubUltimate() {
  const [activeTab, setActiveTab] = useState<Tab>('SQL Roadmap');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState<string>('2026-12-02');
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [sqlRoadmap, setSqlRoadmap] = useState<SqlModule[]>(initialSqlRoadmap);
  const [selectedSqlModule, setSelectedSqlModule] = useState<SqlModule | null>(null);

  const [reflection, setReflection] = useState<string>('');
  const [scanNotes, setScanNotes] = useState<string>('');
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Health' | 'Productivity' | 'Mindset' | 'Habits'>('Productivity');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Pomodoro States
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  // Load saved state
  useEffect(() => {
    const savedHabits = localStorage.getItem('dh_habits_ult_v3');
    if (savedHabits) setHabits(JSON.parse(savedHabits));

    const savedSql = localStorage.getItem('dh_sql_ult_v3');
    if (savedSql) setSqlRoadmap(JSON.parse(savedSql));

    const savedTarget = localStorage.getItem('dh_target_ult_v3');
    if (savedTarget) setTargetDate(savedTarget);
  }, []);

  useEffect(() => {
    const savedRef = localStorage.getItem(`dh_ref_ult_v3_${currentDate}`);
    setReflection(savedRef || '');

    const savedScan = localStorage.getItem(`dh_scan_ult_v3_${currentDate}`);
    setScanNotes(savedScan || '');

    const savedImgs = localStorage.getItem(`dh_imgs_ult_v3_${currentDate}`);
    if (savedImgs) setScannedImages(JSON.parse(savedImgs));
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dh_habits_ult_v3', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('dh_sql_ult_v3', JSON.stringify(sqlRoadmap));
  }, [sqlRoadmap]);

  const handleTargetDateChange = (newDate: string) => {
    setTargetDate(newDate);
    localStorage.setItem('dh_target_ult_v3', newDate);
    setIsEditingTarget(false);
  };

  const handleReflectionChange = (val: string) => {
    setReflection(val);
    localStorage.setItem(`dh_ref_ult_v3_${currentDate}`, val);
  };

  const handleScanNotesChange = (val: string) => {
    setScanNotes(val);
    localStorage.setItem(`dh_scan_ult_v3_${currentDate}`, val);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const updated = [...scannedImages, uploadEvent.target.result as string];
          setScannedImages(updated);
          localStorage.setItem(`dh_imgs_ult_v3_${currentDate}`, JSON.stringify(updated));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    const updated = scannedImages.filter((_, i) => i !== index);
    setScannedImages(updated);
    localStorage.setItem(`dh_imgs_ult_v3_${currentDate}`, JSON.stringify(updated));
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

  const deleteHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setHabits([...habits, { id: Math.random().toString(36).substring(2, 9), title: newTitle.trim(), category: newCategory, completed: {} }]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const toggleSqlModule = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSqlRoadmap(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    if (selectedSqlModule && selectedSqlModule.id === id) {
      setSelectedSqlModule(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const filteredHabits = filterCategory === 'All' ? habits : habits.filter(h => h.category === filterCategory);

  const heatmapDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', width: '100%', padding: '24px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* TOP HEADER: MISSION TARGET COUNTDOWN & DATE SELECTOR */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', margin: 0 }}>Discipline & SQL Mastery Hub</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fde047', backgroundColor: '#451a03', padding: '4px 10px', borderRadius: '6px' }}>
                🎯 Target Countdown: {daysRemaining} Days Left ({targetDate})
              </span>
              {!isEditingTarget ? (
                <button onClick={() => setIsEditingTarget(true)} style={{ background: 'transparent', border: 'none', color: '#34d399', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontWeight: '600' }}>Edit</button>
              ) : (
                <input
                  type="date"
                  defaultValue={targetDate}
                  onChange={(e) => handleTargetDateChange(e.target.value)}
                  style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '13px', padding: '4px 8px', borderRadius: '6px' }}
                />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>Active Date:</span>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '14px', padding: '8px 14px', borderRadius: '10px', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
            />
          </div>
        </div>

        {/* QUOTE BANNER */}
        <div style={{ backgroundColor: '#161b2e', borderRadius: '12px', padding: '16px 22px', border: '1px solid #1e293b', fontStyle: 'italic', color: '#cbd5e1', fontSize: '15px', lineHeight: '1.5' }}>
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
                  flex: '1 1 160px',
                  padding: '14px 18px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #059669' : '1px solid transparent',
                  backgroundColor: isSelected ? '#064e3b' : 'transparent',
                  color: isSelected ? '#34d399' : '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.name === 'SQL Roadmap' ? `SQL Roadmap (${completedSqlCount}/${sqlRoadmap.length})` : tab.name}
              </button>
            );
          })}
        </div>

        {/* TAB: SQL ROADMAP (ELABORATE MODULES) */}
        {activeTab === 'SQL Roadmap' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>Comprehensive SQL Interview & Practice Roadmap</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Click any module card below to open elaborate subtopics, in-depth notes, syntax, and practical examples.</p>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '8px' }}>
                Overall Progress: {Math.round((completedSqlCount / sqlRoadmap.length) * 100)}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {sqlRoadmap.map(mod => (
                <div
                  key={mod.id}
                  onClick={() => setSelectedSqlModule(mod)}
                  style={{
                    backgroundColor: mod.completed ? '#064e3b22' : '#161b2e',
                    border: mod.completed ? '1px solid #059669' : '1px solid #334155',
                    padding: '20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '6px' }}>
                      {mod.category}
                    </span>
                    <div 
                      onClick={(e) => toggleSqlModule(mod.id, e)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0,
                        border: mod.completed ? '1px solid #34d399' : '1px solid #475569',
                        backgroundColor: mod.completed ? '#34d399' : '#0f172a',
                        color: mod.completed ? '#020617' : 'transparent'
                      }}
                    >
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: mod.completed ? '#34d399' : '#f8fafc', margin: '0 0 6px 0' }}>
                      {mod.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {mod.overview}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>📖 View {mod.subtopics.length} Elaborate Subtopics</span>
                    <span style={{ fontSize: '13px', color: '#cbd5e1' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ELABORATE MODAL FOR SQL MODULE SUBTOPICS */}
        {selectedSqlModule && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8', backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '6px' }}>{selectedSqlModule.category} Module</span>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#34d399', margin: '8px 0 4px 0' }}>{selectedSqlModule.title}</h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{selectedSqlModule.overview}</p>
                </div>
                <button 
                  onClick={() => setSelectedSqlModule(null)}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '16px', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>

              {/* LIST OF SUBTOPICS IN ELABORATE DETAIL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
                {selectedSqlModule.subtopics.map((sub, index) => (
                  <div key={sub.id} style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#34d399', margin: 0 }}>
                      {sub.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>Detailed Notes & Concepts:</span>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{sub.notes}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>Syntax Formula:</span>
                      <pre style={{ backgroundColor: '#020617', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', margin: 0, fontFamily: 'monospace', lineHeight: '1.4' }}>
                        {sub.syntax}
                      </pre>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8' }}>Practical Problem:</span>
                      <p style={{ fontSize: '13px', color: '#f8fafc', margin: 0, fontWeight: '600' }}>{sub.problem}</p>
                      
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#34d399', marginTop: '4px' }}>Optimal Solution Query:</span>
                      <pre style={{ backgroundColor: '#020617', color: '#34d399', padding: '10px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: 0, fontFamily: 'monospace', lineHeight: '1.4' }}>
                        {sub.solution}
                      </pre>
                    </div>

                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <button 
                  onClick={() => toggleSqlModule(selectedSqlModule.id)}
                  style={{ backgroundColor: selectedSqlModule.completed ? '#065f46' : '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {selectedSqlModule.completed ? '✓ Module Completed' : 'Mark Module as Completed'}
                </button>
                <button 
                  onClick={() => setSelectedSqlModule(null)}
                  style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: DAILY HABITS, COMPLETION RATE, SCAN & NOTES */}
        {activeTab === 'Daily Habits & Scan' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TODAY'S COMPLETION RATE HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#161b2e', padding: '18px 20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>Today's Completion Rate</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>Date: {currentDate}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', backgroundColor: '#451a03', color: '#fde047', padding: '6px 12px', borderRadius: '8px' }}>Grade: {grade}</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#34d399' }}>{completionPercent}%</span>
              </div>
            </div>

            {/* Task Filters & Add Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                style={{ backgroundColor: '#059669', color: '#fff', border: 'none', fontSize: '13px', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
              >
                + Add Activity
              </button>
            </div>

            {showAddModal && (
              <form onSubmit={handleAddHabit} style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Activity title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ flex: '1 1 220px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                  autoFocus
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Health">Health</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Habits">Habits</option>
                </select>
                <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>Save</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </form>
            )}

            {/* Task Checklist */}
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
                        width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#94a3b8' }}>
                        {habit.category}
                      </span>
                      <button 
                        onClick={(e) => deleteHabit(habit.id, e)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SCAN, NOTES & PHOTO UPLOAD SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '10px' }}>
              
              {/* Daily Reflection Journal */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>📝 Daily Reflection & Journal</h3>
                <textarea
                  placeholder="Record your daily learnings or blockers..."
                  value={reflection}
                  onChange={(e) => handleReflectionChange(e.target.value)}
                  style={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#fff', minHeight: '100px', outline: 'none', resize: 'vertical', lineHeight: '1.4' }}
                />
              </div>

              {/* Scan Notes & Photo Upload */}
              <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>📷 Scan Notes & Photos</h3>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Upload Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
                
                <textarea
                  placeholder="Paste OCR text or notes from your scanned photos..."
                  value={scanNotes}
                  onChange={(e) => handleScanNotesChange(e.target.value)}
                  style={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#fff', minHeight: '60px', outline: 'none', resize: 'vertical', lineHeight: '1.4' }}
                />

                {scannedImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {scannedImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                        <img src={img} alt="Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#ef4444', border: 'none', fontSize: '11px', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: pomodoroMode === 'work' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Work (25m)
              </button>
              <button 
                onClick={() => { setPomodoroMode('break'); setPomodoroSeconds(5 * 60); setIsPomodoroRunning(false); }}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: pomodoroMode === 'break' ? '#059669' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Break (5m)
              </button>
            </div>
            
            <div style={{ fontSize: 'clamp(60px, 12vw, 96px)', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.05em' }}>
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
                style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '12px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS & HEATMAP */}
        {activeTab === 'Analytics & Heatmap' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', margin: 0 }}>Analytics & Consistency Heatmap</h2>
            
            <div style={{ backgroundColor: '#161b2e', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Active Execution Scorecard</p>
              <p style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', margin: 0 }}>🔥 {completionPercent}% Today ({todayHabits.length}/{habits.length} Habits Completed)</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Keep completing your daily SQL modules and task items consistently to achieve your goals by {targetDate}.</p>
            </div>

            <div style={{ backgroundColor: '#161b2e', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>Last 28 Days Activity Grid</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {heatmapDays.map((day) => {
                  const dayHabits = habits.filter(h => h.completed[day]).length;
                  const ratio = habits.length > 0 ? dayHabits / habits.length : 0;
                  let bg = '#1e293b';
                  if (ratio > 0.75) bg = '#059669';
                  else if (ratio > 0.4) bg = '#047857';
                  else if (ratio > 0) bg = '#065f46';

                  return (
                    <div
                      key={day}
                      title={`${day}: ${dayHabits}/${habits.length} completed`}
                      style={{
                        backgroundColor: bg,
                        height: '38px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: ratio > 0 ? '#fff' : '#64748b',
                        fontWeight: 'bold',
                        border: day === currentDate ? '1px solid #34d399' : '1px solid transparent'
                      }}
                    >
                      {day.split('-')[2]}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                <span>28 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
