import { Router } from 'express';
import { chat } from './chatbot.controller.js';
import { requireAuth } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const router = Router();
router.post('/', requireAuth, asyncHandler(chat));
