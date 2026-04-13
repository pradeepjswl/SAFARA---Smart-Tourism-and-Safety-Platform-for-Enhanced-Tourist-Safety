import { Request, Response } from 'express';
import * as svc from './chatbot.service.js';

export async function chat(req: Request, res: Response) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Invalid prompt provided" });
  }

  const userId = (req as any).userId as string;
  const reply = await svc.processChatMessage(userId, prompt);
  
  res.json({ reply });
}
