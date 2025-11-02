import express from 'express'
import userController from '../controllers/userController'
import adminController from '../controllers/adminController';

const router = express.Router();

router.post('/admin-login',adminController.adminLogin)


export default router