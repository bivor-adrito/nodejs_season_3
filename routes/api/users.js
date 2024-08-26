const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const authenticateToken = require('../../middleware/auth')

//? Create a user
router.post("/", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const userObj = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      password: hash,
    };
    const user = new User(userObj);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Login a user
router.post("/login", async (req, res) => {
  try {
    const { type, email, password } = req.body;
    if (type == "email") {
      const user = await User.findOne({ email: email });
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
          const accessToken = jwt.sign({
            email: user.email,
            _id: user._id
          }, process.env.JWT_SECRET,{
            expiresIn: '1m'
          })
          const refreshToken = jwt.sign({
            email: user.email,
            _id: user._id
          }, process.env.JWT_SECRET,{
            expiresIn: '3d'
          })
          const userObj = user.toJSON()
          userObj['accessToken']=accessToken
          userObj['refreshToken']=refreshToken
          res.json(userObj);
          //todo     
        } else {
          res.status(401).json({ message: "Unable to Login" });
        }
      }
    } else {
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Get all user
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Get one user
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});


//? Update one user
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userBody = req.body;
    const updateUser = await User.findByIdAndUpdate(id, userBody, {
      new: true,
    });
    if (updateUser) {
      res.json(updateUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Delete one user
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteUser = await User.findByIdAndDelete(id);
    if (deleteUser) {
      res.json({ message: "User is deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
