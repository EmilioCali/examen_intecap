const modalOverlay = document.getElementById('modal-overlay');
const modalTitulo = document.getElementById('modal-titulo');
const modalContenido = document.getElementById('modal-contenido');

function abrirModal(titulo, htmlContenido) {
    modalTitulo.textContent = titulo;
    modalContenido.innerHTML = htmlContenido;
    modalOverlay.classList.remove('oculto');
}

function cerrarModal() {
    modalOverlay.classList.add('oculto');
    modalContenido.innerHTML = '';
}

document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);

// Cerrar si se hace click fuera de la caja del modal
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cerrarModal();
});