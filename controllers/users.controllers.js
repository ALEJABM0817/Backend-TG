import { pool } from "../db.js"
import { generarJWT } from '../helpers/jwt.js';
export const getUsers = async(req, res) => {
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
        const {cedula, password} = req.body;
        let [result] = await pool.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula]);
        
        if (!result.length) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        [result] = await pool.query('SELECT * FROM usuarios WHERE cedula = ? AND password = ?', [cedula, password]);
        
        if(!result.length) {
            return res.status(404).json({
                message: "Credenciales invalidas"
            })
        }
        const token = await generarJWT(result[0].cedula, result[0].nombre)

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

export const createUser = async(req, res) => {
    try {
        const {cedula, nombre, direccion, telefono, email, password} = req.body;
        const values = req.body;
        const isEmpty = Object.values(values).some(x => (x === ''));

        if ( isEmpty) {
            throw new Error("Los campos son obligatorios");
        }

        const [result] = await pool.query(
            "INSERT INTO usuarios(cedula, nombre, direccion, telefono, email, password) VALUES (?, ?, ?, ?, ?, ?)",
            [
                cedula, nombre, direccion, telefono, email, password
            ]
        );

        res.json({
            cedula, nombre, direccion, telefono, email, password
        })

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
        const result = await pool.query("UPDATE usuarios SET ? WHERE id = ?", [
            req.body,
            req.params.id
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

export const revalidarToken = async(req, res) => {
    const cedula = req.cedula;
    const name = req.name;

   const token = await generarJWT(cedula, name)

    return res.json({
        ok: true,
        cedula,
        name,
        token
    })
}