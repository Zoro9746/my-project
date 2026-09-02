"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const appointmentValidators_1 = require("../validators/appointmentValidators");
const router = (0, express_1.Router)();
// Student appointment booking
router.post('/', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['STUDENT']), (0, validateMiddleware_1.validateRequest)(appointmentValidators_1.bookAppointmentSchema), appointmentController_1.AppointmentController.bookAppointment);
// List appointments
router.get('/', authMiddleware_1.authenticateToken, appointmentController_1.AppointmentController.getAppointments);
// Doctor today queue
router.get('/queue/today', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.requireRole)(['DOCTOR', 'ADMIN']), appointmentController_1.AppointmentController.getDoctorTodayQueue);
// Cancel & Reschedule
router.patch('/:id/cancel', authMiddleware_1.authenticateToken, appointmentController_1.AppointmentController.cancelAppointment);
router.patch('/:id/reschedule', authMiddleware_1.authenticateToken, (0, validateMiddleware_1.validateRequest)(appointmentValidators_1.rescheduleAppointmentSchema), appointmentController_1.AppointmentController.rescheduleAppointment);
exports.default = router;
