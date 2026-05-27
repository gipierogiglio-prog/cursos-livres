import { Router } from 'express';
import crypto from 'crypto';

const router = Router();
const id = () => crypto.randomUUID();

// GET /api/modules?course_id=X
router.get('/', (req, res) => {
  const { course_id } = req.query;
  let modules;
  if (course_id) {
    modules = req.db.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_num', [course_id]);
  } else {
    modules = req.db.query('SELECT * FROM modules ORDER BY course_id, order_num');
  }
  res.json(modules);
});

// GET /api/modules/:id (with subjects)
router.get('/:id', (req, res) => {
  const mod = req.db.get('SELECT * FROM modules WHERE id = ?', [req.params.id]);
  if (!mod) return res.status(404).json({ error: 'Módulo não encontrado' });

  mod.subjects = req.db.query('SELECT * FROM subjects WHERE module_id = ? ORDER BY order_num', [req.params.id]);
  res.json(mod);
});

// POST /api/modules
router.post('/', (req, res) => {
  const { course_id, name, description, order_num } = req.body;
  if (!course_id) return res.status(400).json({ error: 'course_id é obrigatório' });
  if (!name?.trim()) return res.status(400).json({ error: 'Nome do módulo é obrigatório' });

  const course = req.db.get('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Curso não encontrado' });

  const mod = { id: id(), course_id, name: name.trim(), description: description?.trim() || '', order_num: order_num ?? 0 };
  req.db.run('INSERT INTO modules (id, course_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
    [mod.id, mod.course_id, mod.name, mod.description, mod.order_num]);

  res.status(201).json(mod);
});

// PUT /api/modules/:id
router.put('/:id', (req, res) => {
  const mod = req.db.get('SELECT * FROM modules WHERE id = ?', [req.params.id]);
  if (!mod) return res.status(404).json({ error: 'Módulo não encontrado' });

  const { name, description, order_num } = req.body;
  if (name !== undefined) mod.name = name.trim();
  if (description !== undefined) mod.description = description.trim();
  if (order_num !== undefined) mod.order_num = order_num;
  mod.updated_at = new Date().toISOString();

  req.db.run('UPDATE modules SET name = ?, description = ?, order_num = ?, updated_at = ? WHERE id = ?',
    [mod.name, mod.description, mod.order_num, mod.updated_at, mod.id]);

  res.json(mod);
});

// DELETE /api/modules/:id
router.delete('/:id', (req, res) => {
  const mod = req.db.get('SELECT * FROM modules WHERE id = ?', [req.params.id]);
  if (!mod) return res.status(404).json({ error: 'Módulo não encontrado' });

  req.db.run('DELETE FROM modules WHERE id = ?', [req.params.id]);
  res.json({ message: 'Módulo removido' });
});

export default router;
