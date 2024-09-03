import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();
export const generarJWT = (cedula, name, typeUser) => {
    console.log(typeUser)
    return new Promise((resolve, reject) => {
        const payload = {cedula, name, typeUser};
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '5h'
        }, (err, token) => {
            if(err) {
                console.log(err);
                reject('No se pudo generar el token')
            }

            resolve(token)
        })
    })
}
