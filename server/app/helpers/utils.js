const crypto = require("crypto");

function getClientId(req) {
  return crypto
    .createHash("sha256")
    .update(
      (req.headers["sourceip"] || req.ip) +
        (req.headers["useragentsource"] || req.headers["user-agent"])
    )
    .digest("hex");
}

function getCsrfTokenId(req) {
  return crypto
    .createHash("sha256")
    .update(
      (req.headers["sourceip"] || req.ip) +
        (req.headers["useragentsource"] || req.headers["user-agent"]) +
        "CSRF_TOKEN"
    )
    .digest("hex");
}

function getSessionId(req) {
  return crypto
    .createHash("sha256")
    .update(
      (req.headers["sourceip"] || req.ip) +
        (req.headers["useragentsource"] || req.headers["user-agent"]) +
        "SESSION_ID"
    )
    .digest("hex");
}

function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  getClientId,
  getCsrfTokenId,
  getSessionId,
  generateCsrfToken,
};
