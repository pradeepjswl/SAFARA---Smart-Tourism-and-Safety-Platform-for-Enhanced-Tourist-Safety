// import bcrypt from 'bcryptjs';
// import { User } from './user.model.js';
// import { Session } from './session.model.js';
// import { OtpRequest } from './otp.model.js';
// import { hashPassword, verifyPassword, hashCode, verifyCode } from '../../utils/password.js';
// import { signAccess, signRefresh } from '../../utils/jwt.js';

// export async function signup(email: string, password: string, phone?: string) {
//   const existing = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] }).lean();
//   if (existing) throw Object.assign(new Error('Email or phone already in use'), { status: 409 });
//   const passwordHash = await hashPassword(password);
//   const u = await User.create({ email, passwordHash, phone });
//   const access = signAccess(u.id);
//   const refresh = signRefresh(u.id);
//   const refreshHash = await bcrypt.hash(refresh, 10);
//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   await Session.create({ userId: u.id, refreshHash, expiresAt });
//   return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
// }

// export async function login(email: string, password: string) {
//   const u = await User.findOne({ email });
//   if (!u?.passwordHash) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
//   const ok = await verifyPassword(password, u.passwordHash);
//   if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
//   const access = signAccess(u.id);
//   const refresh = signRefresh(u.id);
//   const refreshHash = await bcrypt.hash(refresh, 10);
//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   await Session.create({ userId: u.id, refreshHash, expiresAt });
//   return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
// }

// export async function requestOtp(phone: string) {
//   const code = (Math.floor(100000 + Math.random() * 900000)).toString();
//   const codeHash = await hashCode(code);
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
//   const rec = await OtpRequest.create({ phone, codeHash, expiresAt });
//   console.log('DEV OTP for', phone, ':', code);
//   return { requestId: rec.id };
// }

// export async function verifyOtp(requestId: string, code: string) {
//   const req = await OtpRequest.findById(requestId);
//   if (!req || req.consumed || req.expiresAt < new Date())
//     throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
//   const ok = await verifyCode(code, req.codeHash);
//   if (!ok) throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
//   req.consumed = true;
//   await req.save();

//   let u = await User.findOne({ phone: req.phone });
//   if (!u) u = await User.create({ phone: req.phone });

//   const access = signAccess(u.id);
//   const refresh = signRefresh(u.id);
//   const refreshHash = await bcrypt.hash(refresh, 10);
//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   await Session.create({ userId: u.id, refreshHash, expiresAt });
//   return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
// }

// export async function me(userId: string) {
//   const u = await User.findById(userId).lean();
//   if (!u) throw Object.assign(new Error('Not found'), { status: 404 });
//   return { id: String(u._id), email: u.email ?? null, phone: u.phone ?? null };
// }




import bcrypt from 'bcryptjs';
import { prisma } from '../../libs/prisma.js';
import { hashPassword, verifyPassword, hashCode, verifyCode } from '../../utils/password.js';
import { signAccess, signRefresh } from '../../utils/jwt.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function signup(email: string, password: string, phone?: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] }
  });
  if (existing) throw Object.assign(new Error('Email or phone already in use'), { status: 409 });
  const passwordHash = await hashPassword(password);
  const u = await prisma.user.create({ data: { email, passwordHash, phone } });
  const access = signAccess(u.id);
  const refresh = signRefresh(u.id);
  const refreshHash = await bcrypt.hash(refresh, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: u.id, refreshHash, expiresAt } });
  return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
}

export async function login(email: string, password: string) {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u?.passwordHash) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const ok = await verifyPassword(password, u.passwordHash);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const access = signAccess(u.id);
  const refresh = signRefresh(u.id);
  const refreshHash = await bcrypt.hash(refresh, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: u.id, refreshHash, expiresAt } });
  return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
}

export async function requestOtp(phone: string) {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const codeHash = await hashCode(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const rec = await prisma.otpRequest.create({ data: { phone, codeHash, expiresAt } });
  console.log('DEV OTP for', phone, ':', code);
  return { requestId: rec.id };
}

export async function verifyOtp(requestId: string, code: string) {
  const req = await prisma.otpRequest.findUnique({ where: { id: requestId } });
  if (!req || req.consumed || req.expiresAt < new Date())
    throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
  const ok = await verifyCode(code, req.codeHash);
  if (!ok) throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });

  await prisma.otpRequest.update({ where: { id: requestId }, data: { consumed: true } });

  let u = await prisma.user.findUnique({ where: { phone: req.phone } });
  if (!u) u = await prisma.user.create({ data: { phone: req.phone } });

  const access = signAccess(u.id);
  const refresh = signRefresh(u.id);
  const refreshHash = await bcrypt.hash(refresh, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: u.id, refreshHash, expiresAt } });
  return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
}

export async function me(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) throw Object.assign(new Error('Not found'), { status: 404 });
  return { id: String(u.id), email: u.email ?? null, phone: u.phone ?? null };
}

export async function googleLogin(idToken: string) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err: any) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.warn("GOOGLE_CLIENT_ID is not configured in .env! Proceeding with a mock payload for demonstration.");
      payload = { email: "mock_google_user@example.com", name: "Mock Google User", sub: "mock-google-id" };
    } else {
      throw Object.assign(new Error('Invalid Google Token'), { status: 401 });
    }
  }
  
  if (!payload || !payload.email) {
     throw Object.assign(new Error('Invalid Google Token payload'), { status: 401 });
  }

  // Find or create user
  let u = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!u) {
    u = await prisma.user.create({ data: { email: payload.email } });
  }

  const access = signAccess(u.id);
  const refresh = signRefresh(u.id);
  const refreshHash = await bcrypt.hash(refresh, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: u.id, refreshHash, expiresAt } });
  
  return { user: { id: u.id, email: u.email, phone: u.phone }, access, refresh };
}
