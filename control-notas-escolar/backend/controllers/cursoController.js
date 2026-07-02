const pool = require('../config/db');

// Crear un nuevo curso
const crearCurso = async (req, res) => {
    const { nombre, profesor_id } = req.body;

    if (!nombre || !profesor_id) {
        return res.status(400).json({ mensaje: 'Nombre y profesor_id son requeridos' });
    }

    try {
        // Validar que el profesor exista
        const profesor = await pool.query('SELECT id FROM profesores WHERE id = $1', [profesor_id]);
        if (profesor.rows.length === 0) {
            return res.status(404).json({ mensaje: 'El profesor no existe' });
        }

        // Validar regla de negocio: máximo 2 cursos por profesor
        const conteo = await pool.query(
            'SELECT COUNT(*) FROM cursos WHERE profesor_id = $1',
            [profesor_id]
        );
        const totalCursos = parseInt(conteo.rows[0].count, 10);

        if (totalCursos >= 2) {
            return res.status(409).json({ mensaje: 'Este profesor ya imparte el máximo de 2 cursos permitidos' });
        }

        const result = await pool.query(
            `INSERT INTO cursos (nombre, profesor_id)
        VALUES ($1, $2)
        RETURNING id, nombre, profesor_id`,
            [nombre, profesor_id]
        );

        res.status(201).json({ mensaje: 'Curso creado exitosamente', curso: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Listar todos los cursos (con nombre del profesor)
const listarCursos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.nombre, c.profesor_id, p.nombre AS profesor_nombre
        FROM cursos c
        JOIN profesores p ON c.profesor_id = p.id
        ORDER BY c.id`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Obtener un curso por id
const obtenerCurso = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Actualizar un curso (nombre y/o profesor asignado)
const actualizarCurso = async (req, res) => {
    const { id } = req.params;
    const { nombre, profesor_id } = req.body;

    if (!nombre || !profesor_id) {
        return res.status(400).json({ mensaje: 'Nombre y profesor_id son requeridos' });
    }

    try {
        const cursoActual = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);
        if (cursoActual.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }

        // Si se está reasignando a otro profesor, validar el límite de 2 (sin contar el curso actual)
        if (profesor_id !== cursoActual.rows[0].profesor_id) {
            const conteo = await pool.query(
                'SELECT COUNT(*) FROM cursos WHERE profesor_id = $1 AND id != $2',
                [profesor_id, id]
            );
            const totalCursos = parseInt(conteo.rows[0].count, 10);

            if (totalCursos >= 2) {
                return res.status(409).json({ mensaje: 'Ese profesor ya imparte el máximo de 2 cursos permitidos' });
            }
        }

        const result = await pool.query(
            `UPDATE cursos SET nombre = $1, profesor_id = $2
        WHERE id = $3
        RETURNING id, nombre, profesor_id`,
            [nombre, profesor_id, id]
        );

        res.json({ mensaje: 'Curso actualizado exitosamente', curso: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Eliminar un curso
const eliminarCurso = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cursos WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }
        res.json({ mensaje: 'Curso eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

module.exports = {
    crearCurso,
    listarCursos,
    obtenerCurso,
    actualizarCurso,
    eliminarCurso,
};