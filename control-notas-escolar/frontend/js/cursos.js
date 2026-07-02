let profesoresCache = []; // para llenar el <select> sin pedirlo cada vez

async function cargarCursos() {
    const grid = document.getElementById('grid-cursos');
    grid.innerHTML = '<p class="mensaje-vacio">Cargando cursos...</p>';

    try {
        const cursos = await apiRequest('/cursos');

        if (cursos.length === 0) {
            grid.innerHTML = '<p class="mensaje-vacio">No hay cursos registrados todavía.</p>';
            return;
        }

        grid.innerHTML = cursos.map((curso) => renderTarjetaCurso(curso)).join('');
    } catch (error) {
        grid.innerHTML = `<p class="mensaje-vacio">Error al cargar cursos: ${error.message}</p>`;
    }
}

function renderTarjetaCurso(curso) {
    return `
    <div class="tarjeta-estudiante tarjeta-curso" data-id="${curso.id}">
      <h4>${curso.nombre}</h4>
      <p class="profesor-asignado"> ${curso.profesor_nombre}</p>
      <div class="acciones">
        <button class="btn-editar" onclick="abrirModalEditarCurso(${curso.id}, '${escapeHtml(curso.nombre)}', ${curso.profesor_id})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarCursoUI(${curso.id}, '${escapeHtml(curso.nombre)}')">Eliminar</button>
      </div>
    </div>
  `;
}

// ---------- Crear ----------
document.getElementById('btn-nuevo-curso').addEventListener('click', async () => {
    await asegurarProfesoresCargados();
    abrirModal('Nuevo curso', formularioCursoHTML());

    document.getElementById('form-curso').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarCurso(null);
    });
});

// ---------- Editar ----------
async function abrirModalEditarCurso(id, nombre, profesorId) {
    await asegurarProfesoresCargados();
    abrirModal('Editar curso', formularioCursoHTML(nombre, profesorId));

    document.getElementById('form-curso').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarCurso(id);
    });
}

async function asegurarProfesoresCargados() {
    if (profesoresCache.length === 0) {
        profesoresCache = await apiRequest('/profesores');
    }
}

function formularioCursoHTML(nombre = '', profesorIdSeleccionado = null) {
    const opciones = profesoresCache
        .map((p) => `<option value="${p.id}" ${p.id === profesorIdSeleccionado ? 'selected' : ''}>${p.nombre}</option>`)
        .join('');

    return `
    <form id="form-curso">
      <p id="form-error" class="mensaje-form-error oculto"></p>
      <div class="campo">
        <label for="input-nombre-curso">Nombre del curso</label>
        <input type="text" id="input-nombre-curso" value="${nombre}" required>
      </div>
      <div class="campo">
        <label for="input-profesor">Profesor asignado</label>
        <select id="input-profesor" required>
          <option value="" disabled ${!profesorIdSeleccionado ? 'selected' : ''}>Selecciona un profesor</option>
          ${opciones}
        </select>
      </div>
      <button type="submit">Guardar</button>
    </form>
  `;
}

async function guardarCurso(id) {
    const nombre = document.getElementById('input-nombre-curso').value.trim();
    const profesor_id = parseInt(document.getElementById('input-profesor').value, 10);
    const formError = document.getElementById('form-error');
    formError.classList.add('oculto');

    try {
        if (id) {
            await apiRequest(`/cursos/${id}`, 'PUT', { nombre, profesor_id });
        } else {
            await apiRequest('/cursos', 'POST', { nombre, profesor_id });
        }
        cerrarModal();
        cargarCursos();
    } catch (error) {
        // Aquí es donde el usuario ve el mensaje "ya imparte el máximo de 2 cursos"
        formError.textContent = error.message;
        formError.classList.remove('oculto');
    }
}

// ---------- Eliminar ----------
async function eliminarCursoUI(id, nombre) {
    const confirmado = confirm(`¿Seguro que deseas eliminar el curso "${nombre}"? Esto eliminará también las inscripciones y calificaciones asociadas.`);
    if (!confirmado) return;

    try {
        await apiRequest(`/cursos/${id}`, 'DELETE');
        cargarCursos();
    } catch (error) {
        alert(`Error al eliminar: ${error.message}`);
    }
}