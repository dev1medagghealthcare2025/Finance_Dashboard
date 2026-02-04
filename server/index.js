import express from "express";
import cors from "cors";
import { config as loadEnv } from "dotenv";

import { connectMongo } from "./mongo.js";
import { requireJwtUser } from "./middleware/requireJwtUser.js";
import { hospitalsRouter } from "./routes/hospitals.js";
import { patientsRouter } from "./routes/patients.js";
import { invoicesRouter } from "./routes/invoices.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";

loadEnv({ path: new URL("../.env", import.meta.url) });

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Public auth routes
app.use("/api/auth", authRouter);

// All other API routes require a valid JWT
app.use("/api", requireJwtUser);

app.use("/api/hospitals", hospitalsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/admin", adminRouter);

const port = Number(process.env.API_PORT || 3001);

await connectMongo();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
