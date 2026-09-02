# Testing Strategy — BIT Student Health Center System

## Test Suites

1. **Backend Integration Tests (`backend/src/__tests__/`)**
   - **Authentication Tests**: Registration validation, successful login, incorrect password handling, token generation.
   - **Authorization (RBAC) Tests**: Ensuring Student role cannot access Admin/Pharmacist endpoints, and vice-versa.
   - **Database Model Integrity**: FK constraint integrity and unique constraint checks.

2. **Command to Run Tests**
   ```bash
   cd backend
   npm test
   ```

3. **Production Build Verification**
   - Backend TypeScript compile: `npm run build`
   - Frontend Vite bundle: `npm run build`
