import express from 'express';
import cors from 'cors';
import { initDb, query, get, run, exec } from './database.js';
import coursesRouter from './routes/courses.js';
import modulesRouter from './routes/modules.js';
import subjectsRouter from './routes/subjects.js';
import enrollmentsRouter from './routes/enrollments.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = { query, get, run, exec };
  next();
});

app.use('/api/courses', coursesRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/enrollments', enrollmentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', (req, res) => {
  const courses = get('SELECT COUNT(*) as count FROM courses');
  const activeCourses = get('SELECT COUNT(*) as count FROM courses WHERE is_active = 1');
  const modules = get('SELECT COUNT(*) as count FROM modules');
  const subjects = get('SELECT COUNT(*) as count FROM subjects');
  const enrollments = get('SELECT COUNT(*) as count FROM enrollments');
  const activeEnrollments = get('SELECT COUNT(*) as count FROM enrollments WHERE is_active = 1');

  res.json({
    courses: courses.count,
    active_courses: activeCourses.count,
    modules: modules.count,
    subjects: subjects.count,
    enrollments: enrollments.count,
    active_enrollments: activeEnrollments.count
  });
});

// Serve frontend (built by Dockerfile)
const publicPath = join(__dirname, '..', 'public');
if (existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(publicPath, 'index.html'));
    }
  });
}

await initDb();
console.log('📦 Banco de dados inicializado');

const c = get('SELECT COUNT(*) as c FROM courses');
const m = get('SELECT COUNT(*) as c FROM modules');
const s = get('SELECT COUNT(*) as c FROM subjects');
const e = get('SELECT COUNT(*) as c FROM enrollments');
console.log(`📊 DB: ${c.c} cursos, ${m.c} módulos, ${s.c} disciplinas, ${e.c} matrículas`);

app.listen(PORT, () => {
  console.log(`🎓 Cursos Livres rodando em http://localhost:${PORT}`);
});
