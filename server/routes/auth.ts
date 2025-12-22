import { RequestHandler } from "express";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

// In-memory store for OTP (in production, use a database with TTL)
const otpStore: Map<string, { code: string; timestamp: number }> = new Map();
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isOTPValid(phone: string, code: string): boolean {
  const storedOTP = otpStore.get(phone);
  if (!storedOTP) return false;

  const now = Date.now();
  if (now - storedOTP.timestamp > OTP_EXPIRY) {
    otpStore.delete(phone);
    return false;
  }

  return storedOTP.code === code;
}

export const sendOTP: RequestHandler = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      res.status(500).json({ error: "Twilio credentials not configured" });
      return;
    }

    const otp = generateOTP();
    otpStore.set(phone, { code: otp, timestamp: Date.now() });

    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: `Your AI Chat Hub verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhoneNumber,
      to: phone,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOTP: RequestHandler = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      res.status(400).json({ error: "Phone and code are required" });
      return;
    }

    if (isOTPValid(phone, code)) {
      otpStore.delete(phone);
      res.json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};
