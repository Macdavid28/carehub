import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadPhoto = upload.single("image");

export const resizePhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `prescription-${Date.now()}.jpeg`;
    const uploadDir = "uploads/prescriptions";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await sharp(req.file.buffer)
      .resize(1000, 1000, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`${uploadDir}/${filename}`);

    // Set the file path on req.body so it's saved in the database
    req.body.image = `/${uploadDir}/${filename}`;
    next();
  } catch (error) {
    console.error("Image resize error:", error);
    next(error);
  }
};
