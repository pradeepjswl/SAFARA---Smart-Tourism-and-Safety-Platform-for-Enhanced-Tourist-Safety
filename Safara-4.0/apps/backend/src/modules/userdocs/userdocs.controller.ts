// apps/backend/src/modules/userdocs/userdocs.controller.ts

import type { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../../libs/prisma.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// expects CLOUDINARY_URL in env, e.g. cloudinary://key:secret@cloud_name
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL as string | undefined,
  
});

export const userDocsUploadMiddleware = upload.single("file");

function getUserId(req: Request): string | null {
  const headerId = req.headers["x-user-id"];
  if (typeof headerId === "string" && headerId.trim()) return headerId.trim();
  if (typeof req.query.userId === "string" && req.query.userId.trim()) {
    return (req.query.userId as string).trim();
  }
  if (typeof req.body.userId === "string" && req.body.userId.trim()) {
    return (req.body.userId as string).trim();
  }
  return null;
}

export async function uploadUserDoc(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "file is required" });

    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : file.originalname;

    const folder = "safara-user-docs";

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
      resource_type: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result as any);
        }
      );
      stream.end(file.buffer);
    });

    const doc = await prisma.userDoc.create({
      data: {
        userId,
        title,
        description:
          typeof req.body.description === "string"
            ? req.body.description
            : undefined,
        mime: file.mimetype,
        size: uploadResult.bytes,
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder,
      }
    });

    return res.status(201).json({
      id: doc.id,
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      mime: doc.mime,
      size: doc.size,
      secureUrl: doc.secureUrl,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "Failed to upload document" });
  }
}

export async function listUserDocs(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const docs = await prisma.userDoc.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      docs: docs.map((d: any) => ({
        id: String(d.id),
        userId: d.userId,
        title: d.title,
        description: d.description,
        mime: d.mime,
        size: d.size,
        secureUrl: d.secureUrl,
      })),
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "Failed to list documents" });
  }
}

export async function updateUserDoc(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const { id } = req.params;
    const doc = await prisma.userDoc.findFirst({ where: { id, userId } });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const updateData: any = {};
    if (typeof req.body.title === "string" && req.body.title.trim()) {
      updateData.title = req.body.title.trim();
    }
    if (typeof req.body.description === "string") {
      updateData.description = req.body.description;
    }

    const updatedDoc = await prisma.userDoc.update({
      where: { id: doc.id },
      data: updateData,
    });

    return res.json({
      id: updatedDoc.id,
      userId: updatedDoc.userId,
      title: updatedDoc.title,
      description: updatedDoc.description,
      mime: updatedDoc.mime,
      size: updatedDoc.size,
      secureUrl: updatedDoc.secureUrl,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "Failed to update document" });
  }
}

export async function deleteUserDoc(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const { id } = req.params;
    const doc = await prisma.userDoc.findFirst({ where: { id, userId } });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (doc.publicId) {
      try {
        await cloudinary.uploader.destroy(doc.publicId, {
          resource_type: "auto",
        });
      } catch {
        // ignore cloudinary errors, still delete DB record
      }
    }

    await prisma.userDoc.delete({ where: { id: doc.id } });
    return res.json({ ok: true });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "Failed to delete document" });
  }
}
