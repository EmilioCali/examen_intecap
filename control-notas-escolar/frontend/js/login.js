const formLogin = document.getElementById('form-login');
const loginError = document.getElementById('login-error');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;

    loginError.classList.add('oculto');

    try {
        const data = await apiRequest('/auth/login', 'POST', { usuario, password });

        // Guardamos al profesor logueado en sessionStorage para usarlo en el resto de la app
        sessionStorage.setItem('profesor', JSON.stringify(data.profesor));

        mostrarDashboard();
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('oculto');
    }
});

function mostrarDashboard() {
    document.getElementById('vista-login').classList.add('oculto');
    document.getElementById('vista-dashboard').classList.remove('oculto');

    const profesor = JSON.parse(sessionStorage.getItem('profesor'));
    document.getElementById('nombre-profesor-activo').textContent = `👤 ${profesor.nombre}`;

    cargarEstudiantes(); // definida en estudiantes.js
}

document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('profesor');
    location.reload();
});

// Si ya hay sesión activa (ej. recargó la página), saltar directo al dashboard
window.addEventListener('DOMContentLoaded', () => {
    const profesorGuardado = sessionStorage.getItem('profesor');
    if (profesorGuardado) {
        mostrarDashboard();
    }
});