import * as CryptoJS from 'crypto-js';
import forge from "node-forge";

const CLIENT_SECRET = 'HNHGGBHGHBHG7VVGVWH';
export const encryptData = (data:any) => {
  const encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), CLIENT_SECRET).toString();
  return encrypt.replaceAll('+', '-').replaceAll('/', '_');
};

export const decryptData = (data:any) => {
  if (data) {
    const decrypt = data.replaceAll('-', '+').replaceAll('_', '/');
    const bytes = CryptoJS.AES.decrypt(decrypt, CLIENT_SECRET);
    if (bytes.toString()) {
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
  }
  return data;
};

export const generateAESKey = async () => {
  const aesKey = forge.random.getBytesSync(16);
  const aesKeyHex = forge.util.bytesToHex(aesKey);
  return aesKeyHex;
};


export async function encryptAESKey(key: any, publicKey: string) {
  try {
    const publicKeyPem = forge.pki.publicKeyFromPem(publicKey);
    const encryptedData = publicKeyPem.encrypt(key, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
    const base64EncryptedData = forge.util.encode64(encryptedData);

    return base64EncryptedData;
  } catch (error) {
    console.error("Error generating AES key:", error);
  }
}

export const decryptAESKey = (encryptedKey: string,privateKey:string) => {
  const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
  const decryptedKey = privateKeyObj.decrypt(
    forge.util.decode64(encryptedKey),
    "RSA-OAEP"
  );
  return decryptedKey
}
export const decryptServerData = (encryptedData: any, decryptedKey: any) => {
  try {
    const [encData, ivHex, tagHex] = encryptedData.split("|");
    const keyBytes = forge.util.hexToBytes(decryptedKey);
    const ivBytes = forge.util.hexToBytes(ivHex);
    const tagBytes = forge.util.createBuffer(forge.util.hexToBytes(tagHex));
    const encryptedBytes = forge.util.hexToBytes(encData);
    const decipher = forge.cipher.createDecipher("AES-GCM", keyBytes);
    decipher.start({ iv: ivBytes, tag: tagBytes });
    decipher.update(forge.util.createBuffer(encryptedBytes));
    decipher.finish();

    // Get the decrypted data as a UTF-8 string
    const decryptedData = decipher.output.toString();
    return decryptedData;
  } catch (err) {
    console.log(err);
  }
};

export const encryptServerDataUsingKey = async (data: string,AESKey:string) => {
  const iv = forge.random.getBytesSync(12);
  const cipher = forge.cipher.createCipher("AES-GCM", AESKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(data, "utf8"));
  await cipher.finish();
  const encryptedData = cipher.output;
  const concatenatedString = `${forge.util.encode64(
    encryptedData.getBytes()
  )}|${forge.util.encode64(iv)}|${forge.util.encode64(
    cipher.mode.tag.getBytes()
  )}`;

  return concatenatedString
}