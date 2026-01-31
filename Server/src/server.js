import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

const app = express();
const port = process.env.PORT || 7000;

app.use("/api/auth" , authRoutes);
app.use("/api/messages" , messageRoutes);

app.listen(port , ()=>{
    console.log(`Server running on port ${port}`);
})