import express from 'express'
import userController from '../controllers/userController'
import adminController from '../controllers/adminController';

const router = express.Router();

router.post('/admin-login',adminController.adminLogin)

// -------------- CHURCH ------------- 

router.post('/add-church',adminController.addChurch)
router.delete("/delete-church/:id",adminController.deleteChurch);
router.put("/update-church/:id", adminController.updateChurch);




export default router