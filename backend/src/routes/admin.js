const { Router } = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware  = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats',        adminController.stats);
router.get('/transactions', adminController.transactions);
router.get('/players',      adminController.players);

module.exports = router;
