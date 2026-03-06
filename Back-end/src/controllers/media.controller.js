import cloudinary from "../config/cloudinary.js";

export const uploadMedia = async (req, res) => {
  try {

    const file = req.file;

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Upload failed" });
        }

        res.json({
          url: result.secure_url,
          size: result.bytes
        });
      }
    );
    console.log("Uploading file:", file);
    result.end(file.buffer);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Upload error"
    });
  }
};