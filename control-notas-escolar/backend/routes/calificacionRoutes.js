const express = require('express');
const router = express.Router();
const {
    crearCalificacion,
    listarCalificaciones,
    tarjetaPorEstudiante,
    actualizarCalificacion,
    eliminarCalificacion,
} = require('../controllers/calificacionController');

router.post('/', crearCalificacion);
router.get('/', listarCalificaciones);
router.get('/tarjeta/:estudiante_id', tarjetaPorEstudiante);
router.put('/:id', actualizarCalificacion);
router.delete('/:id', eliminarCalificacion);

module.exports = router;