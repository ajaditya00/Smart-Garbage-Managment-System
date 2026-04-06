import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
  name: String,
  role: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findById('69d201a4bc7e48817b73d82e');
    console.log(user ? `User found: ${user.name} (${user.role})` : 'User NOT found');
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkUser();
