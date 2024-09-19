import { pool } from "../db.js"
import { generarJWT } from '../helpers/jwt.js';
export const getUsers = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM usuarios ORDER BY createdAt ASC");

        res.json(result);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const { cedula, password } = req.body;
        let [result] = await pool.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula]);

        if (!result.length) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        [result] = await pool.query('SELECT * FROM usuarios WHERE cedula = ? AND password = ?', [cedula, password]);

        if (!result.length) {
            return res.status(404).json({
                message: "Credenciales invalidas"
            })
        }

        const token = await generarJWT(result[0].cedula, result[0].nombre, result[0].typeUser);

        res.json({
            ...result[0],
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getUserData = async (req, res) => {
    try {
        const cedula = req.headers.cedula;
        const [result] = await pool.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula]);

        if (!result.length) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        res.json(result[0]);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const createUser = async (req, res) => {
    try {
        const { cedula, nombre, direccion, telefono, email, password, typeUser} = req.body;
        const values = req.body;
        const isEmpty = Object.values(values).some(x => (x === ''));

        if (isEmpty) {
            throw new Error("Los campos son obligatorios");
        }

        const [result] = await pool.query(
            "INSERT INTO usuarios(cedula, nombre, direccion, telefono, email, password, typeUser) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                cedula, nombre, direccion, telefono, email, password, typeUser
            ]
        );

        if(typeUser === 'ofertante') {
            await pool.query(
                "INSERT INTO ofertantes(cedula) VALUES (?)",
                [
                    cedula
                ]
            )
        }

        const token = await generarJWT(cedula, nombre, typeUser);

        res.json(
            {
                cedula, nombre, direccion, telefono, email, password, token, typeUser
            }
        )

    } catch (error) {
        const message = error.message.includes("usuarios.email")
            ? "Ya existe una cuenta con este email"
            : error.message.includes("usuarios.PRIMARY")
                ? "Ya existe una cuenta con esta cedula"
                : error.message;

        return res.status(500).json({
            message
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        const result = await pool.query("UPDATE usuarios SET ? WHERE cedula = ?", [
            req.body,
            req.body.cedula
        ])

        res.json(result)

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE cedula = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        return res.status(200).json({
            message: "Se elimino correctamente"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const revalidarToken = async (req, res) => {
    const cedula = req.cedula;
    const name = req.name;
    const typeUser = req.typeUser;

    const token = await generarJWT(cedula, name, typeUser)

    return res.json({
        ok: true,
        cedula,
        name,
        token,
        typeUser
    })
}

export const getCompleteInfo = async (req, res) => {
    try {
        const cedula = req.body.cedula;
        const [result] = await pool.query('SELECT * FROM ofertantes WHERE cedula = ?', [cedula]);
        if (!result.length) {
            return res.json({
                complete_info: false
            })
        }

        return res.json(
            result[0]
        );
    } catch (error) {
        console.log(error)
    }
}

export const getOfertantantes = async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM ofertantes');
        res.json(result);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getOfertanteForCV = async (req, res) => {
    try {
        const cedula = req.body.cedula;
        const [rows] = await pool.query(`
            SELECT o.photo, e.*, u.nombre
            FROM ofertantes o
            LEFT JOIN experiencia e ON o.cedula = e.cedula
            LEFT JOIN usuarios u ON o.cedula = u.cedula
            WHERE o.cedula = ?
        `, [cedula]);
    
        const result = {
            cedula: cedula,
            photo: rows[0]?.photo,
            nombre: rows[0]?.nombre,
            hasExperience: rows[0]?.hasExperience,
            experiences: rows.map(row => ({
                id: row.id,
                title: row.title,
                company: row.company,
                startDate: row.startDate,
                isCurrent: row.isCurrent,
                endDate: row.endDate,
                responsibilities: row.responsibilities
            }))
        };

        res.json(result);
    } catch (error) {
        req.status(500).json({
            message: error.message
        })
    }
}