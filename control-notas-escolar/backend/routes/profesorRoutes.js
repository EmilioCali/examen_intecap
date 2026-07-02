const express = require('express');
const router = express.Router();
const { crearProfesor, listarProfesores } = require('../controllers/profesorController');

router.post('/', crearProfesor);
router.get('/', listarProfesores);

module.exports = router;