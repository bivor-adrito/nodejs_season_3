const express = require("express");
const router = express.Router();
// const User = require("../../models/User");
const User = require('../../repositories/user.repository')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");

//? Create a user
router.post(
  "/",
  [
    body("fname", "First name is required").notEmpty(),
    body("lname", "Last name is required").notEmpty(),
    body("email", "Please enter a valid email").isEmail(),
    body("email", "Email is required").notEmpty(),
    body("password", "Password is required").notEmpty(),
    body("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
    body(
      "password",
      "Password must contain at least one uppercase letter"
    ).matches("[A-Z]", "g"),
    body(
      "password",
      "Password must contain at least one lowercase letter"
    ).matches("[a-z]", "g"),
    body("password", "Password must contain at least one number").matches(
      "[0-9]",
      "g"
    ),
    body("userType", "userType is required").notEmpty(),
    body("userType", "give a valid userType").isIn(["customer", "admin"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }else{
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        const userObj = {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          password: hash,
          userType: req?.body?.userType ?? "customer",
        };
        // const user = new User(userObj);
        // await user.save();
        const user = await User.create(userObj);
        res.status(201).json(user);
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

//? Login a user
router.post("/login", async (req, res) => {
  try {
    const { type, email, password, refreshToken } = req.body;
    if (type == "email") {
      const user = await User.findOne('email', email);
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        await handleEmailLogin(password, user, res);
      }
    } else {
      //? Login using refresh token
      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token is not defined" });
      } else {
        handleRefreshToken(refreshToken, res);
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//test

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
    const updateUser = await User.update(id, userBody);
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
async function handleEmailLogin(password, user, res) {
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (isValidPassword) {
    const userObj = generateUserObject(user);
    res.json(userObj);
    //todo
  } else {
    res.status(401).json({ message: "Unable to Login" });
  }
}

function handleRefreshToken(refreshToken, res) {
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    } else {
      const user = await User.findById(payload._id);
      if (user) {
        const userObj = generateUserObject(user);
        res.json(userObj);
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    }
  });
}

function generateUserObject(user) {
  const { accessToken, refreshToken } = generateTokens(user);

  // const userObj = user.toJSON();
  const userObj = user;
  userObj["accessToken"] = accessToken;
  userObj["refreshToken"] = refreshToken;
  return userObj;
}

function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      email: user.email,
      _id: user.id,
      userType: user.usertype,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  const refreshToken = jwt.sign(
    {
      email: user.email,
      _id: user.id,
      userType: user.usertype,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  return { accessToken, refreshToken };
}
