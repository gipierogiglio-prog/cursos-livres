import { Router } from 'express';
import crypto from 'crypto';

const router = Router();
const id = () => crypto.randomUUID();

// GET /api/courses
router.get('/', (req, res) => {
  const courses = req.db.query('SELECT * FROM courses ORDER BY name');
  
  // Add enrollments count to each course
  for (const course of courses) {
    const count = req.db.get('SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?', [course.id]);
    course.enrollments_count = count.count;
  }

  res.json(courses);
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  const course = req.db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso não encontrado' });

  course.modules = req.db.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_num', [req.params.id]);
  const count = req.db.get('SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?', [req.params.id]);
  course.enrollments_count = count.count;

  res.json(course);
});

// POST /api/courses
router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nome do curso é obrigatório' });

  const course = { id: id(), name: name.trim(), description: description?.trim() || '' };
  req.db.run('INSERT INTO courses (id, name, description) VALUES (?, ?, ?)', [course.id, course.name, course.description]);
  res.status(201).json(course);
});

// PUT /api/courses/:id
router.put('/:id', (req, res) => {
  const course = req.db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso não encontrado' });

  const { name, description, is_active } = req.body;
  if (name !== undefined) course.name = name.trim();
  if (description !== undefined) course.description = description.trim();
  if (is_active !== undefined) course.is_active = is_active ? 1 : 0;
  course.updated_at = new Date().toISOString();

  req.db.run('UPDATE courses SET name = ?, description = ?, is_active = ?, updated_at = ? WHERE id = ?',
    [course.name, course.description, course.is_active, course.updated_at, course.id]);

  res.json(course);
});

// DELETE /api/courses/:id
router.delete('/:id', (req, res) => {
  const course = req.db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso não encontrado' });

  req.db.run('DELETE FROM courses WHERE id = ?', [req.params.id]);
  res.json({ message: 'Curso removido' });
});

export default router;
