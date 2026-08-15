const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const STORE_PATH = path.join(DATA_DIR, "seen_jobs.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({}), "utf-8");
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function hasBeenSeen(jobId) {
  const store = readStore();
  return Object.prototype.hasOwnProperty.call(store, jobId);
}

function markAsSeen({ jobId, title, company, score }) {
  const store = readStore();
  if (!store[jobId]) {
    store[jobId] = {
      title,
      company,
      score,
      notified_at: new Date().toISOString(),
    };
    writeStore(store);
  }
}

module.exports = { hasBeenSeen, markAsSeen };
