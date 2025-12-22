import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { sendOTP, verifyOTP } from "./routes/auth";
import { saveAPIKeys, getAPIKeys } from "./routes/settings";
import { handleChat } from "./routes/chat";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/send-otp", sendOTP);
  app.post("/api/auth/verify-otp", verifyOTP);

  // Settings routes
  app.post("/api/settings/save-keys", saveAPIKeys);
  app.get("/api/settings/keys", getAPIKeys);

  // Chat routes
  app.post("/api/chat", handleChat);

  return app;
}
