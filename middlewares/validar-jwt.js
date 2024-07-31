import {response} from 'express'
import jwt from 'jsonwebtoken'

export const validarJWT = (req, res = response, next) => {
    const token = req.header('x-token')

    if(!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        })
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );

        req.cedula = payload.cedula
        req.name = payload.name

        console.log('payload',payload)
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'token no valido'
        })
    }

    next()
}