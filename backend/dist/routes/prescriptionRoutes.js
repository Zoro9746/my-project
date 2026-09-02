"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescriptionController_1 = require("../controllers/prescriptionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticateToken, prescriptionController_1.PrescriptionController.getAllPrescriptions);
router.get('/:id', authMiddleware_1.authenticateToken, prescriptionController_1.PrescriptionController.getPrescriptionById);
exports.default = router;
