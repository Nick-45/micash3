const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

exports.handler = async (event) => {
try {
const { amount, paybill, account, token } = JSON.parse(event.body);


// ❌ Validation
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

// 🔐 Encrypt Initiator Password
const publicKey = fs.readFileSync("./cert.cer", "utf8");

const securityCredential = crypto
  .publicEncrypt(publicKey, Buffer.from(process.env.INITIATOR_PASSWORD))
  .toString("base64");

// 💸 B2B Request
const response = await axios.post(
  "https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest",
  {
    Initiator: process.env.INITIATOR_NAME,
    SecurityCredential: securityCredential,
    CommandID: "BusinessPayBill",
    Amount: amountKES,
    PartyA: process.env.SHORTCODE, // Your shortcode
    PartyB: paybill,               //  from frontend
    SenderIdentifierType: "4",
    ReceiverIdentifierType: "4",
    Remarks: "Medical Disbursement",
    AccountReference: account,     // 🔥 dynamic account
    QueueTimeOutURL: process.env.TIMEOUT_URL,
    ResultURL: process.env.RESULT_URL,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
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
```

} catch (error) {
return {
statusCode: 500,
body: JSON.stringify({
success: false,
error: error.response?.data || error.message,
}),
};
}
};
