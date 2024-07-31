import { Router } from "express";
import {
    getUsers,
    getUser,
    updateUser,
    createUser,
    deleteUser,
    revalidarToken
} from '../controllers/users.controllers.js';
import {validarJWT} from '../middlewares/validar-jwt.js'

const router = Router();

router.get('/users', getUsers);
router.get('/users/:cedula/:password', getUser);
router.post('/user', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/renew', validarJWT, revalidarToken)

export default router;
