const express = require("express");
const router = express.Router();
const Task = require("../../models/Task");
const authenticateToken = require("../../middleware/auth");
const { default: mongoose } = require("mongoose");

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

//? Get All my tasks
router.get("/", authenticateToken, async (req, res) => {
  try {
    let userId = req.user._id;
    userId = new mongoose.Types.ObjectId(userId)

    let current = req?.query?.current ?? "1";
    current = parseInt(current);
    let pageSize = req?.query?.pageSize ?? "10";
    pageSize = parseInt(pageSize);
    let title = req?.query?.title ?? "";
    let status = req?.query?.status ?? "";
    let sort = req?.query?.sort ?? "asc";

    const pipeline = [];

    pipeline.push({
      $match: {
        userId: userId
      },
    });
    //? filter by title
    if (title != "") {
      pipeline.push({
        $match: {
          title: title,
        },
      });
    }
    //? filter by status
    if (status != "") {
      pipeline.push({
        $match: {
          status: status,
        },
      });
    }

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

    pipeline.push({
      $skip: (current - 1) * pageSize,
    });
    pipeline.push({
      $limit: pageSize * 1,
    });

    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
        }
    })
    const tasks = await Task.aggregate(pipeline);
    res.json(tasks);
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
