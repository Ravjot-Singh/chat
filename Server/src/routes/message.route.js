import express from 'express';
import {protectRoute} from '../middlewares/auth.middleware.js';
import { arcjetProtect } from '../middlewares/arcjet.middleware.js';
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.use(arcjetProtect , protectRoute);

router.get('/contacts', getAllContacts );
router.get('/chats'  , getChatPartners);
router.get('/:id' , getMessagesByUserId );
router.post('/send/:id' , sendMessage);

export default router;
