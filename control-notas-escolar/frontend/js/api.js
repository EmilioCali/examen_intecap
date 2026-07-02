const API_BASE_URL = 'http://localhost:3000/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const opciones = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
        opciones.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, opciones);
    const data = await response.json();

    if (!response.ok) {
        // Lanzamos el mensaje que ya viene formateado desde el backend
        throw new Error(data.mensaje || 'Ocurrió un error inesperado');
    }

    return data;
}