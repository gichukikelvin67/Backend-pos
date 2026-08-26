const axios = require("axios");

// Convert Kenyan phone numbers to 254XXXXXXXXX
function normalizePhone(phone) {
  let cleaned = String(phone).trim().replace(/\s+/g, "");

  // +254712345678 -> 254712345678
  if (cleaned.startsWith("+254")) {
    cleaned = cleaned.substring(1);
  }

  // 0712345678 -> 254712345678
  // 0112345678 -> 254112345678
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    cleaned = "254" + cleaned.substring(1);
  }

  // Validate Kenyan mobile number
  if (!/^254[17]\d{8}$/.test(cleaned)) {
    throw new Error("Invalid Kenyan phone number");
  }

  return cleaned;
}

// Get Daraja access token
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return response.data.access_token;
}

// STK Push
async function stkPush(req, res) {
  try {
    const { phone, amount, orderId } = req.body;

    // Validate input
    if (!phone || !amount) {
      return res.status(400).json({
        message: "Phone number and amount are required",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number greater than 0",
      });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Daraja timestamp: YYYYMMDDHHmmss
    const now = new Date();

    const timestamp =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    // Generate password
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    // STK request data
    const stkRequest = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",

      Amount: Math.round(numericAmount),

      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,

      CallBackURL: process.env.MPESA_CALLBACK_URL,

      AccountReference: orderId || "POS-SALE",
      TransactionDesc: "M-Pesa POS Payment",
    };

    // Debug information
    // NEVER log your consumer secret or passkey.
    console.log("STK REQUEST:");
    console.log({
      BusinessShortCode: stkRequest.BusinessShortCode,
      Timestamp: stkRequest.Timestamp,
      Amount: stkRequest.Amount,
      PartyA: stkRequest.PartyA,
      PartyB: stkRequest.PartyB,
      PhoneNumber: stkRequest.PhoneNumber,
      CallBackURL: stkRequest.CallBackURL,
      AccountReference: stkRequest.AccountReference,
    });

    // Send STK Push to Daraja
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("STK Push response:", response.data);

    return res.status(200).json({
      message: "STK Push sent successfully",
      phone: normalizedPhone,
      ...response.data,
    });
  } catch (error) {
    console.error("STK Push error:");
    console.error("Status:", error.response?.status);
    console.error(
      "Data:",
      JSON.stringify(error.response?.data, null, 2)
    );
    console.error("Message:", error.message);

    return res.status(500).json({
      message:
        error.response?.data?.errorMessage ||
        error.response?.data?.error_description ||
        error.message ||
        "Failed to send M-Pesa payment request",
    });
  }
}

module.exports = {
  stkPush,
};