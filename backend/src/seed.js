import crypto from 'crypto';
import { initDb, run, get } from './database.js';

const id = () => crypto.randomUUID();

await initDb();

// Clear existing data
run('DELETE FROM subjects');
run('DELETE FROM modules');
run('DELETE FROM enrollments');
run('DELETE FROM courses');

// Seed courses
const course1 = id();
const course2 = id();

run('INSERT INTO courses (id, name, description) VALUES (?, ?, ?)', [
  course1, 'Desenvolvimento Web Full Stack',
  'Aprenda HTML, CSS, JavaScript, React, Node.js e bancos de dados. Do zero ao deploy.'
]);
run('INSERT INTO courses (id, name, description) VALUES (?, ?, ?)', [
  course2, 'Design UX/UI',
  'Fundamentos de design de interface, prototipação, ferramentas e portfólio.'
]);

// Modules for course 1
const m1 = id(), m2 = id(), m3 = id();
run('INSERT INTO modules (id, course_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
  [m1, course1, '1º Semestre', 'Fundamentos da web: HTML5, CSS3, JavaScript básico', 1]);
run('INSERT INTO modules (id, course_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
  [m2, course1, '2º Semestre', 'JavaScript avançado, TypeScript, React', 2]);
run('INSERT INTO modules (id, course_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
  [m3, course1, '3º Semestre', 'Node.js, bancos de dados, deploy', 3]);

// Modules for course 2
const m4 = id(), m5 = id();
run('INSERT INTO modules (id, course_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
  [m4, course2, '1º Semestre', 'Fundamentos de design, cores, tipografia', 1]);
run('INSERT INTO modules (id, course_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
  [m5, course2, '2º Semestre', 'Figma, prototipação, portfólio', 2]);

// Subjects for course 1
const subjects1 = [
  [m1, 'HTML5 Semântico', 40, 1],
  [m1, 'CSS3 e Flexbox/Grid', 60, 2],
  [m1, 'JavaScript - Lógica de Programação', 80, 3],
  [m1, 'Git e Versionamento', 20, 4],
  [m2, 'JavaScript Assíncrono', 40, 1],
  [m2, 'TypeScript', 40, 2],
  [m2, 'React com Vite', 80, 3],
  [m2, 'Testes Automatizados', 30, 4],
  [m3, 'Node.js e Express', 60, 1],
  [m3, 'SQL e PostgreSQL', 40, 2],
  [m3, 'Deploy e DevOps', 30, 3],
  [m3, 'Projeto Final', 60, 4],
];

for (const [moduleId, name, workload, order] of subjects1) {
  run('INSERT INTO subjects (id, module_id, name, workload, order_num) VALUES (?, ?, ?, ?, ?)',
    [id(), moduleId, name, workload, order]);
}

// Subjects for course 2
const subjects2 = [
  [m4, 'Princípios de Design', 30, 1],
  [m4, 'Teoria das Cores', 20, 2],
  [m4, 'Tipografia e Grid', 30, 3],
  [m5, 'Figma Avançado', 40, 1],
  [m5, 'Prototipação e Testes', 30, 2],
  [m5, 'Portfólio e Mercado', 20, 3],
];

for (const [moduleId, name, workload, order] of subjects2) {
  run('INSERT INTO subjects (id, module_id, name, workload, order_num) VALUES (?, ?, ?, ?, ?)',
    [id(), moduleId, name, workload, order]);
}

// Enrollments
run('INSERT INTO enrollments (id, course_id, student_name, student_email, phone) VALUES (?, ?, ?, ?, ?)',
  [id(), course1, 'João Silva', 'joao@email.com', '(11) 99999-0001']);
run('INSERT INTO enrollments (id, course_id, student_name, student_email, phone) VALUES (?, ?, ?, ?, ?)',
  [id(), course1, 'Maria Souza', 'maria@email.com', '(11) 99999-0002']);
run('INSERT INTO enrollments (id, course_id, student_name, student_email, phone) VALUES (?, ?, ?, ?, ?)',
  [id(), course2, 'Ana Costa', 'ana@email.com', '(11) 99999-0003']);

const c = get('SELECT COUNT(*) as c FROM courses');
const mod = get('SELECT COUNT(*) as c FROM modules');
const s = get('SELECT COUNT(*) as c FROM subjects');
const e = get('SELECT COUNT(*) as c FROM enrollments');

console.log('🌱 Seed concluído!');
console.log(`  📚 ${c.c} cursos`);
console.log(`  📖 ${mod.c} módulos`);
console.log(`  📝 ${s.c} disciplinas`);
console.log(`  👥 ${e.c} matrículas`);
