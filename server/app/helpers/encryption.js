const crypto = require("crypto");

const decryptClientData = async (
  serverPrivateKey,
  clientEncKey,
  encryptedData
) => {
  const decryptedAESKey = crypto.privateDecrypt(
    {
      key: serverPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(clientEncKey, "base64")
  );
  const [encryptedDataStr, ivStr, tagStr] = encryptedData.split("|");
  const ivBuffer = Buffer.from(ivStr, "base64");
  const encryptedDataBuffer = Buffer.from(encryptedDataStr, "base64");
  const tagBuffer = Buffer.from(tagStr, "base64");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    decryptedAESKey,
    ivBuffer
  );
  decipher.setAuthTag(tagBuffer);

  let decryptedData = decipher.update(encryptedDataBuffer, "binary", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};

const encryptKey = async (clientPublicKey, aesKey) => {
  const encryptedKey = crypto.publicEncrypt(
    {
      key: clientPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(aesKey)
  );
  return encryptedKey.toString("base64");
};

const encryptClientData = async (aesKey, data) => {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(aesKey, "hex"),
    iv
  );
  let encryptedServerData = cipher.update(data, "utf8", "hex");
  encryptedServerData += cipher.final("hex");
  let tag = cipher.getAuthTag();
  let encData = encryptedServerData + "|" + iv.toString("hex") + "|" + tag.toString("hex");
  return encData;
};

module.exports = { decryptClientData, encryptKey, encryptClientData };
