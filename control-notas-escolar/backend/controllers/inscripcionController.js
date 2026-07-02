const pool = require('../config/db');

// Crear una inscripción (matricular estudiante en curso)
const crearInscripcion = async (req, res) => {
    const { estudiante_id, curso_id } = req.body;

    if (!estudiante_id || !curso_id) {
        return res.status(400).json({ mensaje: 'estudiante_id y curso_id son requeridos' });
    }

    try {
        // Validar que el estudiante exista
        const estudiante = await pool.query('SELECT id FROM estudiantes WHERE id = $1', [estudiante_id]);
        if (estudiante.rows.length === 0) {
            return res.status(404).json({ mensaje: 'El estudiante no existe' });
        }

        // Validar que el curso exista
        const curso = await pool.query('SELECT id FROM cursos WHERE id = $1', [curso_id]);
        if (curso.rows.length === 0) {
            return res.status(404).json({ mensaje: 'El curso no existe' });
        }

        // Validar que no esté ya inscrito en ese curso
        const yaInscrito = await pool.query(
            'SELECT id FROM inscripciones WHERE estudiante_id = $1 AND curso_id = $2',
            [estudiante_id, curso_id]
        );
        if (yaInscrito.rows.length > 0) {
            return res.status(409).json({ mensaje: 'El estudiante ya está inscrito en ese curso' });
        }

        // Validar regla de negocio: máximo 6 cursos por estudiante
        const conteo = await pool.query(
            'SELECT COUNT(*) FROM inscripciones WHERE estudiante_id = $1',
            [estudiante_id]
        );
        const totalInscripciones = parseInt(conteo.rows[0].count, 10);

        if (totalInscripciones >= 6) {
            return res.status(409).json({ mensaje: 'El estudiante ya alcanzó el máximo de 6 cursos permitidos' });
        }

        const result = await pool.query(
            `INSERT INTO inscripciones (estudiante_id, curso_id)
       VALUES ($1, $2)
       RETURNING id, estudiante_id, curso_id`,
            [estudiante_id, curso_id]
        );

        res.status(201).json({ mensaje: 'Inscripción creada exitosamente', inscripcion: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Listar todas las inscripciones (con nombres legibles)
const listarInscripciones = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.id, i.estudiante_id, e.nombre AS estudiante_nombre,
              i.curso_id, c.nombre AS curso_nombre
       FROM inscripciones i
       JOIN estudiantes e ON i.estudiante_id = e.id
       JOIN cursos c ON i.curso_id = c.id
       ORDER BY i.id`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Listar los cursos de un estudiante específico (útil para el frontend)
const listarPorEstudiante = async (req, res) => {
    const { estudiante_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT i.id, i.curso_id, c.nombre AS curso_nombre
       FROM inscripciones i
       JOIN cursos c ON i.curso_id = c.id
       WHERE i.estudiante_id = $1
       ORDER BY i.id`,
            [estudiante_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Eliminar una inscripción (desmatricular)
const eliminarInscripcion = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM inscripciones WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }
        res.json({ mensaje: 'Inscripción eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

module.exports = {
    crearInscripcion,
    listarInscripciones,
    listarPorEstudiante,
    eliminarInscripcion,
};