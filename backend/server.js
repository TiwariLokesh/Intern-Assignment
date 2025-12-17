import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

// simple root response for platform health checks
app.get("/", (req, res) => {
  res.send("Badminton booking API up. Try /api/health.");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Badminton booking API running on port ${PORT}`);
});
