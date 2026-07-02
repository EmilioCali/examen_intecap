let estudianteActivoId = null;
let cursosCache = []; // cache de todos los cursos, para el selector "inscribir"

async function abrirDetalleEstudiante(id, nombre, carnet) {
    estudianteActivoId = id;
    abrirModal(`${nombre} — Carnet: ${carnet}`, '<p class="mensaje-vacio">Cargando cursos...</p>');
    document.querySelector('.modal-box').classList.add('modal-ancho');

    await renderDetalleEstudiante();
}

async function renderDetalleEstudiante() {
    try {
        const tarjeta = await apiRequest(`/calificaciones/tarjeta/${estudianteActivoId}`);
        await asegurarCursosCargados();

        modalContenido.innerHTML = construirHtmlDetalle(tarjeta.cursos);
    } catch (error) {
        modalContenido.innerHTML = `<p class="mensaje-vacio">Error al cargar el detalle: ${error.message}</p>`;
    }
}

async function asegurarCursosCargados() {
    cursosCache = await apiRequest('/cursos'); // siempre fresco, ya que puede haber cambiado el listado
}

function construirHtmlDetalle(cursosInscritos) {
    const bloqueCursos = cursosInscritos.length === 0
        ? '<p class="mensaje-vacio">Este estudiante no está inscrito en ningún curso.</p>'
        : cursosInscritos.map((c) => renderCursoInscrito(c)).join('');

    const idsInscritos = cursosInscritos.map((c) => c.curso_id);
    const cursosDisponibles = cursosCache.filter((c) => !idsInscritos.includes(c.id));
    const alcanzoLimite = cursosInscritos.length >= 6;

    const bloqueInscribir = alcanzoLimite
        ? '<p class="limite-alcanzado">⚠️ Este estudiante ya alcanzó el máximo de 6 cursos.</p>'
        : construirBloqueInscribir(cursosDisponibles);

    return `
    <div id="lista-cursos-inscritos">${bloqueCursos}</div>
    <div class="bloque-inscribir">
      <h5 style="margin-bottom: 0.6rem;">Inscribir en nuevo curso</h5>
      ${bloqueInscribir}
    </div>
  `;
}

function renderCursoInscrito(curso) {
    // curso.semestre / curso.nota vienen NULL si aún no hay calificación para ese semestre específico;
    // como el LEFT JOIN puede traer 1 o 2 filas por curso (una por semestre existente), agrupamos por curso.
    const notaS1 = curso.notas?.s1 ?? '';
    const notaS2 = curso.notas?.s2 ?? '';

    return `
    <div class="curso-inscrito" data-inscripcion="${curso.inscripcion_id}">
      <div class="curso-inscrito-header">
        <h5>${curso.curso_nombre}</h5>
        <button class="btn-eliminar-inscripcion" onclick="eliminarInscripcionUI(${curso.inscripcion_id}, '${curso.curso_nombre.replace(/'/g, "\\'")}')">Desinscribir</button>
      </div>
      <div class="notas-fila">
        ${renderCampoNota(curso, 1, notaS1)}
        ${renderCampoNota(curso, 2, notaS2)}
      </div>
    </div>
  `;
}

function renderCampoNota(curso, semestre, valor) {
    const id = `nota-${curso.inscripcion_id}-${semestre}`;
    return `
    <div class="nota-campo">
      <label for="${id}">S${semestre}</label>
      <input type="number" id="${id}" min="0" max="100" step="0.01" value="${valor}">
      <button onclick="guardarNota(${curso.inscripcion_id}, ${semestre})">💾</button>
    </div>
  `;
}

function construirBloqueInscribir(cursosDisponibles) {
    if (cursosDisponibles.length === 0) {
        return '<p class="mensaje-vacio">No hay más cursos disponibles para inscribir.</p>';
    }

    const opciones = cursosDisponibles
        .map((c) => `<option value="${c.id}">${c.nombre} (${c.profesor_nombre})</option>`)
        .join('');

    return `
    <div class="bloque-inscribir-fila">
      <select id="select-curso-inscribir">${opciones}</select>
      <button onclick="inscribirEnCurso()">Inscribir</button>
    </div>
  `;
}

// ---------- Acciones ----------

async function inscribirEnCurso() {
    const curso_id = parseInt(document.getElementById('select-curso-inscribir').value, 10);

    try {
        await apiRequest('/inscripciones', 'POST', { estudiante_id: estudianteActivoId, curso_id });
        await renderDetalleEstudiante();
    } catch (error) {
        alert(`No se pudo inscribir: ${error.message}`);
    }
}

async function eliminarInscripcionUI(inscripcionId, nombreCurso) {
    const confirmado = confirm(`¿Desinscribir al estudiante del curso "${nombreCurso}"? Se eliminarán también sus calificaciones en este curso.`);
    if (!confirmado) return;

    try {
        await apiRequest(`/inscripciones/${inscripcionId}`, 'DELETE');
        await renderDetalleEstudiante();
    } catch (error) {
        alert(`Error al desinscribir: ${error.message}`);
    }
}

async function guardarNota(inscripcionId, semestre) {
    const input = document.getElementById(`nota-${inscripcionId}-${semestre}`);
    const nota = parseFloat(input.value);

    if (isNaN(nota) || nota < 0 || nota > 100) {
        alert('La nota debe ser un número entre 0 y 100');
        return;
    }

    try {
        // Intentamos crear; si ya existe una nota para ese semestre, el backend responde 409
        // y en ese caso la actualizamos en su lugar.
        await apiRequest('/calificaciones', 'POST', { inscripcion_id: inscripcionId, semestre, nota });
    } catch (error) {
        if (error.message.includes('Ya existe una nota')) {
            const calificaciones = await apiRequest('/calificaciones');
            const existente = calificaciones.find(
                (c) => c.inscripcion_id === inscripcionId && c.semestre === semestre
            );
            if (existente) {
                await apiRequest(`/calificaciones/${existente.id}`, 'PUT', { nota });
            }
        } else {
            alert(`Error al guardar la nota: ${error.message}`);
            return;
        }
    }

    await renderDetalleEstudiante();
}