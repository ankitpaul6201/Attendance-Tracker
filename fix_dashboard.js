const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove dead isMarking useState line
content = content.replace('    const [isMarking, setIsMarking] = useState(false);\r\n', '');

// 2. Replace stats useState with useMemo
content = content.replace(
    '    const [stats, setStats] = useState({ total: 0, attended: 0, percentage: 0 });',
    '    const stats = useMemo(() => {\r\n        const total = subjects.reduce((a: number, s: Subject) => a + s.total_classes, 0);\r\n        const attended = subjects.reduce((a: number, s: Subject) => a + s.attended_classes, 0);\r\n        return { total, attended, percentage: total > 0 ? Math.round((attended / total) * 100) : 0 };\r\n    }, [subjects]);'
);

// 3. Remove the 3 lines in fetchData that compute and setStats
content = content.replace(
    '                setSubjects(subjectsData);\r\n                const total = subjectsData.reduce((a: number, s: Subject) => a + s.total_classes, 0);\r\n                const attended = subjectsData.reduce((a: number, s: Subject) => a + s.attended_classes, 0);\r\n                setStats({ total, attended, percentage: total > 0 ? Math.round((attended / total) * 100) : 0 });\r\n',
    '                setSubjects(subjectsData);\r\n'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done - file updated successfully');
