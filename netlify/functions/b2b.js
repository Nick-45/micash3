const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

exports.handler = async (event) => {
  try {
    const { amount, shortcode, reference, accessToken } = JSON.parse(event.body);

    // ❌ Validate required fields
    if (!accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Access token is required" }),
      };
    }

    if (!amount || !shortcode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // 🔐 Encrypt Initiator Password
    const publicKey = fs.readFileSync("./cert.cer", "utf8");

    const securityCredential = crypto
      .publicEncrypt(publicKey, Buffer.from(process.env.INITIATOR_PASSWORD))
      .toString("base64");

    // 💸 Send B2B Request
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest",
      {
        Initiator: process.env.INITIATOR_NAME,
        SecurityCredential: securityCredential,
        CommandID: "BusinessPayBill",
        Amount: amount,
        PartyA: process.env.SHORTCODE,
        PartyB: shortcode,
        SenderIdentifierType: "4",
        ReceiverIdentifierType: "4",
        Remarks: "Payment",
        AccountReference: reference || "B2B Payment",
        QueueTimeOutURL: process.env.TIMEOUT_URL,
        ResultURL: process.env.RESULT_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ✅ from frontend
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.response?.data || error.message,
      }),
    };
  }
};
