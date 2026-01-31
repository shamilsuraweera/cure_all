import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import inviteRoutes from "./modules/invites/invite.routes.js";
import patientRoutes from "./modules/patients/patient.routes.js";
import guardianRoutes from "./modules/guardians/guardian.routes.js";
import medicineRoutes from "./modules/medicines/medicine.routes.js";
import labRoutes from "./modules/labs/lab.routes.js";
import labCatalogRoutes from "./modules/labs/catalog.routes.js";
import dispenseRoutes from "./modules/pharmacy/dispense.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { sendSuccess } from "./utils/response.js";

const app = express();

const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

if (env.NODE_ENV === "production") {
  app.use("/auth/login", authLimiter);
  app.use("/auth/refresh", authLimiter);
  app.use("/invites/accept", inviteLimiter);
  app.use("/guardians/accept", inviteLimiter);
}

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/invites", inviteRoutes);
app.use("/patients", patientRoutes);
app.use(guardianRoutes);
app.use("/medicines", medicineRoutes);
app.use("/lab-results", labRoutes);
app.use("/lab-test-types", labCatalogRoutes);
app.use("/prescriptions", dispenseRoutes);

app.use(errorHandler);

app.get("/health", (_req, res) => {
  sendSuccess(res, 200, { status: "OK" });
});

app.get("/", (_req, res) => {
  sendSuccess(res, 200, { message: "Cure-All API running" });
});

export default app;
