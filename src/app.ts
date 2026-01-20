import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.get("/", (_req, res) => {
  res.json({ message: "Cure-All API running" });
});

export default app;
