import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { checkAuth } from '../middleware/checkAuth';
import { RegisterSchema, LoginSchema, OnboardSchema } from '../validators/auth.validators';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', checkAuth, AuthController.logout);
router.get('/me', checkAuth, AuthController.getMe);
router.post('/onboard', checkAuth, validate(OnboardSchema), AuthController.onboard);

export default router;
