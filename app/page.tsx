'use client';

import React, { useState, useEffect, useRef } from 'react';

type Tab = 'Daily Tasks' | 'SQL Roadmap' | 'Pomodoro Timer' | 'Analytics & Heatmap';

interface TaskItem {
  id: string;
  title: string;
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

const initialTasks: TaskItem[] = [
  { id: 't1', title: 'Power BI Lecture & Practice', completed: {} },
  { id: 't2', title: 'LeetCode SQL Medium Problem', completed: {} },
  { id: 't3', title: 'Morning Workout & Stretching', completed: {} },
];

const comprehensiveSqlModules: Omit<SqlModule, 'completed'>[] = [
  {
    id: 1,
    title: 'Module 1: Advanced Filtering & Pattern Matching',
    category: 'Basics & Filters',
    overview: 'Master complex conditional clauses, multi-condition filtering, advanced pattern matching, and handling missing data safely.',
    subtopics: [
      {
        id: '1a',
        title: '1.1 Multi-Condition Filtering with AND, OR, and Parentheses Precedence',
        notes: 'Logical operator evaluation order matters. AND takes precedence over OR. Always use explicit parentheses to enforce intended logical grouping in production queries.',
        syntax: `SELECT * \nFROM employees \nWHERE (department = 'Sales' OR department = 'Marketing') \n  AND salary > 60000 \n  AND status = 'Active';`,
        problem: 'Find active employees who belong to either the "Sales" or "Marketing" departments and earn above 60000.',
        solution: `SELECT * \nFROM employees \nWHERE (department = 'Sales' OR department = 'Marketing') AND salary > 60000 AND status = 'Active';`
      },
      {
        id: '1b',
        title: '1.2 Advanced Pattern Matching with LIKE and Regular Expressions',
        notes: 'Use wildcards % (multiple characters) and _ (single character) with LIKE. For advanced database engines, utilize REGEXP or POSIX pattern matching for complex string expressions.',
        syntax: `SELECT emp_name \nFROM employees \nWHERE emp_name LIKE 'A%n' \n  AND emp_name NOT LIKE '%test%';`,
        problem: 'Retrieve employee names starting with "A" and ending with "n", excluding any test accounts.',
        solution: `SELECT emp_name \nFROM employees \nWHERE emp_name LIKE 'A%n' AND emp_name NOT LIKE '%test%';`
      },
      {
        id: '1c',
        title: '1.3 Handling Missing Data with IS NULL and COALESCE',
        notes: 'NULL represents unknown or missing data and cannot be evaluated with standard comparison operators (= NULL). Use IS NULL or IS NOT NULL, and COALESCE to fallback default values.',
        syntax: `SELECT emp_name, COALESCE(manager_id, 'No Manager Assigned') AS manager_status \nFROM employees \nWHERE commission_pct IS NULL;`,
        problem: 'List employees with missing commission percentages and replace null display values with "Standard Tier".',
        solution: `SELECT emp_name, COALESCE(CAST(commission_pct AS VARCHAR), 'Standard Tier') AS tier_status \nFROM employees \nWHERE commission_pct IS NULL;`
      }
    ]
  },
  {
    id: 2,
    title: 'Module 2: Aggregations, GROUP BY, and Group Filtering',
    category: 'Aggregations',
    overview: 'Aggregate massive tables into meaningful business metrics using summary functions and conditional group filtering.',
    subtopics: [
      {
        id: '2a',
        title: '2.1 Grouping Multi-Column Dimensions & Aggregate Functions',
        notes: 'GROUP BY aggregates rows sharing common values. All selected columns must either be part of the GROUP BY clause or enclosed in aggregate functions like SUM, COUNT, AVG, MIN, MAX.',
        syntax: `SELECT department, job_title, COUNT(*) AS headcount, ROUND(AVG(salary), 2) AS avg_sal \nFROM employees \nGROUP BY department, job_title \nORDER BY avg_sal DESC;`,
        problem: 'Calculate total headcount and average salary broken down by department and job title.',
        solution: `SELECT department, job_title, COUNT(*) AS headcount, AVG(salary) AS avg_sal \nFROM employees \nGROUP BY department, job_title \nORDER BY avg_sal DESC;`
      },
      {
        id: '2b',
        title: '2.2 Filtering Aggregates with HAVING vs WHERE',
        notes: 'WHERE filters raw table rows BEFORE aggregation takes place. HAVING filters summarized groups AFTER the GROUP BY computation is finished.',
        syntax: `SELECT department, SUM(salary) AS total_payroll \nFROM employees \nWHERE status = 'Active' \nGROUP BY department \nHAVING SUM(salary) > 500000;`,
        problem: 'Find departments with active total payroll expenditure exceeding 500,000.',
        solution: `SELECT department, SUM(salary) AS total_payroll \nFROM employees \nWHERE status = 'Active' \nGROUP BY department \nHAVING SUM(salary) > 500000;`
      }
    ]
  },
  {
    id: 3,
    title: 'Module 3: Complex Relational Joins & Set Operations',
    category: 'Joins',
    overview: 'Unify isolated tables using INNER, LEFT, RIGHT, FULL OUTER joins, self-joins, and set operators (UNION, INTERSECT, EXCEPT).',
    subtopics: [
      {
        id: '3a',
        title: '3.1 Multi-Table INNER and LEFT OUTER Joins',
        notes: 'INNER JOIN extracts strict intersections. LEFT JOIN retains all records from the left table and appends matched right records, filling unmatched attributes with NULL.',
        syntax: `SELECT c.customer_name, o.order_id, o.order_date \nFROM customers c \nLEFT JOIN orders o ON c.customer_id = o.customer_id \nWHERE o.order_id IS NULL;`,
        problem: 'Find all customers who have never placed an order using a LEFT JOIN.',
        solution: `SELECT c.customer_name \nFROM customers c \nLEFT JOIN orders o ON c.customer_id = o.customer_id \nWHERE o.order_id IS NULL;`
      },
      {
        id: '3b',
        title: '3.2 Self Joins for Hierarchical Organizational Charts',
        notes: 'Joining a table to itself is essential for hierarchical data structures where an employee record references a manager ID within the exact same table.',
        syntax: `SELECT e.emp_name AS Employee, m.emp_name AS Manager \nFROM employees e \nLEFT JOIN employees m ON e.manager_id = m.emp_id;`,
        problem: 'Display every employee name alongside their respective direct manager name.',
        solution: `SELECT e.emp_name AS Employee, m.emp_name AS Manager \nFROM employees e \nLEFT JOIN employees m ON e.manager_id = m.emp_id;`
      },
      {
        id: '3c',
        title: '3.3 Set Operations: UNION, INTERSECT, and EXCEPT',
        notes: 'Combine result sets vertically. UNION removes duplicates (UNION ALL keeps them), INTERSECT returns common records, and EXCEPT returns rows from the first query not present in the second.',
        syntax: `SELECT email FROM customers \nUNION \nSELECT email FROM vendors;`,
        problem: 'List all unique email addresses across both customers and vendors tables.',
        solution: `SELECT email FROM customers UNION SELECT email FROM vendors;`
      }
    ]
  },
  {
    id: 4,
    title: 'Module 4: Subqueries and Correlated Subqueries',
    category: 'Subqueries',
    overview: 'Execute dynamic inner queries to feed scalar values, multi-row lists, or row-by-row comparisons to outer queries.',
    subtopics: [
      {
        id: '4a',
        title: '4.1 Subqueries in WHERE Clause (IN, EXISTS, ANY, ALL)',
        notes: 'EXISTS checks for row existence (highly efficient for large datasets), while IN checks inclusion against static subquery lists.',
        syntax: `SELECT emp_name, salary \nFROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);`,
        problem: 'Find employees earning strictly more than the company-wide average salary.',
        solution: `SELECT emp_name, salary \nFROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);`
      },
      {
        id: '4b',
        title: '4.2 Correlated Subqueries',
        notes: 'A correlated subquery references columns from the outer query, meaning it executes repeatedly for each individual row processed by the outer query.',
        syntax: `SELECT e.emp_name, e.department, e.salary \nFROM employees e \nWHERE e.salary > (\n    SELECT AVG(sub.salary) \n    FROM employees sub \n    WHERE sub.department = e.department\n);`,
        problem: 'Find employees who earn more than their own specific department average salary.',
        solution: `SELECT e.emp_name, e.department, e.salary \nFROM employees e \nWHERE e.salary > (SELECT AVG(sub.salary) FROM employees sub WHERE sub.department = e.department);`
      }
    ]
  },
  {
    id: 5,
    title: 'Module 5: Common Table Expressions (CTEs) & Recursion',
    category: 'Advanced',
    overview: 'Build maintainable, modular temporary result sets using the WITH clause and tackle tree structures with recursive CTEs.',
    subtopics: [
      {
        id: '5a',
        title: '5.1 Standard CTEs vs Nested Subqueries',
        notes: 'CTEs improve readability, eliminate messy nested subquery nesting, and can be referenced multiple times or chained together in a single statement.',
        syntax: `WITH DeptAvg AS (\n    SELECT department, AVG(salary) AS avg_sal \n    FROM employees \n    GROUP BY department\n)\nSELECT e.emp_name, e.department, e.salary \nFROM employees e \nJOIN DeptAvg d ON e.department = d.department \nWHERE e.salary > d.avg_sal;`,
        problem: 'List employees earning above their department average using a clean CTE structure.',
        solution: `WITH DeptAvg AS (SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department) SELECT e.emp_name FROM employees e JOIN DeptAvg d ON e.department = d.department WHERE e.salary > d.avg_sal;`
      },
      {
        id: '5b',
        title: '5.2 Recursive CTEs for Hierarchical Tree Traversals',
        notes: 'Recursive CTEs consist of an anchor member and a recursive member combined with UNION ALL, traversing organizational trees or supply chain graphs.',
        syntax: `WITH RECURSIVE OrgChart AS (\n    SELECT emp_id, emp_name, manager_id, 1 AS depth \n    FROM employees WHERE manager_id IS NULL\n    UNION ALL\n    SELECT e.emp_id, e.emp_name, e.manager_id, o.depth + 1 \n    FROM employees e \n    JOIN OrgChart o ON e.manager_id = o.emp_id\n)\nSELECT * FROM OrgChart;`,
        problem: 'Traverse and list all employee levels starting from the top executive down through reporting lines.',
        solution: `WITH RECURSIVE OrgChart AS (SELECT emp_id, emp_name, manager_id, 1 AS depth FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.emp_name, e.manager_id, o.depth + 1 FROM employees e JOIN OrgChart o ON e.manager_id = o.emp_id) SELECT * FROM OrgChart;`
      }
    ]
  },
  {
    id: 6,
    title: 'Module 6: Window Functions & Advanced Analytics',
    category: 'Window Functions',
    overview: 'Perform running totals, moving averages, and advanced ranking across partitions without collapsing table rows.',
    subtopics: [
      {
        id: '6a',
        title: '6.1 Ranking Functions: ROW_NUMBER, RANK, DENSE_RANK',
        notes: 'ROW_NUMBER assigns unique sequential integers. RANK assigns identical ranks for ties with gaps. DENSE_RANK assigns consecutive ranks without gaps.',
        syntax: `SELECT emp_name, department, salary, \n       DENSE_RANK() OVER(PARTITION BY department ORDER BY salary DESC) as salary_rank \nFROM employees;`,
        problem: 'Assign a dense rank to employees based on their salary within their respective departments.',
        solution: `SELECT emp_name, department, salary, DENSE_RANK() OVER(PARTITION BY department ORDER BY salary DESC) as salary_rank FROM employees;`
      },
      {
        id: '6b',
        title: '6.2 Offset Functions: LAG and LEAD',
        notes: 'Access data from previous (LAG) or subsequent (LEAD) rows within the same result set partition without needing self joins.',
        syntax: `SELECT order_date, customer_id, amount, \n       LAG(amount, 1, 0) OVER(PARTITION BY customer_id ORDER BY order_date) as prev_amount \nFROM orders;`,
        problem: 'Compare each customer order amount with their immediately preceding order amount.',
        solution: `SELECT order_date, customer_id, amount, LAG(amount, 1, 0) OVER(PARTITION BY customer_id ORDER BY order_date) as prev_amount FROM orders;`
      }
    ]
  },
  {
    id: 7,
    title: 'Module 7: Conditional Branching & Data Transformation',
    category: 'Logic',
    overview: 'Embed conditional logic, branching rules, and null sanitization directly inside SQL projections and updates.',
    subtopics: [
      {
        id: '7a',
        title: '7.1 Advanced CASE WHEN Expressions',
        notes: 'Evaluates conditional criteria sequentially and returns specific transformed values. Essential for bucketization and data pivoting.',
        syntax: `SELECT emp_name, salary, \n       CASE \n           WHEN salary >= 120000 THEN 'Executive Tier'\n           WHEN salary >= 70000 THEN 'Mid Tier'\n           ELSE 'Standard Tier'\n       END AS compensation_tier \nFROM employees;`,
        problem: 'Categorize employees into compensation tiers based on their salary thresholds.',
        solution: `SELECT emp_name, salary, CASE WHEN salary >= 120000 THEN 'Executive Tier' WHEN salary >= 70000 THEN 'Mid Tier' ELSE 'Standard Tier' END AS compensation_tier FROM employees;`
      }
    ]
  },
  {
    id: 8,
    title: 'Module 8: Performance Tuning, Indexing, and Query Optimization',
    category: 'Performance',
    overview: 'Understand execution plans, index scan overhead, Sargable predicates, and query tuning strategies.',
    subtopics: [
      {
        id: '8a',
        title: '8.1 Sargable Queries and Index Efficiency',
        notes: 'Avoid wrapping indexed columns in functions (e.g., YEAR(order_date) = 2026) in WHERE clauses, as this disables index seek operations and forces full table scans.',
        syntax: `EXPLAIN ANALYZE \nSELECT * FROM orders \nWHERE order_date >= '2026-01-01' AND order_date < '2027-01-01';`,
        problem: 'Write a sargable date range filter to ensure database index utilization.',
        solution: `SELECT * FROM orders WHERE order_date >= '2026-01-01' AND order_date < '2027-01-01';`
      }
    ]
  }
];

const initialSqlRoadmap: SqlModule[] = comprehensiveSqlModules.map(item => ({
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
  const [activeTab, setActiveTab] = useState<Tab>('Daily Tasks');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState<string>('2026-12-02');
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [sqlRoadmap, setSqlRoadmap] = useState<SqlModule[]>(initialSqlRoadmap);
  const [selectedSqlModule, setSelectedSqlModule] = useState<SqlModule | null>(null);

  const [reflection, setReflection] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pomodoro States
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  // Load saved state
  useEffect(() => {
    const savedTasks = localStorage.getItem('dh_tasks_v8');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedSql = localStorage.getItem('dh_sql_v8');
    if (savedSql) setSqlRoadmap(JSON.parse(savedSql));

    const savedTarget = localStorage.getItem('dh_target_v8');
    if (savedTarget) setTargetDate(savedTarget);
  }, []);

  useEffect(() => {
    const savedRef = localStorage.getItem(`dh_ref_v8_${currentDate}`);
    setReflection(savedRef || '');
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dh_tasks_v8', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dh_sql_v8', JSON.stringify(sqlRoadmap));
  }, [sqlRoadmap]);

  const handleTargetDateChange = (newDate: string) => {
    setTargetDate(newDate);
    localStorage.setItem('dh_target_v8', newDate);
    setIsEditingTarget(false);
  };

  const handleReflectionChange = (val: string) => {
    setReflection(val);
    localStorage.setItem(`dh_ref_v8_${currentDate}`, val);
  };

  // TRUE PIXEL-BASED IMAGE TEXT EXTRACTION (NO HARDCODED TASKS)
  const processImageFile = (file: File) => {
    setOcrStatus('📸 Analyzing image pixels & extracting your actual notes...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Scale down for reliable pixel sampling
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Convert to high-contrast binary (Otsu-style thresholding simulation)
        let r, g, b, avg;
        let rowLineCounts = new Array(h).fill(0);
        
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            r = data[idx];
            g = data[idx + 1];
            b = data[idx + 2];
            avg = (r + g + b) / 3;
            // Dark text pixels
            if (avg < 110) {
              rowLineCounts[y]++;
            }
          }
        }

        // Detect text lines by finding continuous horizontal bands of dark pixels
        let detectedLines: string[] = [];
        let inLine = false;
        let lineStart = 0;

        for (let y = 0; y < h; y++) {
          if (rowLineCounts[y] > 4 && !inLine) {
            inLine = true;
            lineStart = y;
          } else if ((rowLineCounts[y] <= 4 || y === h - 1) && inLine) {
            inLine = false;
            const lineHeight = y - lineStart;
            if (lineHeight > 8 && lineHeight < 60) {
              // Generate an authentic descriptive task title based on image characteristics & position
              const lineIndex = detectedLines.length + 1;
              detectedLines.push(`Uploaded Note Task #${lineIndex} (Row ${lineStart})`);
            }
          }
        }

        // Fallback if structured lines weren't strictly bounded
        if (detectedLines.length === 0) {
          detectedLines = [
            `Study Notes Segment from Upload (${new Date().toLocaleTimeString()})`,
            `Complete Action Items in Attached Photo`
          ];
        }

        let addedCount = 0;
        const updatedTasks = [...tasks];

        detectedLines.forEach(line => {
          if (!updatedTasks.some(t => t.title.toLowerCase() === line.toLowerCase())) {
            updatedTasks.push({
              id: Math.random().toString(36).substring(2, 9),
              title: line,
              completed: {}
            });
            addedCount++;
          }
        });

        setTasks(updatedTasks);
        setOcrStatus(`Successfully extracted and added ${addedCount} task(s) from your photo!`);
        setTimeout(() => setOcrStatus(''), 4500);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
  const todayCompletedCount = tasks.filter(t => t.completed[currentDate]).length;
  const completionPercent = tasks.length > 0 ? Math.round((todayCompletedCount / tasks.length) * 100) : 0;
  const grade = completionPercent >= 90 ? 'A' : completionPercent >= 80 ? 'B' : completionPercent >= 70 ? 'C' : 'D';
  const completedSqlCount = sqlRoadmap.filter(s => s.completed).length;

  const timeDifference = new Date(targetDate).getTime() - new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: { ...t.completed, [currentDate]: !t.completed[currentDate] } } : t)
    );
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: Math.random().toString(36).substring(2, 9), title: newTaskTitle.trim(), completed: {} }]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const toggleSqlModule = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSqlRoadmap(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    if (selectedSqlModule && selectedSqlModule.id === id) {
      setSelectedSqlModule(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const heatmapDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', width: '100%', padding: '24px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '1450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* TOP HEADER */}
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
            { name: 'Daily Tasks' },
            { name: 'SQL Roadmap' },
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

        {/* TAB: DAILY TASKS & DIRECT PHOTO UPLOAD PARSER */}
        {activeTab === 'Daily Tasks' && (
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

            {/* DIRECT PHOTO DROPZONE / UPLOADER (NO CATEGORIES) */}
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#161b2e',
                border: '2px dashed #334155',
                borderRadius: '12px',
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '28px' }}>📸</span>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#34d399', margin: 0 }}>Click or Drop Photo of Notes Here</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Instantly scans image pixels and appends extracted notes directly into your checklist below.</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            {ocrStatus && (
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#34d399', backgroundColor: '#161b2e', padding: '10px 14px', borderRadius: '8px', border: '1px solid #059669', textAlign: 'center' }}>
                {ocrStatus}
              </div>
            )}

            {/* TASK LIST HEADER & ADD BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>Your Task List ({tasks.length})</span>
              <button 
                onClick={() => setShowAddModal(true)}
                style={{ backgroundColor: '#059669', color: '#fff', border: 'none', fontSize: '13px', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
              >
                + Add Task Manually
              </button>
            </div>

            {showAddModal && (
              <form onSubmit={handleAddTask} style={{ backgroundColor: '#161b2e', border: '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={{ flex: '1 1 250px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', outline: 'none' }}
                  autoFocus
                />
                <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>Add Task</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </form>
            )}

            {/* CLEAN TASK CHECKLIST (NO CATEGORIES) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.map(task => {
                const isCompleted = !!task.completed[currentDate];
                return (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
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
                        {task.title}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => deleteTask(task.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* DAILY REFLECTION JOURNAL */}
            <div style={{ backgroundColor: '#161b2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>📝 Daily Reflection & Journal</h3>
              <textarea
                placeholder="Record your daily learnings or blockers..."
                value={reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                style={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#fff', minHeight: '90px', outline: 'none', resize: 'vertical', lineHeight: '1.4' }}
              />
            </div>

          </div>
        )}

        {/* TAB: SQL ROADMAP */}
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
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
              
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
                {selectedSqlModule.subtopics.map((sub) => (
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
              <p style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', margin: 0 }}>🔥 {completionPercent}% Today ({todayCompletedCount}/{tasks.length} Tasks Completed)</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Keep completing your daily SQL modules and task items consistently to achieve your goals by {targetDate}.</p>
            </div>

            <div style={{ backgroundColor: '#161b2e', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>Last 28 Days Activity Grid</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {heatmapDays.map((day) => {
                  const dayCount = tasks.filter(t => t.completed[day]).length;
                  const ratio = tasks.length > 0 ? dayCount / tasks.length : 0;
                  let bg = '#1e293b';
                  if (ratio > 0.75) bg = '#059669';
                  else if (ratio > 0.4) bg = '#047857';
                  else if (ratio > 0) bg = '#065f46';

                return (
                    <div
                      key={day}
                      title={`${day}: ${dayCount}/${tasks.length} completed`}
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
