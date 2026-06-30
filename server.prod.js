import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const dist = path.join(__dirname, "dist");

app.use(express.static(dist, { maxAge: "1d" }));

app.get("*", (_req, res) => {
  res.sendFile(path.join(dist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Front-end running at http://localhost:${PORT}`);
});
