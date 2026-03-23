import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { BlobServiceClient } from "@azure/storage-blob"; // ✅ ADD THIS

const app = express();
const PORT = process.env.PORT || 3000;

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build
app.use(express.static(path.join(__dirname, "build")));

// API endpoint
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from backend!" });
});


// ✅ ADD THIS NEW ROUTE
app.get("/upload", async (req, res) => {
  try {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connStr) {
      return res.status(500).send("Missing connection string");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

    const containerClient = blobServiceClient.getContainerClient("uploads");

    const content = "Hello from Azure!";
    const blobName = `file-${Date.now()}.txt`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(content, content.length);

    res.json({
      message: "Upload successful",
      file: blobName
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});


// Catch-all route for React frontend
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
