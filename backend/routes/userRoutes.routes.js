import { Router } from 'express';
import { getUsers } from '../controllers/user.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = Router();

router.get('/', protectRoute, getUsers);

export default router;
