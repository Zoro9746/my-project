"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consultationController_1 = require("../controllers/consultationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const consultationValidators_1 = require("../validators/consultationValidators");
const router = (0, express_1.Router)();
// Complete consultation (Doctor only)
router.post('/', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['DOCTOR']), (0, validateMiddleware_1.validateRequest)(consultationValidators_1.completeConsultationSchema), consultationController_1.ConsultationController.completeConsultation);
// Doctor patient search
router.get('/patients/search', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['DOCTOR', 'ADMIN']), consultationController_1.ConsultationController.searchPatients);
// Patient history
router.get('/my-history', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['STUDENT']), consultationController_1.ConsultationController.getMyMedicalHistory);
router.get('/patients/:studentId/history', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['DOCTOR', 'ADMIN']), consultationController_1.ConsultationController.getPatientHistory);
exports.default = router;
