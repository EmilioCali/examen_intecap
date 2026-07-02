const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const login = async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM profesores WHERE usuario = $1',
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const profesor = result.rows[0];
        const passwordValida = await bcrypt.compare(password, profesor.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        //Por ahora trabajo sin el hash
        res.json({
            mensaje: 'Login exitoso',
            profesor: {
                id: profesor.id,
                nombre: profesor.nombre,
                usuario: profesor.usuario,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

module.exports = { login };