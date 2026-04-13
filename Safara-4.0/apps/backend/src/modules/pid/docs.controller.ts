import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../libs/prisma.js';
import { encryptBuffer } from '../../utils/crypto.js';
import { verifyAadhaarDocument } from './pid.service.js';
import { STORAGE_DIR } from '../../config/storage.js'; // <-- use shared

export async function uploadAadhaar(req: Request, res: Response) {
  const { applicationId } = req.body as { applicationId?: string };
  if (!applicationId) return res.status(400).json({ error: 'applicationId is required' });
  if (!req.file) return res.status(400).json({ error: 'file is required' });

  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Only PDF, JPG, PNG allowed' });
  }

  const app = await prisma.personalIdApplication.findUnique({
    where: { id: applicationId }
  });
  if (!app) return res.status(404).json({ error: 'Application not found' });

  await fs.mkdir(STORAGE_DIR, { recursive: true });

  // Encrypt in memory
  const { enc, iv, tag } = encryptBuffer(req.file.buffer);

  // Write ciphertext with unique filename
  const filename = `${applicationId}-${Date.now()}.bin`;
  const filepath = path.join(STORAGE_DIR, filename);
  await fs.writeFile(filepath, enc);

  // Note: Prisma schema does not store Aadhaar doc details directly right now
  // We can just mark as uploaded for mock purposes
  await prisma.personalIdApplication.update({
    where: { id: applicationId },
    data: {
      documentVerified: true,
      status: "MANUAL_REVIEW"
    }
  });

  return res.status(201).json({
    applicationId,
    uploaded: true,
    mime: req.file.mimetype,
    size: req.file.size,
    status: app.status
  });
}

export async function verifyAadhaar(req: Request, res: Response) {
  const { applicationId } = req.body as { applicationId?: string };
  if (!applicationId) return res.status(400).json({ error: 'applicationId is required' });
  const result = await verifyAadhaarDocument(applicationId);
  res.json(result);
}

