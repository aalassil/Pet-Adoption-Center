const express = require("express");
const cookieParser = require("cookie-parser");
const moment = require("moment-timezone");

const app = express();
const port = 3001;

// Middleware
app.use(cookieParser());

// Route handling
app.get("/", (req, res) => {
  let visits = req.cookies ? parseInt(req.cookies.visits) || 0 : 0;
  visits++;

  let message;
  if (visits === 1) {
    message = "Welcome to my webpage! It is your first time that you are here.";
  } else {
    let lastVisitTime = req.cookies.lastVisitTime
      ? moment(req.cookies.lastVisitTime)
          .tz("America/New_York")
          .format("ddd MMM DD HH:mm:ss z YYYY")
      : "";
    message = `Hello, this is the ${visits} time that you are visiting my webpage. Last time you visited my webpage on: ${lastVisitTime}`;
  }

  // Set cookie for current visit
  res.cookie("visits", visits, { maxAge: 900000, httpOnly: true });
  res.cookie("lastVisitTime", new Date(), { maxAge: 900000, httpOnly: true });

  res.send(message);
  res.end();
  // Part A
  function findSummation(N = 1) {
    // Check if N is a positive integer
    if (typeof N !== "number" || N <= 0 || !Number.isInteger(N)) {
      return false;
    }

    // Calculate summation from 1 to N
    let summation = (N * (N + 1)) / 2;
    return summation;
  }

  // Part B
  function uppercaseFirstandLast(str) {
    // Split string into words, capitalize first and last letters, then join
    return str.replace(
      /\b(\w)(\w*)(\w)\b/g,
      function (match, first, middle, last) {
        return first.toUpperCase() + middle.toLowerCase() + last.toUpperCase();
      }
    );
  }

  // Part C
  function findAverageAndMedian(numbers) {
    // Calculate average
    let sum = numbers.reduce((acc, val) => acc + val, 0);
    let average = sum / numbers.length;

    // Calculate median
    numbers.sort((a, b) => a - b);
    let median;
    if (numbers.length % 2 === 0) {
      median =
        (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2;
    } else {
      median = numbers[Math.floor(numbers.length / 2)];
    }

    return { average, median };
  }

  // Part D
  function find4Digits(str) {
    // Split string by spaces and find the first four-digit number
    let numbers = str.split(" ").map(Number);
    let fourDigitNumber = numbers.find((num) => num >= 1000 && num <= 9999);

    return fourDigitNumber || false;
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
