const express = require("express");
const crypto = require("crypto");
const { Order } = require("../models/Order");
const { AdminAction } = require("../models/Admin");

const router = express.Router();

router.post("/razorpay", express.raw({ type: "*/*" }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const payload = JSON.parse(req.body);
  const event = payload.event;

  try {
    const io = req.app.get("io"); // ⬅️ Access Socket.IO instance

    switch (event) {
      case "payment.captured": {
        const payment = payload.payload.payment.entity;
        const order = await Order.findOne({ "paymentInfo.paymentId": payment.id });

        if (order && order.paymentInfo.status !== "paid") {
          order.paymentInfo.status = "paid";
          order.paymentInfo.paidAt = new Date(payment.created_at * 1000);
          await order.save();

          await AdminAction.create({
            adminAppwriteId: "system",
            actionType: "PAYMENT_CONFIRMED_WEBHOOK",
            affectedId: order._id,
            description: `Payment confirmed via webhook (₹${payment.amount / 100})`,
            metadata: payment,
          });

          // ✅ Emit paymentCaptured event
          io.to(order.buyerId).emit("order:paymentCaptured", order);
          io.to(order.sellerId).emit("order:paymentCaptured", order);
        }
        break;
      }

      case "refund.processed": {
        const refund = payload.payload.refund.entity;
        const paymentId = refund.payment_id;
        const order = await Order.findOne({ "paymentInfo.paymentId": paymentId });

        if (order) {
          order.paymentInfo.status = "refunded";
          order.paymentInfo.refundedAt = new Date(refund.created_at * 1000);
          await order.save();

          await AdminAction.create({
            adminAppwriteId: "system",
            actionType: "REFUND_CONFIRMED_WEBHOOK",
            affectedId: order._id,
            description: `Refund confirmed via webhook (₹${refund.amount / 100})`,
            metadata: refund,
          });

          // Optional: Emit if needed
          io.to(order.buyerId).emit("order:refunded", order);
        }
        break;
      }

      case "refund.failed": {
        const refund = payload.payload.refund.entity;
        const paymentId = refund.payment_id;
        const order = await Order.findOne({ "paymentInfo.paymentId": paymentId });

        if (order) {
          order.paymentInfo.status = "refund_failed";
          await order.save();

          await AdminAction.create({
            adminAppwriteId: "system",
            actionType: "REFUND_FAILED_WEBHOOK",
            affectedId: order._id,
            description: `Refund failed via webhook for Order ${order._id}`,
            metadata: refund,
          });

          // ✅ Emit refundFailed event
          io.to(order.buyerId).emit("order:refundFailed", {
            orderId: order._id,
            reason: refund.notes?.reason || "Refund failed",
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payload.payment.entity;
        const order = await Order.findOne({ "paymentInfo.orderId": payment.order_id });

        if (order) {
          order.paymentInfo.status = "failed";
          await order.save();

          await AdminAction.create({
            adminAppwriteId: "system",
            actionType: "PAYMENT_FAILED_WEBHOOK",
            affectedId: order._id,
            description: `Payment failed via webhook for Order ${order._id}`,
            metadata: payment,
          });

          // Optional: Emit if needed
          io.to(order.buyerId).emit("order:paymentFailed", order);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Razorpay event: ${event}`);
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Razorpay webhook processing error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

module.exports = router;
