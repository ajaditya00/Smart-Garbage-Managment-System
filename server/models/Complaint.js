import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  // Stores the Cloudinary secure URL of the uploaded image
  image: {
    type: String,
    default: null
  },
  // Stores additional Cloudinary metadata for easy retrieval
  imageData: {
    publicId:   { type: String, default: null }, // Cloudinary public_id
    url:        { type: String, default: null }, // Cloudinary secure_url (same as image field)
    format:     { type: String, default: null }, // e.g. "jpg"
    width:      { type: Number, default: null },
    height:     { type: Number, default: null },
    bytes:      { type: Number, default: null }  // file size in bytes
  },
  location: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  category: {
    type: String,
    enum: ['garbage', 'sewage', 'road', 'electricity', 'water', 'household', 'industrial', 'public', 'other'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'verified'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedType: {
    type: String,
    enum: ['employee', 'ngo', null],
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', complaintSchema);