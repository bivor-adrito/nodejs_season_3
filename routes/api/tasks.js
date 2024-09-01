const express = require("express");
const router = express.Router();
const Task = require("../../models/Task");
const authenticateToken = require("../../middleware/auth");

//? Create a new Task
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const taskObj = {
      title: req.body.title,
      description: req.body.description ?? "",
      status: "to-do",
      userId: userId,
    };
    const task = new Task(taskObj);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//? Get One of my task
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const task = await Task.findOne({ _id: taskId, userId: userId })
      .populate("userId")
      .exec();
    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
