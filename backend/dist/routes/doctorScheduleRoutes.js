"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorScheduleController_1 = require("../controllers/doctorScheduleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const appointmentValidators_1 = require("../validators/appointmentValidators");
const router = (0, express_1.Router)();
// Public / Authenticated doctor directory & slots
router.get('/', authMiddleware_1.authenticateToken, doctorScheduleController_1.DoctorScheduleController.getAllDoctors);
router.get('/:id', authMiddleware_1.authenticateToken, doctorScheduleController_1.DoctorScheduleController.getDoctorById);
router.get('/:id/availability', authMiddleware_1.authenticateToken, doctorScheduleController_1.DoctorScheduleController.getDoctorAvailability);
// Admin / Doctor schedule update
router.post('/:id/schedule', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['DOCTOR', 'ADMIN']), (0, validateMiddleware_1.validateRequest)(appointmentValidators_1.updateScheduleSchema), doctorScheduleController_1.DoctorScheduleController.updateSchedule);
exports.default = router;
