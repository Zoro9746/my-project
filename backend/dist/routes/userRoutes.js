"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const authValidators_1 = require("../validators/authValidators");
const router = (0, express_1.Router)();
router.get('/profile', authMiddleware_1.authenticateToken, userController_1.UserController.getProfile);
router.put('/profile', authMiddleware_1.authenticateToken, (0, validateMiddleware_1.validateRequest)(authValidators_1.updateProfileSchema), userController_1.UserController.updateProfile);
// Admin-only endpoints
router.get('/', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['ADMIN']), userController_1.UserController.getAllUsers);
router.patch('/:id/status', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['ADMIN']), userController_1.UserController.toggleUserStatus);
exports.default = router;
