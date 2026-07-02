const pool = require('../config/db');

// Crear un nuevo estudiante
const crearEstudiante = async (req, res) => {
    const { nombre, carnet } = req.body;

    if (!nombre || !carnet) {
        return res.status(400).json({ mensaje: 'Nombre y carnet son requeridos' });
    }

    try {
        const existente = await pool.query('SELECT id FROM estudiantes WHERE carnet = $1', [carnet]);
        if (existente.rows.length > 0) {
            return res.status(409).json({ mensaje: 'Ese carnet ya está registrado' });
        }

        const result = await pool.query(
            `INSERT INTO estudiantes (nombre, carnet)
        VALUES ($1, $2)
        RETURNING id, nombre, carnet`,
            [nombre, carnet]
        );

        res.status(201).json({ mensaje: 'Estudiante creado exitosamente', estudiante: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Listar todos los estudiantes
const listarEstudiantes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estudiantes ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Obtener un estudiante por id
const obtenerEstudiante = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM estudiantes WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Actualizar un estudiante
const actualizarEstudiante = async (req, res) => {
    const { id } = req.params;
    const { nombre, carnet } = req.body;

    if (!nombre || !carnet) {
        return res.status(400).json({ mensaje: 'Nombre y carnet son requeridos' });
    }

    try {
        const actual = await pool.query('SELECT id FROM estudiantes WHERE id = $1', [id]);
        if (actual.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        // Validar que el carnet no choque con OTRO estudiante
        const carnetDuplicado = await pool.query(
            'SELECT id FROM estudiantes WHERE carnet = $1 AND id != $2',
            [carnet, id]
        );
        if (carnetDuplicado.rows.length > 0) {
            return res.status(409).json({ mensaje: 'Ese carnet ya pertenece a otro estudiante' });
        }

        const result = await pool.query(
            `UPDATE estudiantes SET nombre = $1, carnet = $2
        WHERE id = $3
        RETURNING id, nombre, carnet`,
            [nombre, carnet, id]
        );

        res.json({ mensaje: 'Estudiante actualizado exitosamente', estudiante: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Eliminar un estudiante
const eliminarEstudiante = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM estudiantes WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }
        res.json({ mensaje: 'Estudiante eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

module.exports = {
    crearEstudiante,
    listarEstudiantes,
    obtenerEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
};