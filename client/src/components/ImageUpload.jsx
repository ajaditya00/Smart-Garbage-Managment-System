import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image } from 'lucide-react';

const ImageUpload = ({ onImageSelect, selectedImage, className = '' }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(file, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    onImageSelect(null, null);
  };

  return (
    <div className={`w-full ${className}`}>
      {selectedImage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.02 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            {dragOver ? (
              <Upload className="w-12 h-12 text-primary-500" />
            ) : (
              <Image className="w-12 h-12 text-gray-400" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-700">
                {dragOver ? 'Drop image here' : 'Upload Image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;