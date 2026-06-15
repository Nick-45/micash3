const crypto = require("crypto");
const fs = require("fs");

exports.generateSecurityCredential = (password) => {
  const publicKey = fs.readFileSync("cert.cer", "utf8");

  const buffer = Buffer.from(password);

  const encrypted = crypto.publicEncrypt(publicKey, buffer);

  return encrypted.toString("base64");
};
