const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./VerifyToken");

const router = require("express").Router();

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, (req, res) => {
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        req.body.password = hash;
      }
    });
  }
  User.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Delete
router.delete("/:id", verifyTokenAndAuthorization, (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json({
        message: "User has been deleted...",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      const { password, ...others } = user._doc;
      res.status(200).json(others);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET ALL USER

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users =
      query === "true"
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// GET USER STATE

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      {
        $match: { createdAt: { $gte: lastYear } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
