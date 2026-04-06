import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
  try {
    const result = await cloudinary.uploader.upload('https://raw.githubusercontent.com/cloudinary/cloudinary-training/master/assets/images/cloudinary_logo.png', {
      folder: 'test'
    });
    console.log('Upload success:', result.secure_url);
    process.exit(0);
  } catch (err) {
    console.error('Upload failed:', err.message);
    process.exit(1);
  }
}

testCloudinary();
