require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for URLs and short URL counter
const urlDatabase = {};
let shortUrlCounter = 1;

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// API endpoint for posting a new URL
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Validate the URL format
  try {
    new URL(originalUrl);
  } catch (error) {
    return res.json({ error: "invalid url" });
  }

  // Check if the domain is valid using dns.lookup
  const urlObject = new URL(originalUrl);
  dns.lookup(urlObject.hostname, (err, address) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Generate a short URL and store in the database
    const shortUrl = shortUrlCounter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// API endpoint for redirecting to the original URL
app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "short url not found" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
