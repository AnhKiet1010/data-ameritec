const express = require('express');
const router = express.Router();

const {
    convertUser,
    updateNewParentId,
    saveTree,
    convertTree
} = require('../controllers/data.controller');

router.get('/convertUser', convertUser);
router.get('/updateUser', updateNewParentId);
router.get('/saveTree', saveTree);
router.get('/convertTree', convertTree);

module.exports = router;