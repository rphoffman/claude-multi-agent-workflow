const express = require("express");

const router = express.Router();

// GET /health — a simple liveness check.
router.get("/", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

module.exports = router;
