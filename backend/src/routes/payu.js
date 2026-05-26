const express = require("express");
const config = require("../config/env");
const {
  buildFrontendRedirectUrl,
  buildPaymentPayload,
  verifyResponseHash,
} = require("../utils/payu");
const {
  validatePaymentRequest,
} = require("../utils/validatePaymentRequest");

const router = express.Router();

router.post("/create-payment", (req, res) => {
  try {
    const validation = validatePaymentRequest(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const payment = buildPaymentPayload(validation.data);

    console.log("[PayU] FINAL PAYMENT URL:", payment.paymentUrl);

    return res.json({
      success: true,
      paymentUrl: payment.paymentUrl,
      fields: payment.fields,
      course: {
        name: payment.meta.courseName,
        amount: payment.meta.amount,
        mode: payment.meta.mode,
      },
    });
  } catch (error) {
    console.error("[PayU] Failed to generate payment payload:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate a secure PayU hash right now.",
    });
  }
});

const handlePayuRedirect = (fallbackStatus) => (req, res) => {
  try {
    const payuStatus =
      typeof req.body.status === "string" && req.body.status.trim()
        ? req.body.status.trim().toLowerCase()
        : fallbackStatus;

    const normalizedStatus = payuStatus === "success" ? "success" : "failure";
    const verification = verifyResponseHash(req.body);

    if (!verification.isValid) {
      console.warn(
        `PayU ${normalizedStatus} response hash verification failed for txn ${req.body.txnid || "unknown"}`
      );
      console.warn(
        "[PayU] Reverse hash string used for verification:",
        verification.reverseHashString
      );
      console.warn("[PayU] Expected response hash:", verification.expectedHash);
    }

    const redirectUrl = buildFrontendRedirectUrl({
      status: normalizedStatus,
      responseBody: req.body,
      verified: verification.isValid,
    });

    return res.redirect(303, redirectUrl);
  } catch (error) {
    console.error("[PayU] Failed to process callback redirect:", error);

    const fallbackRedirect = buildFrontendRedirectUrl({
      status: "failure",
      responseBody: {
        ...req.body,
        error: "Unable to verify PayU callback.",
      },
      verified: false,
    });

    return res.redirect(303, fallbackRedirect);
  }
};

router.post("/success", handlePayuRedirect("success"));
router.post("/failure", handlePayuRedirect("failure"));

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    payuMode: config.payuMode,
  });
});

module.exports = router;
