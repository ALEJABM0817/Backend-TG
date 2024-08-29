import { Router } from "express";
import {
    getUsers,
    getUser,
    updateUser,
    createUser,
    deleteUser,
    revalidarToken,
    getCompleteInfo
} from '../controllers/users.controllers.js';
import {validarJWT} from '../middlewares/validar-jwt.js'

const router = Router();

router.get('/users', getUsers);
router.post('/auth', getUser);
router.post('/user', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/is-complete-info', getCompleteInfo);

router.get('/renew', validarJWT, revalidarToken)

export default router;
