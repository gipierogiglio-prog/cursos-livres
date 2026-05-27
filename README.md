# 🎓 Cursos Livres — MVP

Sistema simples para gestão de cursos livres com:
- Cadastro de cursos
- Módulos por curso (1º semestre, 2º semestre...)
- Matriz curricular por módulo
- Matrícula de alunos por curso (sem vínculo com módulo)

## Stack

- **Backend:** Node.js + Express + SQLite (sql.js)
- **Frontend:** React 18 + Vite
- **Banco:** SQLite (arquivo local)

## Estrutura

```
cursos-livres-mvp/
├── backend/
│   └── src/
│       ├── index.js          # Servidor Express
│       ├── database.js       # SQLite com sql.js
│       ├── seed.js           # Dados de exemplo
│       └── routes/
│           ├── courses.js    # CRUD cursos
│           ├── modules.js    # CRUD módulos
│           ├── subjects.js   # CRUD disciplinas
│           └── enrollments.js # CRUD matrículas
├── frontend/
│   └── src/
│       ├── App.jsx           # SPA completa
│       └── index.css         # Estilos
└── Dockerfile
```

## API Endpoints

### Cursos
- `GET /api/courses` — Listar todos
- `GET /api/courses/:id` — Detalhe (com módulos e contagem)
- `POST /api/courses` — Criar `{name, description}`
- `PUT /api/courses/:id` — Atualizar
- `DELETE /api/courses/:id` — Remover

### Módulos
- `GET /api/modules?course_id=X` — Listar (filtrar por curso)
- `GET /api/modules/:id` — Detalhe (com disciplinas)
- `POST /api/modules` — Criar `{course_id, name, description, order_num}`
- `PUT /api/modules/:id` — Atualizar
- `DELETE /api/modules/:id` — Remover

### Disciplinas
- `GET /api/subjects?module_id=X` — Listar (filtrar por módulo)
- `POST /api/subjects` — Criar `{module_id, name, workload, order_num}`
- `PUT /api/subjects/:id` — Atualizar
- `DELETE /api/subjects/:id` — Remover

### Matrículas
- `GET /api/enrollments?course_id=X` — Listar
- `POST /api/enrollments` — Criar `{course_id, student_name, student_email, phone}`
- `PUT /api/enrollments/:id` — Atualizar
- `DELETE /api/enrollments/:id` — Remover

### Dashboard
- `GET /api/dashboard` — Resumo (contadores)

## Rodar local

```bash
# Backend
cd backend
npm install
node src/seed.js    # Popular dados de exemplo
node src/index.js   # API em :3002

# Frontend (outro terminal)
cd frontend
npm install
npx vite dev        # Frontend em :5173 (proxy API)
```

## Deploy (Docker)

```bash
docker build -t cursos-livres .
docker run -p 3002:3002 -p 5173:5173 -v $(pwd)/data:/app/backend/data cursos-livres
```

## Deploy no Dokploy

1. Crie um app no Dokploy
2. Use o Dockerfile na raiz do repo
3. Porta: 3002 (API) + 5173 (frontend)
4. Volume: `/app/backend/data` para persistir SQLite
