const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { amount, paybill, account, token } = JSON.parse(event.body);

    // ✅ Validation
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Access token is required" }),
      };
    }

    if (!amount || !paybill || !account) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // 💱 Convert USD → KES
    const amountKES = Math.round(amount * 129);

    // 💸 B2B Request with required identifier fields
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest",
      {
        Initiator: process.env.INITIATOR_NAME,
        SecurityCredential: process.env.INITIATOR_PASSWORD,
        CommandID: "BusinessPayBill",
        Amount: amountKES,
        PartyA: process.env.SHORTCODE,
        PartyB: paybill,
        SenderIdentifierType: 4,      // Required - Your shortcode type
        ReceiverIdentifierType: 4,    // Required - Paybill type
        Remarks: "Medical Disbursement",
        AccountReference: account,
        QueueTimeOutURL: process.env.TIMEOUT_URL,
        ResultURL: process.env.RESULT_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: response.data,
      }),
    };

  } catch (error) {
    console.error("B2B Error:", error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.response?.data || error.message,
      }),
    };
  }
};
