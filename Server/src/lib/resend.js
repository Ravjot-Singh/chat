import 'dotenv/config';
import {Resend} from 'resend';
import { ENV } from './env.js';

export const resendClient = new Resend(ENV.RESEND_API_KEY);

const rawFrom = (ENV.EMAIL_FROM || '').trim();
let parsedEmail = rawFrom;
let parsedName = (ENV.EMAIL_FROM_NAME || '').trim();

const match = rawFrom.match(/^(.*)<([^>]+)>$/);
if (match) {
    parsedName = parsedName || match[1].trim();
    parsedEmail = match[2].trim();
}

export const sender = {
    email: parsedEmail,
    name: parsedName,
};

