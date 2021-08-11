const express = require('express');
const router = express.Router();

const {
    convertUser,
    updateNewParentId,
    saveTree,
    convertTree,
    createUserManual,
    deleteUserManual
} = require('../controllers/data.controller');

router.get('/convertUser', convertUser);
router.get('/updateUser', updateNewParentId);
router.get('/saveTree', saveTree);
router.get('/convertTree', convertTree);
router.post('/createUserManual', createUserManual);
router.post('/deleteUserManual', deleteUserManual);

module.exports = router;