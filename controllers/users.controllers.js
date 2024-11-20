import { pool } from "../db.js"
import { generarJWT } from '../helpers/jwt.js';
export const getUsers = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM usuarios WHERE typeUser != 'admin' ORDER BY createdAt ASC");

        res.json(result);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
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

        [result] = await pool.query('SELECT * FROM usuarios WHERE cedula = ? AND password = ? AND habilitado = 1', [cedula, password]);

        if (!result.length) {
            return res.status(403).json({
                message: "Usuario deshabilitado"
            });
        }

        const token = await generarJWT(result[0].cedula, result[0].nombre, result[0].typeUser, result[0].direccion);

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

        const token = await generarJWT(cedula, nombre, typeUser, direccion);

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
    const direccion = req.direccion;
    const token = await generarJWT(cedula, name, typeUser, direccion)

    return res.json({
        ok: true,
        cedula,
        name,
        token,
        typeUser,
        direccion
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
        const [result] = await pool.query(
            'SELECT o.*, u.nombre, AVG(r.calificacion) as promedio_calificacion ' +
            'FROM ofertantes o ' +
            'LEFT JOIN usuarios u ON o.cedula = u.cedula ' +
            'LEFT JOIN rating r ON o.cedula = r.cedula_ofertante ' +
            'GROUP BY o.cedula, u.nombre'
        );
        res.json(result);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

export const getOfertanteForCV = async (req, res) => {
    try {
        const cedula = req.body.cedula;
        const [rows] = await pool.query(`
            SELECT o.photo, e.*, u.nombre, AVG(r.calificacion) as promedio_calificacion, 
                    GROUP_CONCAT(r.comentario SEPARATOR '||') as comentarios, 
                    GROUP_CONCAT(us.nombre SEPARATOR '||') as nombres_solicitantes
                FROM ofertantes o
                LEFT JOIN experiencia e ON o.cedula = e.cedula
                LEFT JOIN usuarios u ON o.cedula = u.cedula
                LEFT JOIN rating r ON o.cedula = r.cedula_ofertante
                LEFT JOIN usuarios us ON r.cedula_solicitante = us.cedula
                WHERE o.cedula = ?
                GROUP BY o.cedula, e.id, u.nombre
        `, [cedula]);
    
        const result = {
            cedula: cedula,
            photo: rows[0]?.photo,
            nombre: rows[0]?.nombre,
            promedio_calificacion: rows[0]?.promedio_calificacion,
            hasExperience: rows[0]?.hasExperience,
            experiences: rows.map(row => ({
                id: row.id,
                title: row.title,
                company: row.company,
                startDate: row.startDate,
                isCurrent: row.isCurrent,
                endDate: row.endDate,
                responsibilities: row.responsibilities
            })),
            comentarios: rows[0]?.comentarios ? rows[0].comentarios.split('||').map((comentario, index) => ({
                nombre: rows[0].nombres_solicitantes.split('||')[index],
                comentario: comentario
            })) : []
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
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
            const { idOfertante, idSolicitante, servicio_id, tipo_tarifa_id, plan, precio, fechas, comentario } = solicitudes[i];

            const [result] = await pool.query(
                "INSERT INTO solicitudes(idOfertante, idSolicitante, servicio_id, tipo_tarifa_id, plan, precio, comentario) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    idOfertante, idSolicitante, servicio_id, tipo_tarifa_id, plan, precio, comentario
                ]
            );

            const solicitud_id = result.insertId;

            for (let j = 0; j < fechas.length; j++) {
                const { fecha, turno } = fechas[j];
                await pool.query(
                    "INSERT INTO fechas_solicitudes(solicitud_id, fecha, turno) VALUES (?, ?, ?)",
                    [
                        solicitud_id, fecha, turno
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
            "SELECT s.id, s.idOfertante, s.idSolicitante, s.servicio_id, s.tipo_tarifa_id, s.plan, s.precio, s.comentario, s.status, " +
            "u.nombre, u.email, u.telefono, u.direccion, " +
            "tp.nombre as tipo_tarifa, se.nombre as servicio, GROUP_CONCAT(f.fecha) as fechas, GROUP_CONCAT(f.turno) as turnos " +
            "FROM solicitudes s " +
            "JOIN fechas_solicitudes f ON s.id = f.solicitud_id " +
            "JOIN tipos_tarifas tp ON s.tipo_tarifa_id = tp.id " +
            "JOIN servicios se ON s.servicio_id = se.id ";

        if (typeuser === 'solicitante') {
            query += "JOIN usuarios u ON s.idOfertante = u.cedula WHERE s.idSolicitante = ? ";
        } else if (typeuser === 'ofertante') {
            query += "JOIN usuarios u ON s.idSolicitante = u.cedula WHERE s.idOfertante = ? ";
        } else {
            return res.status(400).json({
                message: "Invalid typeUser"
            });
        }

        query += "GROUP BY s.id ORDER BY MAX(f.fecha) DESC";

        const [solicitudes] = await pool.query(query, [cedula]);

        solicitudes.forEach(solicitud => {
            const fechas = solicitud.fechas ? solicitud.fechas.split(',') : [];
            const turnos = solicitud.turnos ? solicitud.turnos.split(',') : [];
            solicitud.fechas = fechas.map((fecha, index) => ({ fecha, turno: turnos[index] }));
        });

        res.json(solicitudes);
        
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

export const setRating = async (req, res) => {
    const { service_id, idSolicitante, idOfertante, calificacion, comentario } = req.body;
    try {
        await pool.query(
            "INSERT INTO rating (solicitud_id, cedula_solicitante, cedula_ofertante, calificacion, comentario) VALUES (?, ?, ?, ?, ?)",
            [service_id, idSolicitante, idOfertante, calificacion, comentario]
        );

        await pool.query(
            "UPDATE solicitudes SET status = 'Realizado' WHERE id = ?",
            [service_id]
        );

        res.status(200).json({ message: "Rating set successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while setting the rating." });
    }
};

export const toggleUsuarioHabilitado = async (req, res) => {
    const { cedula, habilitado } = req.body;
    try {
        await pool.query(
            "UPDATE usuarios SET habilitado = ? WHERE cedula = ?",
            [habilitado, cedula]
        );

        res.status(200).json({ message: "Usuario actualizado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ocurrió un error al actualizar el estado del usuario." });
    }
};

export const saveExperiences = async (req, res) => {
    try {
        const { experiences } = req.body;

        for (const experience of experiences) {
            const { id, cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities } = experience;

            if (id) {
                // Actualizar experiencia existente
                const query = `
                    UPDATE experiencia 
                    SET 
                        hasExperience = ?, 
                        title = ?, 
                        company = ?, 
                        startDate = ?, 
                        isCurrent = ?, 
                        endDate = ?, 
                        responsibilities = ? 
                    WHERE id = ? AND cedula = ?
                `;
                const values = [hasExperience, title, company, startDate, isCurrent, endDate, responsibilities, id, cedula];
                await pool.query(query, values);
            } else {
                // Insertar nueva experiencia
                const query = `
                    INSERT INTO experiencia (cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities];
                await pool.query(query, values);
            }
        }

        res.json({ message: 'Experiencias guardadas/actualizadas correctamente' });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}