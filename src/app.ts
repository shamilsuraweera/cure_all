import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import inviteRoutes from "./modules/invites/invite.routes.js";
import patientRoutes from "./modules/patients/patient.routes.js";
import guardianRoutes from "./modules/guardians/guardian.routes.js";
import medicineRoutes from "./modules/medicines/medicine.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/invites", inviteRoutes);
app.use("/patients", patientRoutes);
app.use(guardianRoutes);
app.use("/medicines", medicineRoutes);

app.use(errorHandler);

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.get("/", (_req, res) => {
  res.json({ message: "Cure-All API running" });
});

export default app;
