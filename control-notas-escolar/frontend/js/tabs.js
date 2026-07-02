const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        tabButtons.forEach((b) => b.classList.remove('activo'));
        btn.classList.add('activo');

        tabPanels.forEach((panel) => panel.classList.add('oculto'));
        document.getElementById(`tab-${tab}`).classList.remove('oculto');

        if (tab === 'cursos') cargarCursos();
        if (tab === 'profesores') cargarProfesores();
    });
});