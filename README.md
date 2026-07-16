#  Sistema de Control de Notas Escolar

Sistema CRUD para la gestión académica de una institución educativa: profesores, cursos, estudiantes, inscripciones y calificaciones por semestre. Desarrollado con **Node.js/Express**, **PostgreSQL** y **JavaScript vanilla** (HTML/CSS/JS dinámico), siguiendo una arquitectura cliente-servidor con API RESTful.

---

##  Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express.js |
| Base de datos | PostgreSQL 16 (Docker) |
| Frontend | HTML5, CSS3, JavaScript (Vanilla) — SPA |
| Seguridad | bcryptjs (hasheo de contraseñas) |
| Infraestructura | Docker / Docker Compose |

---

##  Reglas de negocio

1. **Autenticación**: acceso exclusivo para profesores mediante usuario y contraseña. Credenciales incorrectas bloquean el acceso.
2. **Profesores**: un profesor logueado puede registrar nuevos profesores.
3. **Cursos**: un profesor puede impartir como **máximo 2 cursos**.
4. **Estudiantes**: un estudiante puede inscribirse en como **máximo 6 cursos**.
5. **Calificaciones**: cada curso registra una nota por **semestre (1 y 2)** por estudiante inscrito.

---

##  Estructura del proyecto

```
control-notas-escolar/
├── backend/
│   ├── config/          → Conexión a PostgreSQL (db.js)
│   ├── controllers/     → Lógica de negocio por entidad
│   ├── routes/          → Definición de endpoints (Express Router)
│   ├── .env              → Variables de entorno (no versionado)
│   └── server.js         → Punto de entrada del backend
├── frontend/
│   ├── css/styles.css    → Estilos de toda la aplicación
│   ├── js/                → Lógica de cada módulo (login, cursos, etc.)
│   └── index.html         → Estructura SPA
└── docker-compose.yml     → Definición del contenedor PostgreSQL
```

---

##  Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker](https://www.docker.com/) y Docker Compose
- Un editor de código (recomendado: VS Code con la extensión **Live Server**)

---

##  Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd control-notas-escolar
```

### 2. Levantar la base de datos con Docker

```bash
docker compose up -d
```

Verifica que el contenedor esté corriendo:

```bash
docker ps
```

### 3. Crear las tablas

Ejecuta el siguiente script SQL en la base de datos `notas_escolar` (con `psql`, pgAdmin o el Query Tool de tu preferencia):

```sql
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE
);

CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    carnet VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE inscripciones (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    UNIQUE(estudiante_id, curso_id)
);

CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    inscripcion_id INTEGER NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    semestre INTEGER NOT NULL CHECK (semestre IN (1, 2)),
    nota NUMERIC(5,2) CHECK (nota >= 0 AND nota <= 100),
    UNIQUE(inscripcion_id, semestre)
);
```

### 4. Configurar variables de entorno

Crea un archivo `.env` dentro de `backend/`:

```env
PORT=3000
DB_USER=admin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notas_escolar
JWT_SECRET=cambia_esto_por_un_secreto_largo
```

### 5. Instalar dependencias y levantar el backend

```bash
cd backend
npm install
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.

### 6. Insertar el profesor por defecto

Genera el hash de la contraseña `Pass1` y regístralo en la tabla `profesores`:

```bash
node -e "console.log(require('bcryptjs').hashSync('Pass1', 10))"
```

```sql
INSERT INTO profesores (nombre, usuario, password_hash)
VALUES ('Profesor Uno', 'Profe1', '<hash_generado>');
```

### 7. Ejecutar el frontend

Abre `frontend/index.html` con la extensión **Live Server** de VS Code, o sírvelo con cualquier servidor estático.

---

##  Credenciales por defecto

| Usuario | Contraseña |
|---|---|
| `Profe1` | `Pass1` |

---

## 📡 Endpoints principales de la API

Base URL: `http://localhost:3000/api`

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Autenticación de profesor |
| POST / GET | `/profesores` | Crear / listar profesores |
| POST / GET / PUT / DELETE | `/cursos` `/cursos/:id` | CRUD de cursos |
| POST / GET / PUT / DELETE | `/estudiantes` `/estudiantes/:id` | CRUD de estudiantes |
| POST / GET / DELETE | `/inscripciones` `/inscripciones/estudiante/:id` | Matrícula de estudiantes en cursos |
| POST / GET / PUT / DELETE | `/calificaciones` `/calificaciones/tarjeta/:estudiante_id` | Registro de notas por semestre |

📄 Documentación técnica completa (arquitectura, diccionario de datos, manual de usuario): ver `Documentacion_Control_Notas_Escolar.docx` en este repositorio.

---

##  Funcionalidades

- Login de profesores con contraseñas hasheadas (bcrypt)
- CRUD completo (Crear, Leer, Actualizar, Eliminar) de estudiantes y cursos
- Registro y actualización de profesores
- Inscripción y desinscripción de estudiantes en cursos, con validación de límites
- Registro y edición de calificaciones por semestre
- Interfaz tipo SPA con tarjetas visuales, modales y navegación por pestañas

---

##  Mejoras futuras

- Autenticación basada en JWT para proteger las rutas de la API
- Roles de usuario (administrador vs. profesor)
- Paginación y filtros de búsqueda en los listados
- Exportación de reportes de calificaciones (PDF/Excel)
- Despliegue en producción (hosting + base de datos en la nube)

---

##  Autor

Proyecto desarrollado como parte del curso de Desarrollador Junior — INTECAP.
