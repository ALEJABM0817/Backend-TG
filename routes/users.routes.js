import { Router } from "express";
import {
    getUsers,
    getUser,
    updateUser,
    createUser,
    deleteUser
} from '../controllers/users.controllers.js';

const router = Router();

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/user', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
