// apps/backend/src/modules/pid/pid.service.ts
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { randomUUID } from 'crypto';
import { decryptBuffer } from '../../utils/crypto.js';
import { verhoeffValid } from '../../utils/verhoeff.js';
import { sha256Hex } from '../../utils/hash.js';

import { prisma } from '../../libs/prisma.js';
import type { RegisterInput } from './pid.schema.js';
import { getFirebaseAdmin } from '../../libs/firebaseAdmin.js';
import { STORAGE_DIR } from '../../config/storage.js';

// Step 1: Create or reuse a pending Personal ID application
export async function registerBasic(input: RegisterInput) {
  // Prevent duplicate active applications for the same mobile/email
  const existing = await prisma.personalIdApplication.findFirst({
    where: {
      mobile: input.mobile,
      email: input.email,
      status: { in: ['PENDING_VERIFICATION', 'MANUAL_REVIEW', 'VERIFIED'] },
    }
  });

  if (existing) {
    return {
      applicationId: String(existing.id),
      status: existing.status.toLowerCase(),
    };
  }

  const rec = await prisma.personalIdApplication.create({
    data: {
      fullName: input.fullName,
      mobile: input.mobile.startsWith('+') ? input.mobile : `+91${input.mobile}`,
      email: input.email,
      mobileVerified: false,
      emailVerified: false,
      documentVerified: false,
      status: 'PENDING_VERIFICATION',
    }
  });

  return {
    applicationId: String(rec.id),
    status: rec.status.toLowerCase()
  };
}

// Step 2: Verify mobile via Firebase ID token and mark mobileVerified = true
// export async function verifyEmailWithFirebase(applicationId: string, idToken: string) {
//   const admin = getFirebaseAdmin();
//   const decoded = await admin.auth().verifyIdToken(idToken, true);
//   const emailFromToken = decoded.email;
//   const emailVerified = decoded.email_verified === true;

//   if (!emailFromToken || !emailVerified) {
//     throw Object.assign(new Error('Email not verified in token'), { status: 400 });
//   }

//   const app = await PersonalIdApplication.findById(applicationId);
//   if (!app) throw Object.assign(new Error('Application not found'), { status: 404 });

//   if (String(app.email).toLowerCase() !== String(emailFromToken).toLowerCase()) {
//     throw Object.assign(new Error('Email mismatch'), { status: 400 });
//   }

//   if (!app.emailVerified) {
//     app.emailVerified = true;
//     await app.save();
//   }

//   return {
//     applicationId: String(app._id),
//     emailVerified: app.emailVerified,
//     status: app.status
//   };
// }


// const STORAGE_DIR = process.env.FILE_STORAGE_DIR || path.resolve(process.cwd(), 'secure_storage');

