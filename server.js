const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Store in /data (Railway volume) if available, otherwise local file
const DATA_DIR = fs.existsSync("/data") ? "/data" : __dirname;
const STATE_FILE = path.join(DATA_DIR, "state.json");

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function writeState(value) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ value }), "utf8");
}

app.get("/api/state", (req, res) => {
  const state = readState();
  res.json(state || {});
});

app.post("/api/state", (req, res) => {
  const { value } = req.body;
  if (typeof value !== "string") return res.status(400).json({ error: "invalid" });
  writeState(value);
  res.json({ ok: true });
});

// Catch-all: serve index.html for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
