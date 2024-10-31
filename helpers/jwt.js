import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();
export const generarJWT = (cedula, name, typeUser, direccion) => {
    return new Promise((resolve, reject) => {
        const payload = {cedula, name, typeUser, direccion};
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '5h'
        }, (err, token) => {
            if(err) {
                reject('No se pudo generar el token')
            }

            resolve(token)
        })
    })
}
