const express = require('express');
const router = express.Router();
const {
    crearInscripcion,
    listarInscripciones,
    listarPorEstudiante,
    eliminarInscripcion,
} = require('../controllers/inscripcionController');

router.post('/', crearInscripcion);
router.get('/', listarInscripciones);
router.get('/estudiante/:estudiante_id', listarPorEstudiante);
router.delete('/:id', eliminarInscripcion);

module.exports = router;