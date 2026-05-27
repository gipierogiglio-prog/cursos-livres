import { useState, useEffect } from 'react';

const API = '/api';

// ---- Components ----

function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/dashboard`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="cards">
        <Card value={data.courses} label="Cursos" color="#2563eb" onClick={() => onNavigate('courses')} />
        <Card value={data.modules} label="Módulos" color="#7c3aed" onClick={() => onNavigate('modules')} />
        <Card value={data.subjects} label="Disciplinas" color="#059669" onClick={() => onNavigate('subjects')} />
        <Card value={data.enrollments} label="Matrículas" color="#d97706" onClick={() => onNavigate('enrollments')} />
      </div>
      <div className="quick-links">
        <h3>Acesso rápido</h3>
        <div className="links">
          <button onClick={() => onNavigate('courses')}>📚 Gerenciar Cursos</button>
          <button onClick={() => onNavigate('modules')}>📖 Gerenciar Módulos</button>
          <button onClick={() => onNavigate('enrollments')}>👥 Matricular Aluno</button>
        </div>
      </div>
    </div>
  );
}

function Card({ value, label, color, onClick }) {
  return (
    <div className="card" onClick={onClick} style={{ borderTop: `4px solid ${color}` }}>
      <div className="card-value">{value}</div>
      <div className="card-label">{label}</div>
    </div>
  );
}

// ---- Courses ----

function Courses({ onBack, onViewModules }) {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = () => fetch(`${API}/courses`).then(r => r.json()).then(setList);

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (edit) {
      await fetch(`${API}/courses/${edit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch(`${API}/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setForm({ name: '', description: '' });
    setShowForm(false);
    setEdit(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remover curso?')) return;
    await fetch(`${API}/courses/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <button className="back" onClick={onBack}>← Voltar</button>
      <div className="header-row">
        <h2>Cursos</h2>
        <button className="btn-primary" onClick={() => { setEdit(null); setForm({ name: '', description: '' }); setShowForm(true); }}>+ Novo</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{edit ? 'Editar' : 'Novo'} Curso</h3>
            <input placeholder="Nome do curso" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <textarea placeholder="Descrição (opcional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{edit ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="table">
        <div className="table-header">
          <span>Nome</span>
          <span>Módulos</span>
          <span>Matrículas</span>
          <span>Ações</span>
        </div>
        {list.map(c => (
          <div className="table-row" key={c.id}>
            <span className="row-name">{c.name}</span>
            <span><button className="link" onClick={() => onViewModules(c.id, c.name)}>Ver módulos</button></span>
            <span>{c.enrollments_count || '-'}</span>
            <span className="actions">
              <button className="btn-small" onClick={() => { setEdit(c); setForm({ name: c.name, description: c.description }); setShowForm(true); }}>✏️</button>
              <button className="btn-small btn-danger" onClick={() => remove(c.id)}>🗑️</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Modules ----

function Modules({ courseId, courseName, onBack }) {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [viewSubjects, setViewSubjects] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', order_num: 0 });

  const load = () => fetch(`${API}/modules?course_id=${courseId}`).then(r => r.json()).then(setList);

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, course_id: courseId };
    if (edit) {
      await fetch(`${API}/modules/${edit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch(`${API}/modules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setForm({ name: '', description: '', order_num: 0 });
    setShowForm(false);
    setEdit(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remover módulo?')) return;
    await fetch(`${API}/modules/${id}`, { method: 'DELETE' });
    load();
  };

  if (viewSubjects) {
    return <Subjects moduleId={viewSubjects.id} moduleName={viewSubjects.name} onBack={() => setViewSubjects(null)} />;
  }

  return (
    <div>
      <button className="back" onClick={onBack}>← Voltar para cursos</button>
      <div className="header-row">
        <h2>Módulos — {courseName}</h2>
        <button className="btn-primary" onClick={() => { setEdit(null); setForm({ name: '', description: '', order_num: list.length + 1 }); setShowForm(true); }}>+ Novo Módulo</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{edit ? 'Editar' : 'Novo'} Módulo</h3>
            <input placeholder="Nome (ex: 1º Semestre)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input type="number" placeholder="Ordem" value={form.order_num} onChange={e => setForm({ ...form, order_num: parseInt(e.target.value) || 0 })} />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{edit ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="table">
        <div className="table-header">
          <span>Ordem</span>
          <span>Nome</span>
          <span>Disciplinas</span>
          <span>Ações</span>
        </div>
        {list.map(m => (
          <div className="table-row" key={m.id}>
            <span className="row-order">{m.order_num}º</span>
            <span className="row-name">{m.name}</span>
            <span><button className="link" onClick={() => setViewSubjects(m)}>Matriz curricular</button></span>
            <span className="actions">
              <button className="btn-small" onClick={() => { setEdit(m); setForm({ name: m.name, description: m.description, order_num: m.order_num }); setShowForm(true); }}>✏️</button>
              <button className="btn-small btn-danger" onClick={() => remove(m.id)}>🗑️</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Subjects ----

function Subjects({ moduleId, moduleName, onBack }) {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', workload: 0 });

  const load = () => fetch(`${API}/subjects?module_id=${moduleId}`).then(r => r.json()).then(setList);

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, module_id: moduleId };
    if (edit) {
      await fetch(`${API}/subjects/${edit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch(`${API}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setForm({ name: '', workload: 0 });
    setShowForm(false);
    setEdit(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remover disciplina?')) return;
    await fetch(`${API}/subjects/${id}`, { method: 'DELETE' });
    load();
  };

  const totalWorkload = list.reduce((s, subj) => s + subj.workload, 0);

  return (
    <div>
      <button className="back" onClick={onBack}>← Voltar para módulos</button>
      <div className="header-row">
        <h2>Matriz Curricular — {moduleName}</h2>
        <button className="btn-primary" onClick={() => { setEdit(null); setForm({ name: '', workload: 0 }); setShowForm(true); }}>+ Nova Disciplina</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{edit ? 'Editar' : 'Nova'} Disciplina</h3>
            <input placeholder="Nome da disciplina" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input type="number" placeholder="Carga horária (horas)" value={form.workload} onChange={e => setForm({ ...form, workload: parseInt(e.target.value) || 0 })} />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>{edit ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="table">
        <div className="table-header">
          <span>Disciplina</span>
          <span>Carga Horária</span>
          <span>Ações</span>
        </div>
        {list.map(s => (
          <div className="table-row" key={s.id}>
            <span className="row-name">{s.name}</span>
            <span>{s.workload}h</span>
            <span className="actions">
              <button className="btn-small" onClick={() => { setEdit(s); setForm({ name: s.name, workload: s.workload }); setShowForm(true); }}>✏️</button>
              <button className="btn-small btn-danger" onClick={() => remove(s.id)}>🗑️</button>
            </span>
          </div>
        ))}
      </div>

      <div className="total-workload">
        Carga horária total: <strong>{totalWorkload}h</strong>
      </div>
    </div>
  );
}

// ---- Enrollments ----

function Enrollments({ onBack }) {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', student_name: '', student_email: '', phone: '' });

  const load = () => fetch(`${API}/enrollments`).then(r => r.json()).then(setList);

  useEffect(() => {
    load();
    fetch(`${API}/courses`).then(r => r.json()).then(setCourses);
  }, []);

  const save = async () => {
    await fetch(`${API}/enrollments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ course_id: '', student_name: '', student_email: '', phone: '' });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remover matrícula?')) return;
    await fetch(`${API}/enrollments/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <button className="back" onClick={onBack}>← Voltar</button>
      <div className="header-row">
        <h2>Matrículas</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nova Matrícula</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nova Matrícula</h3>
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Selecione um curso</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Nome do aluno" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} />
            <input placeholder="Email (opcional)" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} />
            <input placeholder="Telefone (opcional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Matricular</button>
            </div>
          </div>
        </div>
      )}

      <div className="table">
        <div className="table-header">
          <span>Aluno</span>
          <span>Curso</span>
          <span>Email</span>
          <span>Data</span>
          <span>Ações</span>
        </div>
        {list.map(e => (
          <div className="table-row" key={e.id}>
            <span className="row-name">{e.student_name}</span>
            <span>{e.course_name}</span>
            <span>{e.student_email || '-'}</span>
            <span>{new Date(e.enrolled_at).toLocaleDateString('pt-BR')}</span>
            <span className="actions">
              <button className="btn-small btn-danger" onClick={() => remove(e.id)}>🗑️</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- App ----

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [courseContext, setCourseContext] = useState(null);

  const navigate = (p, ctx) => {
    setPage(p);
    if (ctx) setCourseContext(ctx);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => navigate('dashboard')}>🎓 Cursos Livres</h1>
        <nav>
          <button className={page === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}>Dashboard</button>
          <button className={page === 'courses' ? 'active' : ''} onClick={() => navigate('courses')}>Cursos</button>
          <button className={page === 'enrollments' ? 'active' : ''} onClick={() => navigate('enrollments')}>Matrículas</button>
        </nav>
      </header>

      <main className="app-main">
        {page === 'dashboard' && <Dashboard onNavigate={(p, ctx) => navigate(p, ctx)} />}
        {page === 'courses' && <Courses onBack={() => navigate('dashboard')} onViewModules={(id, name) => navigate('modules', { courseId: id, courseName: name })} />}
        {page === 'modules' && courseContext && <Modules courseId={courseContext.courseId} courseName={courseContext.courseName} onBack={() => navigate('courses')} />}
        {page === 'enrollments' && <Enrollments onBack={() => navigate('dashboard')} />}
      </main>
    </div>
  );
}
