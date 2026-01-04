import express from 'express'
import userController from '../controllers/userController'
const router = express.Router();

router.post('/signup',userController.signup)
router.post('/verifyotp',userController.verifyOtp)
router.post('/login',userController.login)

// ------------- CHURCH ----------------
router.get('/churches',userController.getChurches)

export default router