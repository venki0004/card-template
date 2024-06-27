"use strict";
const fs = require("fs");
const crypto = require('crypto');
const moment = require('moment');
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const token = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


function dashboardDateRange(dateRange) {
  let from;
  let to;
  let range;
  let days = [];

  switch (Number(dateRange)) {
      case 30:
        from = moment().subtract(29, "days").startOf("day").toDate()
        to=  moment().endOf("day").toDate()
        range = getDateRange(moment().subtract(29, "days").startOf("day"), moment().endOf("day"));
        break;
      case 7:
          from =  moment().subtract(6, "days").startOf("day").toDate()
          to=  moment().endOf("day").toDate()
          range = getDateRange(moment().subtract(6, "days").startOf("day"), moment().endOf("day"));
          break;
      case 1:
          from =  moment().startOf("day").toDate()
          to=  moment().endOf("day").toDate()
          range = getDateRange(moment().startOf("day"), moment().endOf("day"));
          break;
      default:
          days = moment.monthsShort().map((month, index) => ({ abbreviation: month, name: (index + 1).toString() }))
          from =  moment().subtract(356, 'days').startOf('day').toDate()
          to=  moment().endOf("day").toDate()
          range = getMonthsBetweenDates(moment().subtract(356, 'days').startOf('day').toDate(), moment().endOf("day").toDate());
          break;
  }

  return { days, range, from, to };
}
function getMonthsBetweenDates(startDate, endDate) {
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);
  const monthsArray = [];

  // Loop through each month
  while (startMoment.isBefore(endMoment) || startMoment.isSame(endMoment)) {
    monthsArray.push(startMoment.format('YYYY-MM-DD'));

    // Move to the next month
    startMoment.add(1, 'month').startOf('month');
  }

  return monthsArray;
}

function getDateRange(from, to) {
  function getDates(startDate, stopDate) {
    const dateArray = new Array()
    let currentDate = startDate
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
      currentDate = moment(currentDate).add('days', 1)
    }
    return dateArray
  }

  return getDates(from, to)
}

async function convertFileToBase64(filePath) {
  try {
    // Read file asynchronously
    const fileContent = await fs.promises.readFile(filePath);

    // Convert file content to base64
    const base64Content = fileContent.toString("base64");

    return base64Content;
  } catch (error) {
    throw new Error("Failed to convert file to base64");
  }
}

function verifySignature(timestamp, signature, secretKey) {
  const message = timestamp + secretKey;
  const expectedSignature = crypto.createHash('sha256').update(message).digest('hex');
  return signature === expectedSignature;
}

function getMimeType(filename) {
  const extension = filename.split('.').pop();
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    // Add more cases for other file types if needed
    default:
      return 'application/octet-stream'; // Default to binary data
  }
}

module.exports = {
  capitalize,
  token,
  convertFileToBase64,
  verifySignature,
  dashboardDateRange,
  getMimeType
};
