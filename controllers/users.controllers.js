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

export const getTarifas = async (req, res) => {
    try {
        const cedula = req.headers.cedula;
        const [rows] = await pool.query(`
            SELECT t.*, s.nombre as servicio, tp.nombre as tipo_tarifa
            FROM tarifas t
            JOIN servicios s ON t.servicio_id = s.id
            JOIN tipos_tarifas tp ON t.tipo_tarifa_id = tp.id
            WHERE t.cedula = ?
        `, [cedula]);

        const grouped = rows.reduce((acc, row) => {
            const index = acc.findIndex(item => item.servicio_id === row.servicio_id);
            if (index === -1) {
                acc.push({
                    id: row.id,
                    cedula: row.cedula,
                    servicio_id: row.servicio_id,
                    servicio: row.servicio,
                    tipos_tarifas: [{
                        tipo_tarifa: row.tipo_tarifa,
                        tipo_tarifa_id: row.tipo_tarifa_id,
                        precio: row.precio,
                        label: row.tipo_tarifa === 'media_jornada' ? 'Media Jornada' : 'Jornada Completa'
                    }]
                });
            } else {
                acc[index].tipos_tarifas.push({
                    tipo_tarifa: row.tipo_tarifa,
                    tipo_tarifa_id: row.tipo_tarifa_id,
                    precio: row.precio,
                    label: row.tipo_tarifa === 'media_jornada' ? 'Media Jornada' : 'Jornada Completa'
                });
            }
            return acc;
        }, []);

        res.json(grouped);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export const updateTarifas = async (req, res) => {
    try {
        const {tarifas} = req.body;

        for (let i = 0; i < tarifas.length; i++) {
            const { cedula, servicio_id, tipos_tarifas } = tarifas[i];
            for (let j = 0; j < tipos_tarifas.length; j++) {
                const { precio, tipo_tarifa_id } = tipos_tarifas[j];
                await pool.query(`
                    UPDATE tarifas
                    SET precio = ?
                    WHERE cedula = ? AND servicio_id = ? AND tipo_tarifa_id = ?
                `, [precio, cedula, servicio_id, tipo_tarifa_id]);
            }
        }

        res.json({
            message: 'Tarifas updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export const createServiceRequest = async (req, res) => {
    try {
        const solicitudes = req.body;

        for (let i = 0; i < solicitudes.length; i++) {
            const { idOfertante, idSolicitante, servicio_id, tipo_tarifa_id, plan, precio, fechas } = solicitudes[i];

            const [result] = await pool.query(
                "INSERT INTO solicitudes(idOfertante, idSolicitante, servicio_id, tipo_tarifa_id, plan, precio) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    idOfertante, idSolicitante, servicio_id, tipo_tarifa_id, plan, precio
                ]
            );

            const solicitud_id = result.insertId;

            for (let j = 0; j < fechas.length; j++) {
                await pool.query(
                    "INSERT INTO fechas_solicitudes(solicitud_id, fecha) VALUES (?, ?)",
                    [
                        solicitud_id, fechas[j]
                    ]
                );
            }
        }

        res.json({
            message: 'Solicitudes creadas exitosamente'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getServices = async (req, res) => {
    try {
        const { cedula, typeuser } = req.headers;
        let query = 
            "SELECT s.id, s.idOfertante, s.idSolicitante, s.servicio_id, s.tipo_tarifa_id, s.plan, s.precio, f.fecha, u.nombre, u.email, u.telefono, " +
            "tp.nombre as tipo_tarifa, se.nombre as servicio " +
            "FROM solicitudes s " +
            "JOIN fechas_solicitudes f ON s.id = f.solicitud_id " +
            "JOIN usuarios u ON s.idOfertante = u.cedula " +
            "JOIN tipos_tarifas tp ON s.tipo_tarifa_id = tp.id " +
            "JOIN servicios se ON s.servicio_id = se.id ";

        if (typeuser === 'solicitante') {
            query += " WHERE s.idSolicitante = ?";
        } else if (typeuser === 'ofertante') {
            query += " WHERE s.idOfertante = ?";
        } else {
            return res.status(400).json({
                message: "Invalid typeUser"
            });
        }

        const [solicitudes] = await pool.query(query, [cedula]);
        res.json(solicitudes);
        
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}
