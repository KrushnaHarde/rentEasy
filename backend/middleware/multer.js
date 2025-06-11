const multer = require('multer');
const storage = multer.memoryStorage(); // because you're streaming to Cloudinary
const upload = multer({ storage });
module.exports = upload;
