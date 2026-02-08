import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {ENV} from './lib/env.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { app , server } from './lib/socket.js';



const __dirname = path.resolve();

const port = ENV.PORT || 7000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ENV.CLIENT_URL ,
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Client/dist")));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../Client/dist/index.html"));
    })
}


connectDB().then(() => {

    server.listen(port, () => {


        console.log(`Server running on port ${port}`);

    })

}).catch((error)=>{

    console.log("Failed to connect to MongoDB: " , error);

})
