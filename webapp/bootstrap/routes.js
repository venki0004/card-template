"use strict";

const cors = require("cors");
const error = require("../app/middleware/error");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const express = require("express");
const VCardController = require("../app/controllers/VCardController");
const helmet = require("helmet");
const crypto = require("crypto");
const nonce = crypto.randomBytes(16).toString("base64");

module.exports = (app) => {
  app.disable('x-powered-by');
  app.set('etag',false); 
  app.use(
    cors({
      origin: "*",
      methods: ["GET"],
      credentials: true, // enable set cookie
    })
  );
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(bodyParser.json({ limit: "50mb" }));
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 10 mins
    max: 1000, // No of Requests
  });

  app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString("base64");
    res.locals.nonce = nonce;
    res.setHeader("Permissions-Policy", "geolocation=(), interest-cohort=()");
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'","'unsafe-inline'",(req, res) => `'nonce-${res.locals.nonce}'`],
          "script-src-attr": ["'self'","'unsafe-inline'"],
        },
      },
    })
  ); 
  app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), interest-cohort=()");
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
  app.use(helmet.xssFilter({ mode: 'block' }));
  app.use(limiter);
  app.use(express.static("public",{ etag: false }));
  app.get("/:id", VCardController.validate);
  app.get("/download/:id", VCardController.download);
  app.put("/log-event/:id", VCardController.logEvent);
  app.use(function (req, res, next) {
    res.status(404).send("The requested resource was not found.");
  });
  app.use(error);
};
