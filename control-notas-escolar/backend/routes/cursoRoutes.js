const express = require('express');
const router = express.Router();
const {
    crearCurso,
    listarCursos,
    obtenerCurso,
    actualizarCurso,
    eliminarCurso,
} = require('../controllers/cursoController');

router.post('/', crearCurso);
router.get('/', listarCursos);
router.get('/:id', obtenerCurso);
router.put('/:id', actualizarCurso);
router.delete('/:id', eliminarCurso);

module.exports = router;