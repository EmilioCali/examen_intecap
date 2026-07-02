async function cargarProfesores() {
    const grid = document.getElementById('grid-profesores');
    grid.innerHTML = '<p class="mensaje-vacio">Cargando profesores...</p>';

    try {
        const profesores = await apiRequest('/profesores');

        if (profesores.length === 0) {
            grid.innerHTML = '<p class="mensaje-vacio">No hay profesores registrados todavía.</p>';
            return;
        }

        grid.innerHTML = profesores.map((prof) => renderTarjetaProfesor(prof)).join('');

        // Refrescamos también el cache global que usa el formulario de Cursos,
        // así el <select> de "Nuevo curso" siempre tiene la lista actualizada
        profesoresCache = profesores;
    } catch (error) {
        grid.innerHTML = `<p class="mensaje-vacio">Error al cargar profesores: ${error.message}</p>`;
    }
}

function renderTarjetaProfesor(profesor) {
    return `
    <div class="tarjeta-estudiante tarjeta-profesor" data-id="${profesor.id}">
      <h4>${profesor.nombre}</h4>
      <p class="usuario-profesor">Usuario: ${profesor.usuario}</p>
    </div>
  `;
}

// ---------- Crear ----------
document.getElementById('btn-nuevo-profesor').addEventListener('click', () => {
    abrirModal('Nuevo profesor', formularioProfesorHTML());

    document.getElementById('form-profesor').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarProfesor();
    });
});

function formularioProfesorHTML() {
    return `
    <form id="form-profesor">
      <p id="form-error" class="mensaje-form-error oculto"></p>
      <div class="campo">
        <label for="input-nombre-profesor">Nombre completo</label>
        <input type="text" id="input-nombre-profesor" required>
      </div>
      <div class="campo">
        <label for="input-usuario-profesor">Usuario</label>
        <input type="text" id="input-usuario-profesor" required>
      </div>
      <div class="campo">
        <label for="input-password-profesor">Contraseña</label>
        <input type="password" id="input-password-profesor" required minlength="4">
      </div>
      <button type="submit">Guardar</button>
    </form>
  `;
}

async function guardarProfesor() {
    const nombre = document.getElementById('input-nombre-profesor').value.trim();
    const usuario = document.getElementById('input-usuario-profesor').value.trim();
    const password = document.getElementById('input-password-profesor').value;
    const formError = document.getElementById('form-error');
    formError.classList.add('oculto');

    try {
        await apiRequest('/profesores', 'POST', { nombre, usuario, password });
        cerrarModal();
        cargarProfesores();
    } catch (error) {
        // Aquí se ve el error de "usuario ya está en uso" si aplica
        formError.textContent = error.message;
        formError.classList.remove('oculto');
    }
}