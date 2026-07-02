async function cargarEstudiantes() {
    const grid = document.getElementById('grid-estudiantes');
    grid.innerHTML = '<p class="mensaje-vacio">Cargando estudiantes...</p>';

    try {
        const estudiantes = await apiRequest('/estudiantes');

        if (estudiantes.length === 0) {
            grid.innerHTML = '<p class="mensaje-vacio">No hay estudiantes registrados todavía.</p>';
            return;
        }

        grid.innerHTML = estudiantes.map((est) => renderTarjetaEstudiante(est)).join('');
    } catch (error) {
        grid.innerHTML = `<p class="mensaje-vacio">Error al cargar estudiantes: ${error.message}</p>`;
    }
}

function renderTarjetaEstudiante(estudiante) {
    return `
    <div class="tarjeta-estudiante" data-id="${estudiante.id}">
      <h4 class="nombre-clickeable" onclick="abrirDetalleEstudiante(${estudiante.id}, '${escapeHtml(estudiante.nombre)}', '${escapeHtml(estudiante.carnet)}')">${estudiante.nombre}</h4>
      <p class="carnet">Carnet: ${estudiante.carnet}</p>
      <div class="acciones">
        <button class="btn-editar" onclick="abrirModalEditarEstudiante(${estudiante.id}, '${escapeHtml(estudiante.nombre)}', '${escapeHtml(estudiante.carnet)}')">Editar</button>
        <button class="btn-eliminar" onclick="eliminarEstudianteUI(${estudiante.id}, '${escapeHtml(estudiante.nombre)}')">Eliminar</button>
      </div>
    </div>
  `;
}

// Evita romper el HTML si el nombre/carnet tiene comillas
function escapeHtml(texto) {
    return String(texto).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

//  Crear 
document.getElementById('btn-nuevo-estudiante').addEventListener('click', () => {
    abrirModal('Nuevo estudiante', formularioEstudianteHTML());

    document.getElementById('form-estudiante').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarEstudiante(null);
    });
});

//  Editar 
function abrirModalEditarEstudiante(id, nombre, carnet) {
    abrirModal('Editar estudiante', formularioEstudianteHTML(nombre, carnet));

    document.getElementById('form-estudiante').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarEstudiante(id);
    });
}

function formularioEstudianteHTML(nombre = '', carnet = '') {
    return `
    <form id="form-estudiante">
      <p id="form-error" class="mensaje-form-error oculto"></p>
      <div class="campo">
        <label for="input-nombre">Nombre</label>
        <input type="text" id="input-nombre" value="${nombre}" required>
      </div>
      <div class="campo">
        <label for="input-carnet">Carnet</label>
        <input type="text" id="input-carnet" value="${carnet}" required>
      </div>
      <button type="submit">Guardar</button>
    </form>
  `;
}

async function guardarEstudiante(id) {
    const nombre = document.getElementById('input-nombre').value.trim();
    const carnet = document.getElementById('input-carnet').value.trim();
    const formError = document.getElementById('form-error');
    formError.classList.add('oculto');

    try {
        if (id) {
            await apiRequest(`/estudiantes/${id}`, 'PUT', { nombre, carnet });
        } else {
            await apiRequest('/estudiantes', 'POST', { nombre, carnet });
        }
        cerrarModal();
        cargarEstudiantes();
    } catch (error) {
        formError.textContent = error.message;
        formError.classList.remove('oculto');
    }
}

//  Eliminar 
async function eliminarEstudianteUI(id, nombre) {
    const confirmado = confirm(`¿Seguro que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer y eliminará también sus inscripciones y calificaciones.`);
    if (!confirmado) return;

    try {
        await apiRequest(`/estudiantes/${id}`, 'DELETE');
        cargarEstudiantes();
    } catch (error) {
        alert(`Error al eliminar: ${error.message}`);
    }
}