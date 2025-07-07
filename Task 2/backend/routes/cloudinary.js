// backend/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dkauzbm8c',
  api_key: '573511629742557',
  api_secret: 'TSMQ3TUNtvvg0BowXlBY3-AJMgI'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'InstaMini', // Optional folder name
    allowed_formats: ['jpg', 'png', 'jpeg'],
  }
});

module.exports = { cloudinary, storage };
