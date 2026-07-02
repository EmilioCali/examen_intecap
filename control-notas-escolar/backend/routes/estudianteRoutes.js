const express = require('express');
const router = express.Router();
const {
    crearEstudiante,
    listarEstudiantes,
    obtenerEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
} = require('../controllers/estudianteController');

router.post('/', crearEstudiante);
router.get('/', listarEstudiantes);
router.get('/:id', obtenerEstudiante);
router.put('/:id', actualizarEstudiante);
router.delete('/:id', eliminarEstudiante);

module.exports = router;