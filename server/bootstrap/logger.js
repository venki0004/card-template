const winston = require("winston");
const { errors } = winston.format;
const moment = require("moment");
const os = require("os");
const process = require("process");
const  DailyRotateFile  = require("winston-daily-rotate-file");
const MASKED_KEYS = [
  "authorization",
  "password",
  "blood_group",
  "primary_phone",
  "whatsapp_number",
  "image_base64",
  "user_secret"
];

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const networkInterfaces = os.networkInterfaces();

const hostIp = () => {
  let hostIpAddress = "";
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Check if the interface is IPv4 and not internal or loopback
      if (
        iface.family === "IPv4" &&
        !iface.internal &&
        iface.address !== "127.0.0.1"
      ) {
        hostIpAddress = iface.address;
        break;
      }
    }
    if (hostIpAddress) {
      break;
    }
  }
  return hostIpAddress;
};
const level = () => {
  return "debug";
};

const timeZoned = () => {
  return moment().local().format("YYYY-MMM-DD HH:mm:ss:SSS");
};

const maskSensitiveData = (data) => {
  return JSON.stringify(data, (key, value) => {
    if (MASKED_KEYS.includes(key.toLowerCase())) {
      return "[MASKED]";
    }
    return value;
  });
};

const format_string = winston.format.combine(
  winston.format.timestamp({ format: timeZoned }),
  winston.format.printf((info) => {
    const maskedRequest = maskSensitiveData(info.body);
    const maskedHeaders = maskSensitiveData(info.headers);
    if(info.level === 'error') return 
    return `--------${info.timestamp} ${info.message} ${process.pid} ${
      info.level
    }----:
          Datetime: ${info.timestamp}
          Request ID: ${info.requestId}
          Request Payload (masked):${maskedRequest}
          Request Origin IP: ${info.headers['sourceip'] || info.ip}
          Request Method: ${info.method}
          Headers: ${JSON.stringify(maskedHeaders)}
          Request Path: ${info.url}
          Request ContentLength: ${info.content_length}
          StatusCode: ${info.status}
          Response Time: ${info.response_time}
        `;
  })
);

const format_error_string = winston.format.combine(
  errors({ stack: true }),
  winston.format.timestamp({ format: timeZoned }),
  winston.format.printf((info, message) => {
    const errorDetails = {
      Datetime: info.timestamp,
      ErrorType: info.error_type,
      ErrorCode: info.error_code,
      ActualError: info.message,
      SourceIp: info.source_ip,
      UserId: info.user_id,
      RequestId: info.request_id,
      DestinationIp: hostIp(),
    };
    return JSON.stringify(errorDetails);
  })
);

const options = {
  error_logfile: {
    filename: "logs/error.log",
    level: "error",
    format: format_error_string,
    handleExceptions: true,
    maxFiles: "185d",
  },
  all_logfile: {
    filename: "logs/all.log",
    format: format_string,
    maxFiles: "185d",
  },
};

const transports = [
  new DailyRotateFile(options.error_logfile), 
  new DailyRotateFile(options.all_logfile), 
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

module.exports = Logger;