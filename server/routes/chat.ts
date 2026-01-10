import { Request, Response } from "express";
import { Client } from "ssh2";

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { messages, provider, model, apiKey, sshConfig } = req.body;
    const lastMessage = messages[messages.length - 1]?.content;

    if (!lastMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Handle Vulnerable Agent via SSH
    if (model === "vulnerable-agent" && sshConfig) {
      const conn = new Client();
      let responseData = "";

      conn.on("ready", () => {
        // Execute the prompt as a command on the remote server
        conn.exec(lastMessage, (err, stream) => {
          if (err) {
            conn.end();
            return res.status(500).json({ error: "SSH Execution Error: " + err.message });
          }
          
          stream.on("close", (code: any, signal: any) => {
            conn.end();
            res.json({ message: responseData || "Command executed (no output).", provider: "vulnerable-agent" });
          }).on("data", (data: any) => {
            responseData += data.toString();
          }).stderr.on("data", (data: any) => {
            responseData += data.toString();
          });
        });
      }).on("error", (err) => {
        console.error("SSH Connection Error:", err);
        res.status(500).json({ error: "SSH Connection Error: " + err.message });
      }).connect({
        host: sshConfig.host,
        port: 22,
        username: sshConfig.username,
        privateKey: sshConfig.privateKey,
        readyTimeout: 20000, // 20 seconds timeout
      });
      return;
    }

    res.status(501).json({ error: "Provider not implemented in this backend handler" });

  } catch (error) {
    console.error("Chat handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};