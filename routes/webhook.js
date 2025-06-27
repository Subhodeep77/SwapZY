const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Order } = require("../models/Order");
const { AdminAction } = require("../models/admin");

router.post("/razorpay", express.raw({ type: "*/*" }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const payload = JSON.parse(req.body);
  const event = payload.event;

  try {
    // Example: Refund successful
    if (event === "refund.processed") {
      const paymentId = payload.payload.payment.entity.id;
      const refund = payload.payload.refund.entity;

      const order = await Order.findOne({ "paymentInfo.paymentId": paymentId });

      if (order) {
        order.paymentInfo.status = "refunded";
        order.paymentInfo.refundedAt = new Date(refund.created_at * 1000);
        await order.save();

        // Log AdminAction
        await AdminAction.create({
          adminAppwriteId: "system",
          actionType: "REFUND_CONFIRMED_WEBHOOK",
          affectedId: order._id,
          description: `Refund confirmed by webhook for ₹${refund.amount / 100}`,
          metadata: refund,
        });
      }
    }

    // Add other events like payment.failed, order.paid, refund.failed, etc.
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Razorpay webhook error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

console.log(`Loaded webhook routes`);

module.exports = router;
