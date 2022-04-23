const Order = require("../models/Order");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./VerifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, (req, res) => {
  const newOrder = new Order(req.body);
  newOrder
    .save()
    .then((newOrder) => {
      res.status(200).json(newOrder);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, (req, res) => {
  Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then((updatedOrder) => {
      res.status(200).json(updatedOrder);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Delete
router.delete("/:id", verifyTokenAndAdmin, (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(200).json({
        message: "Order has been deleted...",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET USER ORDERS

router.get("/find/:userId", verifyTokenAndAuthorization, (req, res) => {
  Order.find({ userId: req.params.userId })
    .then((orders) => {
      res.status(200).json(orders);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
