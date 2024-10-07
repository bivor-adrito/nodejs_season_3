const express = require("express");
const router = express.Router();
// const Product = require("../../models/Product");
const Product = require("../../repositories/product.repository");
const Order = require("../../repositories/order.repository");
const authenticateToken = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

//? Create an Order
router.post(
  "/",
  [
    authenticateToken,
    body("deliveryLocation", "deliveryLocation is required").notEmpty(),
    body("qty", "qty requirements not met").notEmpty().isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user._id;
      const productId = req.body.productId;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      } else {
        const now = new Date();
        const expectedDeliveryDate = new Date(now)
        expectedDeliveryDate.setDate(now.getDate() + 5)
        const orderObj = {
          userId: userId,
          productId: productId,
          qty: parseInt(req.body.qty) || 1,
          purchaseDate: now,
          expectedDeliveryDate: expectedDeliveryDate,
          deliveryLocation: req.body.deliveryLocation,
          deliveryStatus: "in-progress",
        };
        orderObj.total = orderObj.qty * product.price;

        // const order = new Order(orderObj);
        // await (await order.save()).populate(["productId", "userId"]);
        const order = await Order.create(orderObj)
        if(order?.product_id){
          const createdOrder = await Order.findByIdPopulated(order.id)
          return res.status(201).json(createdOrder);
        }
        return res.status(201).json(order);
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

//? Get All Orders by User
router.get("/", authenticateToken, async (req, res) => {
  try {
    let current = req?.query?.current ?? "1";
    current = parseInt(current);
    let pageSize = req?.query?.pageSize ?? "10";
    pageSize = parseInt(pageSize);
    let sort = req?.query?.sort ?? "asc";

    const userId = req.user._id

    const orders = await Order.findAllByUserId(userId, pageSize, current, sort)

    return res.json(orders)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Cancel my order
router.put("/cancel/:id", authenticateToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { deliveryStatus: "canceled" },
      { new: true }
    )
      .populate(["userId", "productId"])
      .exec();
    if(updatedOrder) {
        return res.json(updatedOrder);
    }else{
        return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Update status of a specific order
router.put(
  "/status/:id",
  [
    authenticateToken,
    [
      body("deliveryStatus", "deliveryStatus is required").notEmpty(),
      body("deliveryStatus", "give a valid status").isIn([
        "delivered",
        "in-progress",
        "canceled",
      ]),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.userType != "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { deliveryStatus: req.body.deliveryStatus },
        { new: true }
      )
        .populate(["userId", "productId"])
        .exec();

      if (updatedOrder) {
        return res.status(200).json(updatedOrder);
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
);

//? Update an existing order
router.put(
  "/:id",
  [
    authenticateToken,
    body("deliveryLocation", "deliveryLocation is required").notEmpty(),
    body("productId", "productId is required").notEmpty(),
    body("qty", "qty requirements not met").notEmpty().isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (req.user.userType != "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const product = await Product.findById(req.body.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      } else {
        req.body.total = req.body.qty * product.price;
      }

      const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
        .populate(["userId", "productId"])
        .exec();
      if (order) {
        return res.json(order);
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
);

//? Delete an order
router.delete('/:id', authenticateToken, async(req, res) =>{
    try{
        if(req.user.userType!= "admin"){
            return res.status(403).json({message: "Unauthorized"});
        }
        const order = await Order.findByIdAndDelete(req.params.id);
        if(order){
            return res.json({message: "Order deleted successfully"});
        }else{
            return res.status(404).json({message: "Order not found"});
        }
    } catch(error){
        return res.status(500).json({message: "Something went wrong"});
    }
})

module.exports = router;
