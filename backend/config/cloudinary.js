// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// console.log('Setting up Cloudinary with:');
// console.log(`- Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
// console.log(`- API key length: ${process.env.CLOUDINARY_API_KEY?.length || 0} characters`);
// console.log(`- API secret first/last char: ${process.env.CLOUDINARY_API_SECRET?.[0]}-${process.env.CLOUDINARY_API_SECRET?.slice(-1)}`);

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// Verify configuration settings were applied
const config = cloudinary.config();
// console.log('Cloudinary configured with cloud name:', config.cloud_name);

// Perform a simple API call to verify the connection
cloudinary.api.ping()
  .then(result => {
    console.log('✓ Cloudinary credentials verified successfully');
  })
  .catch(error => {
    console.error('✗ Cloudinary credentials verification failed:', error.message);
  });

module.exports = cloudinary;