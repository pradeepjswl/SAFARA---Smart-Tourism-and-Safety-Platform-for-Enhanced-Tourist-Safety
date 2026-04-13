// apps/backend/src/modules/userdocs/userdocs.routes.ts

import Router from "express";
import {asyncHandler} from "../../utils/asyncHandler.js";
import {
  userDocsUploadMiddleware,
  uploadUserDoc,
  listUserDocs,
  updateUserDoc,
  deleteUserDoc,
} from "./userdocs.controller.js";

export const router = Router();

// POST /api/v1/docs  (field: file, body: { title?, description? }, user via x-user-id or userId)
router.post(
  "/",
  userDocsUploadMiddleware,
  asyncHandler(uploadUserDoc)
);

// GET /api/v1/docs?userId=...
router.get("/", asyncHandler(listUserDocs));

// PUT /api/v1/docs/:id
router.put("/:id", asyncHandler(updateUserDoc));

// DELETE /api/v1/docs/:id
router.delete("/:id", asyncHandler(deleteUserDoc));
