"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                return (0, response_1.sendError)(res, `Validation error: ${errorMessages}`, 400, error.errors);
            }
            return (0, response_1.sendError)(res, 'Invalid request payload', 400);
        }
    };
};
exports.validateRequest = validateRequest;
