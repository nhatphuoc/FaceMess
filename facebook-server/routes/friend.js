const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authenticate = require('../middleware/authenticate');

router.post('/add', authenticate, friendController.addFriend);
router.get('/check/:friendId', authenticate, friendController.checkFriend);

module.exports = router;