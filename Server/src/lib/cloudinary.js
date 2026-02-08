import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

cloudinary.config({
  cloud_name: ENV.CLOUDINAY_CLOUD_NAME,
  api_key: ENV.CLOUDINAY_API_KEY,
  api_secret: ENV.CLOUDINAY_API_SECRET,
});

export default cloudinary;