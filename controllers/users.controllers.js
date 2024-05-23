import { pool } from "../db.js"

export const getUsers = async(req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM pruebas ORDER BY createAt ASC");
    
        res.json(result);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM pruebas WHERE id = ?', [req.params.id]);
    
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

export const createUser = async(req, res) => {
    try {
        const {title, description} = req.body;
        const [result] = await pool.query(
            "INSERT INTO pruebas(title, description) VALUES (?, ?)",
            [
                title,
                description,
            ]
        );
    
        res.json({
            id: result.insertId,
            title,
            description
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        }) 
    }
}

export const updateUser = async (req, res) => {
    try {
        const result = await pool.query("UPDATE pruebas SET ? WHERE id = ?", [
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
        const [result] = await pool.query('DELETE FROM pruebas WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        return res.sendStatus(204);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        }) 
    }
}