function normalizeName(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}
const NAME_STOPWORDS = new Set([
  'GOVERNMENT OF INDIA',
  'UNIQUE IDENTIFICATION AUTHORITY OF INDIA',
  'AADHAAR',
  'Aadhar',
  'AADHAR',
  'DOB',
  'D.O.B',
  'YEAR OF BIRTH',
  'ENROLMENT',
  'VID',
  'MALE',
  'FEMALE',
  'TRANSGENDER',
]);
function jaroWinkler(a: string, b: string) {
  // tiny jw impl for robustness
  if (!a || !b) return 0;
  const m = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  let matches = 0, transpositions = 0;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - m);
    const end = Math.min(i + m + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  const jaro = (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
  let l = 0;
  while (l < 4 && a[l] && b[l] && a[l] === b[l]) l++;
  return jaro + l * 0.1 * (1 - jaro);
}

function tokenOverlap(a: string, b: string) {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach(t => { if (B.has(t)) inter++; });
  return inter / Math.max(A.size, B.size);
}

function cleanOcrDigits(s: string) {
  return s
    .replace(/[O]/g, '0')
    .replace(/[IIl]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/Z/g, '2');
}

function extractDob(text: string) {
  // dd/mm/yyyy or dd-mm-yyyy or Year of Birth: yyyy
  const dob = text.match(/\b(\d{2})[\/-](\d{2})[\/-](\d{4})\b/);
  if (dob) {
    const [_, dd, mm, yyyy] = dob;
    return `${yyyy}-${mm}-${dd}`;
  }
  const yob = text.match(/YEAR OF BIRTH[:\s]*([12]\d{3})/i);
  if (yob) return `${yob[1]}-01-01`;
  return null;
}

function extractAadhaar(text: string) {
  // accept 4 4 4 grouped or contiguous 12 digits, ignoring non-digits
  const spaced = text.match(/(\d{4}\s*\d{4}\s*\d{4})/);
  if (spaced) return spaced[1].replace(/\s+/g, '');
  const digitsOnly = text.replace(/\D+/g, '');
  const m = digitsOnly.match(/(\d{12})/);
  return m ? m[1] : null;
}


// function extractNameHeuristic(text: string) {
//   const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
//   const cleaned = lines
//     .map(l => l.replace(/[^A-Za-z\s]/g, ' ').replace(/\s+/g, ' ').trim())
//     .filter(l => l.length >= 3)
//     .filter(l => !NAME_STOPWORDS.has(l.toUpperCase()));
//   // Prefer earliest reasonable long line near the top
//   cleaned.sort((a, b) => b.length - a.length);
//   return cleaned[0] || '';
// }

// ---------- main ----------
export async function verifyAadhaarDocument(applicationId: string) {
  const app = await prisma.personalIdApplication.findUnique({ where: { id: applicationId } });
  if (!app) throw Object.assign(new Error('Application not found'), { status: 404 });

  // Missing encrypted docs integration in prisma, bypassing actual file read
  // We'll mock text extraction for now until docs table is added.
  const plain = Buffer.from("mock data");
  let text = 'YEAR OF BIRTH: 1990 AADHAAR 1234 5678 9012';
  // Mock completion since we bypassed PDF handling
  // If it was application/pdf we would use pdf-parse...

  const extractedDob = extractDob(text);
  let aadhaar = extractAadhaar(text);
  let checksumOk = false;

  if (aadhaar && !verhoeffValid(aadhaar)) {
    const repaired = cleanOcrDigits(aadhaar);
    if (repaired !== aadhaar && verhoeffValid(repaired)) {
      aadhaar = repaired;
    }
  }
  if (aadhaar && verhoeffValid(aadhaar)) checksumOk = true;

  let finalStatus = app.status;
  let finalDocumentVerified = false;
  let finalAadhaarHash: string | undefined;
  let finalDob: string | undefined;

  if (checksumOk) {
    finalAadhaarHash = sha256Hex(aadhaar!);
    if (extractedDob) finalDob = extractedDob;
    finalDocumentVerified = true;
    finalStatus = 'VERIFIED';
  } else {
    finalDocumentVerified = false;
    finalStatus = 'MANUAL_REVIEW';
  }

  await prisma.personalIdApplication.update({
    where: { id: applicationId },
    data: {
      aadhaarHash: finalAadhaarHash,
      dob: finalDob,
      documentVerified: finalDocumentVerified,
      status: finalStatus
    }
  });

  return {
    applicationId,
    extracted: {
      dob: extractedDob || null,
      aadhaarDigits: aadhaar ? aadhaar.replace(/\d(?=\d{4})/g,'•') : null
    },
    checks: { verhoeff: checksumOk },
    status: finalStatus.toLowerCase(),
    documentVerified: finalDocumentVerified
  };
}


export async function finalizePersonalId(applicationId: string) {
  const app = await prisma.personalIdApplication.findUnique({ where: { id: applicationId } });
  if (!app) throw Object.assign(new Error('Application not found'), { status: 404 });

  // Require checksum-based doc verification + aadhaar hash present
  if (!app.documentVerified || !app.aadhaarHash) {
    throw Object.assign(new Error('Document not verified'), { status: 400 });
  }

  const pid = app.personalId || randomUUID();

  const updatedApp = await prisma.personalIdApplication.update({
    where: { id: applicationId },
    data: {
      personalId: pid,
      mobileVerified: true,
      emailVerified: true,
      documentVerified: true,
      status: 'VERIFIED'
    }
  });

  return {
    personalId: updatedApp.personalId,
    name: updatedApp.fullName,
    aadhaarHash: updatedApp.aadhaarHash,
    dob: updatedApp.dob || null,
    mobile: updatedApp.mobile,
    email: updatedApp.email,
    mobileVerified: updatedApp.mobileVerified,
    emailVerified: updatedApp.emailVerified,
    documentVerified: updatedApp.documentVerified,
    status: updatedApp.status.toLowerCase(),
  };
}

