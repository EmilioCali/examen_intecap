const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Crear un nuevo profesor
const crearProfesor = async (req, res) => {
    const { nombre, usuario, password } = req.body;

    if (!nombre || !usuario || !password) {
        return res.status(400).json({ mensaje: 'Nombre, usuario y contraseña son requeridos' });
    }

    try {
        // Verificar que el usuario no exista ya
        const existente = await pool.query(
            'SELECT id FROM profesores WHERE usuario = $1',
            [usuario]
        );

        if (existente.rows.length > 0) {
            return res.status(409).json({ mensaje: 'Ese nombre de usuario ya está en uso' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO profesores (nombre, usuario, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, nombre, usuario`,
            [nombre, usuario, password_hash]
        );

        res.status(201).json({
            mensaje: 'Profesor creado exitosamente',
            profesor: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Listar todos los profesores
const listarProfesores = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre, usuario FROM profesores ORDER BY id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

module.exports = { crearProfesor, listarProfesores };