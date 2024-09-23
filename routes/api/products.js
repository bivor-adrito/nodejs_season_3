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

//* Get all products
router.get("/", authenticateToken, async (req, res) => {
  try {
    let current = req?.query?.current ?? "1";
    current = parseInt(current);
    let pageSize = req?.query?.pageSize ?? "10";
    pageSize = parseInt(pageSize);
    let sort = req?.query?.sort ?? "asc";

    const pipeline = [];

    pipeline.push({
      $match: {
        isDeleted: false
      },
    });
    //? sort data by creation time
    switch (sort) {
      case "asc":
        pipeline.push({
          $sort: {
            createdAt: 1,
          },
        });
        break;
      case "desc":
        pipeline.push({
          $sort: {
            createdAt: -1,
          },
        });
        break;
    }

    //? for pagination
    pipeline.push({
      $skip: (current - 1) * pageSize,
    });
    pipeline.push({
      $limit: pageSize * 1,
    });

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    });
    pipeline.push({
      $lookup: {
        from: "files",
        localField: "fileId",
        foreignField: "_id",
        as: "file",
      },
    });
    const products = await Product.aggregate(pipeline);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Get One Product
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id)
      .populate(["fileId", "userId"])
      .exec();
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Update one product
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType != "admin") {
      return res.status(403).json({ message: "You are not an admin" });
    }

    const id = req.params.id;
    const body = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (updatedProduct) {
      return res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Amend a product
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType != "admin") {
      return res.status(403).json({ message: "You are not an admin" });
    }
    const id = req.params.id;
    const amendedProduct = await Product.findByIdAndUpdate(id, {isDeleted: true}, {new: true})
    if (amendedProduct) {
        return res.json(amendedProduct);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
