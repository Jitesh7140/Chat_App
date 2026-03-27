const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const { promiseHooks } = require("v8");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// fileName ki jagah pura file object pass karein
const uploadfiletocloudinary = async (file) => {
  if (!file) return null;

  const options = {
    // mimetype ki spelling check karein
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
  };

  return new Promise((resolve, reject) => {
    // minetype -> mimetype (spelling mistake thi)
    const uploader = file.mimetype.startsWith("video")
      ? cloudinary.uploader.upload_large
      : cloudinary.uploader.upload;

    uploader(file.path, options, (error, result) => {
      // File delete zaroor karein upload ke baad
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (error) {
        console.error("Cloudinary Error:", error);
        return reject(error);
      }
      resolve(result);
    });
  });
};

const multerMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = "uploads/";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir); // Agar folder nahi hai toh bana do
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Date.now() lagane se duplicate names ki problem nahi hogi
    },
  }),
});

module.exports = { uploadfiletocloudinary, multerMiddleware };
