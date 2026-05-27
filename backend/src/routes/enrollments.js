import { Router } from 'express';
import crypto from 'crypto';

const router = Router();
const id = () => crypto.randomUUID();

// GET /api/enrollments?course_id=X
router.get('/', (req, res) => {
  const { course_id } = req.query;
  let enrollments;
  if (course_id) {
    enrollments = req.db.query(
      `SELECT e.*, c.name as course_name FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.course_id = ? ORDER BY e.enrolled_at DESC`, [course_id]);
  } else {
    enrollments = req.db.query(
      `SELECT e.*, c.name as course_name FROM enrollments e
       JOIN courses c ON c.id = e.course_id ORDER BY e.enrolled_at DESC`);
  }
  res.json(enrollments);
});

// GET /api/enrollments/:id
router.get('/:id', (req, res) => {
  const enrollment = req.db.get(
    `SELECT e.*, c.name as course_name FROM enrollments e
     JOIN courses c ON c.id = e.course_id WHERE e.id = ?`, [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: 'Matrícula não encontrada' });
  res.json(enrollment);
});

// POST /api/enrollments
router.post('/', (req, res) => {
  const { course_id, student_name, student_email, phone } = req.body;
  if (!course_id) return res.status(400).json({ error: 'course_id é obrigatório' });
  if (!student_name?.trim()) return res.status(400).json({ error: 'Nome do aluno é obrigatório' });

  const course = req.db.get('SELECT id, name FROM courses WHERE id = ?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Curso não encontrado' });

  const enrollment = { id: id(), course_id, student_name: student_name.trim(), student_email: student_email?.trim() || null, phone: phone?.trim() || null };
  req.db.run('INSERT INTO enrollments (id, course_id, student_name, student_email, phone) VALUES (?, ?, ?, ?, ?)',
    [enrollment.id, enrollment.course_id, enrollment.student_name, enrollment.student_email, enrollment.phone]);

  enrollment.course_name = course.name;
  res.status(201).json(enrollment);
});

// PUT /api/enrollments/:id
router.put('/:id', (req, res) => {
  const enrollment = req.db.get('SELECT * FROM enrollments WHERE id = ?', [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: 'Matrícula não encontrada' });

  const { student_name, student_email, phone, is_active } = req.body;
  if (student_name !== undefined) enrollment.student_name = student_name.trim();
  if (student_email !== undefined) enrollment.student_email = student_email.trim();
  if (phone !== undefined) enrollment.phone = phone.trim();
  if (is_active !== undefined) enrollment.is_active = is_active ? 1 : 0;

  req.db.run('UPDATE enrollments SET student_name = ?, student_email = ?, phone = ?, is_active = ? WHERE id = ?',
    [enrollment.student_name, enrollment.student_email, enrollment.phone, enrollment.is_active, enrollment.id]);

  res.json(enrollment);
});

// DELETE /api/enrollments/:id
router.delete('/:id', (req, res) => {
  const enrollment = req.db.get('SELECT * FROM enrollments WHERE id = ?', [req.params.id]);
  if (!enrollment) return res.status(404).json({ error: 'Matrícula não encontrada' });

  req.db.run('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
  res.json({ message: 'Matrícula removida' });
});

export default router;
