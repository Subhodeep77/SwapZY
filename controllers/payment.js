const razorpay = require("../utils/razorpayInstance");
const crypto = require("crypto");
const { Order, OrderActivityLog } = require("../models/Order");

// 1️⃣ INITIATE PAYMENT
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "ACCEPTED")
      return res.status(400).json({ error: "Order not accepted yet" });
    if (!order.amount || order.amount <= 0)
      return res.status(400).json({ error: "Invalid order amount" });

    const razorpayOrder = await razorpay.orders.create({
      amount: order.amount * 100,
      currency: "INR",
      receipt: `receipt_${orderId}`,
    });

    await Order.findByIdAndUpdate(orderId, {
      $set: {
        "paymentInfo.amount": order.amount,
        "paymentInfo.orderId": razorpayOrder.id,
        "paymentInfo.status": "pending",
        "paymentInfo.currency": razorpayOrder.currency,
      },
    });

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      key: `${process.env.RAZORPAY_KEY_ID}`,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error("❌ Error initiating payment:", err);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment signature mismatch" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          "paymentInfo.paymentId": razorpay_payment_id,
          "paymentInfo.signature": razorpay_signature,
          "paymentInfo.status": "paid",
          "paymentInfo.paidAt": new Date(),
          "paymentInfo.verified": true,
        },
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    const io = req.app.get("io");
    io.to(order.buyerId).emit("order:paid", order);
    io.to(order.sellerId).emit("order:paid", order);

    await OrderActivityLog.create({
      orderId,
      actorId: order.buyerId,
      action: "PAYMENT_VERIFIED",
      remarks: `Payment ID: ${razorpay_payment_id}`,
    });

    res.status(200).json({
      success: true,
      message: "Payment verified",
      order,
      paidAt: order.paymentInfo.paidAt,
    });
  } catch (err) {
    console.error("❌ Payment verification failed:", err);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const paymentInfo = order.paymentInfo || {};

    res.status(200).json({
      success: true,
      orderId: order._id,
      status: paymentInfo.status || "pending",
      paidAt: paymentInfo.paidAt,
      refundedAt: paymentInfo.refundedAt,
      refundReason: paymentInfo.refundReason,
      paymentId: paymentInfo.paymentId,
    });
  } catch (err) {
    console.error("❌ Get payment status error:", err.message);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
};
