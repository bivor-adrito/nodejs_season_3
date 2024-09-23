const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const File = require("../../models/File");
const authenticateToken = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//? upload a file
router.post(
  "/uploads",
  [authenticateToken, upload.single("file")],
  async (req, res) => {
    if (req.user.userType != "admin") {
      return res.status(403).json({ message: "You are not an admin" });
    }

    const fileObj = {
      name: req.file.filename,
      path: req.file.path,
    };
    const file = new File(fileObj);
    await file.save();
    res.status(201).json(file);
  }
);

//? product create
router.post(
  "/",
  [
    authenticateToken,
    body("name", "name is required").notEmpty(),
    body("description", "description is required").notEmpty(),
    body("madeIn", "madeIn is required").notEmpty(),
    body("category", "category is required").notEmpty(),
    body("fileId", "fileId is required").notEmpty(),
    body("price", "price is required").notEmpty(),
    body("price", "price must be numeric").isNumeric(),
  ],
  async (req, res) => {
    try {
      if (req.user.userType != "admin") {
        return res.status(403).json({ message: "You are not an admin" });
      }
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user._id;

      const productObj = {
        name: req.body.name,
        description: req.body.description,
        madeIn: req.body.madeIn,
        category: req.body.category,
        price: parseInt(req.body.price),
        fileId: req.body.fileId,
        userId: userId,
      };
      const product = new Product(productObj);
      await product.save();
      if (product?.fileId) {
        const createdProduct = await Product.findById(product._id)
          .populate(["userId", "fileId"])
          .exec();
        return res.status(201).json(createdProduct);
      }
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

module.exports = router;
