import { Router } from 'express';
import crypto from 'crypto';

const router = Router();
const id = () => crypto.randomUUID();

// GET /api/subjects?module_id=X
router.get('/', (req, res) => {
  const { module_id } = req.query;
  let subjects;
  if (module_id) {
    subjects = req.db.query('SELECT * FROM subjects WHERE module_id = ? ORDER BY order_num', [module_id]);
  } else {
    subjects = req.db.query('SELECT * FROM subjects ORDER BY module_id, order_num');
  }
  res.json(subjects);
});

// GET /api/subjects/:id
router.get('/:id', (req, res) => {
  const subj = req.db.get('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
  if (!subj) return res.status(404).json({ error: 'Disciplina não encontrada' });
  res.json(subj);
});

// POST /api/subjects
router.post('/', (req, res) => {
  const { module_id, name, workload, order_num } = req.body;
  if (!module_id) return res.status(400).json({ error: 'module_id é obrigatório' });
  if (!name?.trim()) return res.status(400).json({ error: 'Nome da disciplina é obrigatório' });

  const mod = req.db.get('SELECT id FROM modules WHERE id = ?', [module_id]);
  if (!mod) return res.status(404).json({ error: 'Módulo não encontrado' });

  const subj = { id: id(), module_id, name: name.trim(), workload: workload ?? 0, order_num: order_num ?? 0 };
  req.db.run('INSERT INTO subjects (id, module_id, name, workload, order_num) VALUES (?, ?, ?, ?, ?)',
    [subj.id, subj.module_id, subj.name, subj.workload, subj.order_num]);

  res.status(201).json(subj);
});

// PUT /api/subjects/:id
router.put('/:id', (req, res) => {
  const subj = req.db.get('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
  if (!subj) return res.status(404).json({ error: 'Disciplina não encontrada' });

  const { name, workload, order_num } = req.body;
  if (name !== undefined) subj.name = name.trim();
  if (workload !== undefined) subj.workload = workload;
  if (order_num !== undefined) subj.order_num = order_num;
  subj.updated_at = new Date().toISOString();

  req.db.run('UPDATE subjects SET name = ?, workload = ?, order_num = ?, updated_at = ? WHERE id = ?',
    [subj.name, subj.workload, subj.order_num, subj.updated_at, subj.id]);

  res.json(subj);
});

// DELETE /api/subjects/:id
router.delete('/:id', (req, res) => {
  const subj = req.db.get('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
  if (!subj) return res.status(404).json({ error: 'Disciplina não encontrada' });

  req.db.run('DELETE FROM subjects WHERE id = ?', [req.params.id]);
  res.json({ message: 'Disciplina removida' });
});

export default router;
