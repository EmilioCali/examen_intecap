const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

//Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const profesorRoutes = require('./routes/profesorRoutes');
app.use('/api/profesores', profesorRoutes);
const cursoRoutes = require('./routes/cursoRoutes');
app.use('/api/cursos', cursoRoutes);
const estudianteRoutes = require('./routes/estudianteRoutes');
app.use('/api/estudiantes', estudianteRoutes);
const inscripcionRoutes = require('./routes/inscripcionRoutes');
app.use('/api/inscripciones', inscripcionRoutes);
const calificacionRoutes = require('./routes/calificacionRoutes');
app.use('/api/calificaciones', calificacionRoutes);

// Ruta de prueba para verificar conexión a la BD
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            mensaje: 'Backend y base de datos funcionando',
            hora_servidor: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', mensaje: 'Error conectando a la base de datos' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});