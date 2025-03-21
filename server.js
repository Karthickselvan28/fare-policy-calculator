import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something broke!" });
});

// Ensure data directory exists
const dataDir = path.join(__dirname, "src", "data");
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("Created data directory:", dataDir);
  } else {
    console.log("Data directory exists:", dataDir);
  }
} catch (error) {
  console.error("Error creating data directory:", error);
  process.exit(1);
}

// Ensure policies.json exists
const policiesPath = path.join(dataDir, "policies.json");
try {
  if (!fs.existsSync(policiesPath)) {
    fs.writeFileSync(
      policiesPath,
      JSON.stringify({ policies: [] }, null, 2),
      "utf8"
    );
    console.log("Created policies file:", policiesPath);
  } else {
    console.log("Policies file exists:", policiesPath);
  }
} catch (error) {
  console.error("Error creating policies file:", error);
  process.exit(1);
}

// Get all policies
app.get("/api/policies", (req, res) => {
  try {
    console.log("Reading policies from file:", policiesPath);
    const data = fs.readFileSync(policiesPath, "utf8");
    const parsedData = JSON.parse(data);
    console.log("Policies read successfully:", data);
    // Handle both array and object with policies property
    const policies = Array.isArray(parsedData)
      ? parsedData
      : parsedData.policies || [];
    res.json(policies);
  } catch (error) {
    console.error("Error reading policies:", error);
    res.status(500).json({ error: "Failed to read policies" });
  }
});

// Save policies
app.post("/api/policies", (req, res) => {
  try {
    console.log("Writing policies to file:", policiesPath);
    console.log("Policies to save:", JSON.stringify(req.body, null, 2));

    // Ensure the data is valid JSON
    const policies = JSON.parse(JSON.stringify(req.body));
    if (!Array.isArray(policies)) {
      throw new Error("Invalid policies data: must be an array");
    }

    // Write to a temporary file first
    const tempPath = policiesPath + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify({ policies }, null, 2), "utf8");
    console.log("Policies written to temporary file");

    // Verify the temporary file
    const tempData = fs.readFileSync(tempPath, "utf8");
    JSON.parse(tempData); // This will throw if the JSON is invalid
    console.log("Temporary file verified");

    // Rename the temporary file to the actual file
    fs.renameSync(tempPath, policiesPath);
    console.log("Temporary file renamed to actual file");

    // Verify the final file
    const finalData = fs.readFileSync(policiesPath, "utf8");
    console.log("Final file verified:", finalData);

    res.json({ success: true });
  } catch (error) {
    console.error("Error writing policies:", error);
    res.status(500).json({ error: "Failed to save policies" });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Data directory:", dataDir);
  console.log("Policies file:", policiesPath);
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.log(
      `Port ${PORT} is already in use. Trying to use a different port...`
    );
    server.close();
    process.exit(1);
  }
});

// Handle process termination
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle process interruption
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Keep the process alive
process.stdin.resume();

// Prevent the process from exiting
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
