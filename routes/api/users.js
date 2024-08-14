const express = require("express");
const router = express.Router();
const User = require("../../models/User");

//? Create a user
router.post("/", async (req, res) => {
  const userObj = {
    fname: req.body.fname,
    lname: req.body.lname,
  };
  const user = new User(userObj);
  await user.save();
  res.status(201).json(user);
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
    const updateUser = await User.findByIdAndUpdate(id, userBody, {new: true});
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
router.delete('/:id', async(req, res)=>{
  try {
    const id = req.params.id
    const deleteUser = await User.findByIdAndDelete(id)
    if (deleteUser){
      res.json({message: "User is deleted"})
    }else{
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
})

module.exports = router;
