import { Request, Response } from "express";

export const handleLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (password !== "P4loch4t") {
    return res.status(401).json({ error: "Invalid password" });
  }

  res.json({ success: true, username });
};