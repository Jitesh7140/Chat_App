const express = require('express')
const router = express.Router();
const statusController = require('../controller/statusController'); 
const authMiddleware = require('../middleware/authMiddleware');
const { multerMiddleware } = require('../config/imageCloud');

  
//protected routes
router.post('/createStatus' ,multerMiddleware.single('file'), authMiddleware,statusController.createStatus) 
router.get('/getStatus' , authMiddleware,statusController.getStatus)  

router.put('/:statusId/view' ,  authMiddleware,statusController.viewStatus)


router.delete('/:statusId' ,  authMiddleware,statusController.deleteStatus)


module.exports = router;