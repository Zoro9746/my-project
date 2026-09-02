"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const doctorScheduleRoutes_1 = __importDefault(require("./routes/doctorScheduleRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const consultationRoutes_1 = __importDefault(require("./routes/consultationRoutes"));
const prescriptionRoutes_1 = __importDefault(require("./routes/prescriptionRoutes"));
const medicineRoutes_1 = __importDefault(require("./routes/medicineRoutes"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware in dev mode
if (process.env.NODE_ENV !== 'test') {
    exports.app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}
// Health Check
exports.app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        system: 'BIT Student Health Center Management API',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
exports.app.use('/api/auth', authRoutes_1.default);
exports.app.use('/api/users', userRoutes_1.default);
exports.app.use('/api/doctors', doctorScheduleRoutes_1.default);
exports.app.use('/api/appointments', appointmentRoutes_1.default);
exports.app.use('/api/consultations', consultationRoutes_1.default);
exports.app.use('/api/prescriptions', prescriptionRoutes_1.default);
exports.app.use('/api/medicines', medicineRoutes_1.default);
// 404 Route Handler
exports.app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});
// Global Error Handler
exports.app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
if (process.env.NODE_ENV !== 'test') {
    exports.app.listen(PORT, () => {
        console.log(`🚀 BIT Health Center Backend API running on http://localhost:${PORT}`);
    });
}
