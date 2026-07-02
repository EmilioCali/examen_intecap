const pool = require('../config/db');

// Registrar una calificación
const crearCalificacion = async (req, res) => {
    const { inscripcion_id, semestre, nota } = req.body;

    if (!inscripcion_id || !semestre || nota === undefined) {
        return res.status(400).json({ mensaje: 'inscripcion_id, semestre y nota son requeridos' });
    }

    if (![1, 2].includes(Number(semestre))) {
        return res.status(400).json({ mensaje: 'El semestre debe ser 1 o 2' });
    }

    if (nota < 0 || nota > 100) {
        return res.status(400).json({ mensaje: 'La nota debe estar entre 0 y 100' });
    }

    try {
        // Validar que la inscripción exista
        const inscripcion = await pool.query('SELECT id FROM inscripciones WHERE id = $1', [inscripcion_id]);
        if (inscripcion.rows.length === 0) {
            return res.status(404).json({ mensaje: 'La inscripción no existe' });
        }

        // Validar que no exista ya una nota para ese semestre en esa inscripción
        const existente = await pool.query(
            'SELECT id FROM calificaciones WHERE inscripcion_id = $1 AND semestre = $2',
            [inscripcion_id, semestre]
        );
        if (existente.rows.length > 0) {
            return res.status(409).json({
                mensaje: 'Ya existe una nota para ese semestre en esta inscripción. Usa actualizar en su lugar.',
            });
        }

        const result = await pool.query(
            `INSERT INTO calificaciones (inscripcion_id, semestre, nota)
       VALUES ($1, $2, $3)
       RETURNING id, inscripcion_id, semestre, nota`,
            [inscripcion_id, semestre, nota]
        );

        res.status(201).json({ mensaje: 'Calificación registrada exitosamente', calificacion: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Listar todas las calificaciones (con contexto legible)
const listarCalificaciones = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cal.id, cal.semestre, cal.nota,
              i.id AS inscripcion_id,
              e.id AS estudiante_id, e.nombre AS estudiante_nombre,
              c.id AS curso_id, c.nombre AS curso_nombre
       FROM calificaciones cal
       JOIN inscripciones i ON cal.inscripcion_id = i.id
       JOIN estudiantes e ON i.estudiante_id = e.id
       JOIN cursos c ON i.curso_id = c.id
       ORDER BY e.nombre, c.nombre, cal.semestre`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Obtener la "tarjeta" de calificaciones de un estudiante (todos sus cursos y notas)
const tarjetaPorEstudiante = async (req, res) => {
    const { estudiante_id } = req.params;
    try {
        const estudiante = await pool.query('SELECT id, nombre, carnet FROM estudiantes WHERE id = $1', [estudiante_id]);
        if (estudiante.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        const result = await pool.query(
            `SELECT i.id AS inscripcion_id, c.id AS curso_id, c.nombre AS curso_nombre,
              cal.semestre, cal.nota
       FROM inscripciones i
       JOIN cursos c ON i.curso_id = c.id
       LEFT JOIN calificaciones cal ON cal.inscripcion_id = i.id
       WHERE i.estudiante_id = $1
       ORDER BY c.nombre, cal.semestre`,
            [estudiante_id]
        );

        // Agrupamos las filas planas (una por semestre) en un objeto por inscripción
        const cursosMap = new Map();

        for (const fila of result.rows) {
            if (!cursosMap.has(fila.inscripcion_id)) {
                cursosMap.set(fila.inscripcion_id, {
                    inscripcion_id: fila.inscripcion_id,
                    curso_id: fila.curso_id,
                    curso_nombre: fila.curso_nombre,
                    notas: { s1: null, s2: null },
                });
            }
            if (fila.semestre === 1) cursosMap.get(fila.inscripcion_id).notas.s1 = fila.nota;
            if (fila.semestre === 2) cursosMap.get(fila.inscripcion_id).notas.s2 = fila.nota;
        }

        res.json({
            estudiante: estudiante.rows[0],
            cursos: Array.from(cursosMap.values()),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};
// Actualizar una calificación existente
const actualizarCalificacion = async (req, res) => {
    const { id } = req.params;
    const { nota } = req.body;

    if (nota === undefined) {
        return res.status(400).json({ mensaje: 'La nota es requerida' });
    }

    if (nota < 0 || nota > 100) {
        return res.status(400).json({ mensaje: 'La nota debe estar entre 0 y 100' });
    }

    try {
        const result = await pool.query(
            `UPDATE calificaciones SET nota = $1
       WHERE id = $2
       RETURNING id, inscripcion_id, semestre, nota`,
            [nota, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Calificación no encontrada' });
        }

        res.json({ mensaje: 'Calificación actualizada exitosamente', calificacion: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Eliminar una calificación
const eliminarCalificacion = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM calificaciones WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Calificación no encontrada' });
        }
        res.json({ mensaje: 'Calificación eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

module.exports = {
    crearCalificacion,
    listarCalificaciones,
    tarjetaPorEstudiante,
    actualizarCalificacion,
    eliminarCalificacion,
};