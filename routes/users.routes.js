import { Router } from "express";
import {
    getUsers,
    getUser,
    getUserData,
    updateUser,
    createUser,
    deleteUser,
    revalidarToken,
    getCompleteInfo,
    getOfertantantes,
    getOfertanteForCV,
    getTarifas,
    updateTarifas,
    createServiceRequest,
    getServices,
    setRating,
    toggleUsuarioHabilitado,
    saveExperiences,
    requestPasswordReset,
    resetPassword,
    deleteService
} from '../controllers/users.controllers.js';
import {validarJWT} from '../middlewares/validar-jwt.js'

const router = Router();

router.get('/users', getUsers);
router.post('/auth', getUser);
router.get('/get-user', getUserData);
router.post('/user', createUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.post('/is-complete-info', getCompleteInfo);
router.get('/ofertantes', getOfertantantes);
router.post('/ofertanteCV', getOfertanteForCV);
router.get('/renew', validarJWT, revalidarToken)
router.get(('/tarifas'), getTarifas)
router.put('/tarifas-update/:id', updateTarifas)
router.post('/service', createServiceRequest)
router.get('/get-services', getServices)
router.post('/set-rating', setRating)
router.put('/toggle-users', toggleUsuarioHabilitado);
router.post('/save-experience', saveExperiences)
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/service-delete', deleteService);

export default router;
