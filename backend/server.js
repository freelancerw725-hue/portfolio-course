require("dotenv").config();
const Razorpay = require("razorpay");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: 199 * 100, // paisa me amount
      currency: "INR",
      receipt: "receipt_order_1",
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
