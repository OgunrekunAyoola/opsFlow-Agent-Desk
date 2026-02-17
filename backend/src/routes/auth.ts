import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  signAccessToken,
  signRefreshToken,
  refreshCookieOptions,
  refreshCookieName,
  verifyToken,
} from '../auth/jwt';
import Tenant from '../models/Tenant';
import User from '../models/User';
import { requireAuth, requireAdmin } from '../middleware/auth';
import UserAction from '../models/UserAction';
import { EmailService } from '../services/EmailService';

const router = Router();
const frontendBaseUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(
  /\/+$/,
  '',
);

router.post('/signup', async (req, res) => {
  const { tenantName, name, email, password } = req.body || {};

  // Basic Validation
  if (!tenantName || !name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Password Strength Validation
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/[A-Z]/.test(password))
    return res.status(400).json({ error: 'Password must contain an uppercase letter' });
  if (!/[0-9]/.test(password))
    return res.status(400).json({ error: 'Password must contain a number' });
  if (!/[^A-Za-z0-9]/.test(password))
    return res.status(400).json({ error: 'Password must contain a special character' });

  // Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  try {
    const tenant = await Tenant.create({ name: tenantName });
    const hash = await bcrypt.hash(password, 12);

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate Inbound Email Settings
    const inboundSecret = crypto.randomBytes(24).toString('hex');
    const inboundAddress = `support+${tenant._id.toString()}@opsflow.test`;
    tenant.inboundSecret = inboundSecret;
    tenant.inboundAddress = inboundAddress;
    await tenant.save();

    const user = await User.create({
      tenantId: tenant._id,
      name,
      email,
      passwordHash: hash,
      role: 'admin',
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    const emailService = new EmailService();
    const verifyLink = `${frontendBaseUrl}/verify-email?token=${verificationToken}`;
    const subject = 'Welcome to OpsFlow – Verify your email';
    const text = `Hi ${name},\n\nWelcome to OpsFlow.\n\nVerify your email to activate your account:\n${verifyLink}\n\nWorkspace: ${tenantName}\nInbound support email: ${inboundAddress}\n`;
    const html = `<p>Hi ${name},</p><p>Welcome to OpsFlow.</p><p>Verify your email to activate your account:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>Workspace: ${tenantName}<br/>Inbound support email: ${inboundAddress}</p>`;
    try {
      await emailService.send({ to: email, subject, text, html });
    } catch (e) {
      console.error(e);
    }

    // For "Easy Sign In", we allow login immediately but prompt for verification?
    // Or we block?
    // "Enterprise" usually blocks. But user wants "Easy".
    // I'll allow login but return isEmailVerified flag so frontend can nag.

    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);
    res.cookie(refreshCookieName, refresh, refreshCookieOptions);

    res.json({
      access_token: access,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tenant: { id: tenant._id, name: tenant.name },
      inbound: { address: inboundAddress },
      message: 'Account created. Please check your email to verify.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  const user = await User.findOne({ email }).exec();
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  // Optional: Enforce verification
  // if (!user.isEmailVerified) return res.status(403).json({ error: 'Please verify your email first.' });

  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  res.cookie(refreshCookieName, refresh, refreshCookieOptions);
  try {
    await UserAction.create({ tenantId: user.tenantId, userId: user._id, type: 'login' });
  } catch {}
  res.json({
    access_token: access,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.json({ message: 'If an account exists, a verification email has been resent.' });
  }

  if (user.isEmailVerified) {
    return res.json({ message: 'Email is already verified.' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();
  const emailService = new EmailService();
  const verifyLink = `${frontendBaseUrl}/verify-email?token=${verificationToken}`;
  const subject = 'Verify your OpsFlow account';
  const text = `Hi ${user.name},\n\nVerify your email to activate your account:\n${verifyLink}\n`;
  const html = `<p>Hi ${user.name},</p><p>Verify your email to activate your account:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`;
  try {
    await emailService.send({ to: email, subject, text, html });
  } catch (e) {
    console.error(e);
  }

  res.json({ message: 'Verification email resent.' });
});

router.post('/social-login', async (req, res) => {
  // Mock Social Login
  // In a real app, we would verify the token from Google/Apple here
  const { provider, email, name, sub } = req.body;

  if (!provider || !email) {
    return res.status(400).json({ error: 'Missing provider or email' });
  }

  try {
    let user = await User.findOne({ email });
    let tenant;

    if (!user) {
      // Create new user for social login
      tenant = await Tenant.create({ name: `${name}'s Organization` });
      // Generate a random password for social users
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hash = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        tenantId: tenant._id,
        name: name || email.split('@')[0],
        email,
        passwordHash: hash,
        role: 'admin',
        isEmailVerified: true, // Social logins are usually pre-verified
      });
    }

    // Login successful
    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);
    res.cookie(refreshCookieName, refresh, refreshCookieOptions);

    res.json({
      access_token: access,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Social login failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) {
    // For security, do not reveal if user exists
    return res.json({ message: 'If an account exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  await user.save();
  const emailService = new EmailService();
  const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;
  const subject = 'Reset your OpsFlow password';
  const text = `Hi ${user.name},\n\nYou requested a password reset.\n\nReset your password using this link:\n${resetLink}\nIf you did not request this, you can ignore this email.\n`;
  const html = `<p>Hi ${user.name},</p><p>You requested a password reset.</p><p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, you can ignore this email.</p>`;
  try {
    await emailService.send({ to: email, subject, text, html });
  } catch (e) {
    console.error(e);
  }

  res.json({ message: 'If an account exists, a reset link has been sent.' });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  // Password Strength Validation
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/[A-Z]/.test(password))
    return res.status(400).json({ error: 'Password must contain an uppercase letter' });
  if (!/[0-9]/.test(password))
    return res.status(400).json({ error: 'Password must contain a number' });

  const hash = await bcrypt.hash(password, 12);
  user.passwordHash = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
});

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ error: 'Email is already verified' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Mock Email Sending
  console.log('================================================');
  console.log(`[EMAIL MOCK] To: ${email}`);
  console.log(`[EMAIL MOCK] Subject: Verify your OpsFlow email`);
  console.log(`[EMAIL MOCK] Link: http://localhost:5173/verify-email?token=${verificationToken}`);
  console.log('================================================');

  res.json({ message: 'Verification email sent' });
});

router.post('/refresh', async (req, res) => {
  const token = (req as any).cookies?.[refreshCookieName];
  if (!token) return res.status(401).json({ error: 'invalid' });
  try {
    const p = verifyToken(token) as any;
    if (p.type !== 'refresh') return res.status(401).json({ error: 'invalid' });
    const user = await User.findById(p.sub).exec();
    if (!user) return res.status(401).json({ error: 'invalid' });
    const access = signAccessToken(user);
    res.json({ access_token: access });
  } catch {
    res.status(401).json({ error: 'invalid' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(refreshCookieName, { path: '/auth/refresh' });
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const user = await User.findById(ctx.userId).exec();
  const tenant = await Tenant.findById(ctx.tenantId).exec();
  res.json({
    user: {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      isEmailVerified: user?.isEmailVerified,
    },
    tenant: {
      id: tenant?._id,
      name: tenant?.name,
      inboundAddress: tenant?.inboundAddress,
      supportEmail: tenant?.supportEmail,
      autoReplyEnabled: tenant?.autoReplyEnabled,
      autoReplyConfidenceThreshold: tenant?.autoReplyConfidenceThreshold,
      autoReplySafeCategories: tenant?.autoReplySafeCategories,
      lastInboundAt: tenant?.lastInboundAt,
    },
  });
});

router.patch('/auto-reply-settings', requireAuth, requireAdmin, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { enabled, confidenceThreshold, safeCategories } = req.body || {};

  const update: any = {};
  if (typeof enabled === 'boolean') {
    update.autoReplyEnabled = enabled;
  }
  if (typeof confidenceThreshold === 'number') {
    const c = Math.max(0.5, Math.min(confidenceThreshold, 1));
    update.autoReplyConfidenceThreshold = c;
  }
  if (Array.isArray(safeCategories)) {
    update.autoReplySafeCategories = safeCategories
      .filter((v) => typeof v === 'string')
      .map((v) => v.toLowerCase());
  }

  const tenant = await Tenant.findOneAndUpdate(
    { _id: ctx.tenantId },
    { $set: update },
    { new: true },
  ).exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });

  res.json({
    autoReplyEnabled: tenant.autoReplyEnabled,
    autoReplyConfidenceThreshold: tenant.autoReplyConfidenceThreshold,
    autoReplySafeCategories: tenant.autoReplySafeCategories,
  });
});

router.patch('/tenant-settings', requireAuth, requireAdmin, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { supportEmail } = req.body || {};

  const update: any = {};
  if (typeof supportEmail === 'string') {
    update.supportEmail = supportEmail.trim();
  }

  const tenant = await Tenant.findOneAndUpdate(
    { _id: ctx.tenantId },
    { $set: update },
    { new: true },
  ).exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });

  res.json({
    supportEmail: tenant.supportEmail,
  });
});

router.patch('/profile', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { name } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'invalid' });
  const user = await User.findOneAndUpdate(
    { _id: ctx.userId, tenantId: ctx.tenantId },
    { $set: { name } },
    { new: true },
  ).exec();
  if (!user) return res.status(404).json({ error: 'not_found' });
  await UserAction.create({ tenantId: ctx.tenantId, userId: ctx.userId, type: 'profile_update' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'invalid' });
  const user = await User.findById(ctx.userId).exec();
  if (!user) return res.status(404).json({ error: 'not_found' });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'invalid_current_password' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'weak_password' });
  if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ error: 'weak_password' });
  if (!/[0-9]/.test(newPassword)) return res.status(400).json({ error: 'weak_password' });
  const hash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = hash;
  await user.save();
  await UserAction.create({ tenantId: ctx.tenantId, userId: ctx.userId, type: 'password_change' });
  res.json({ ok: true });
});

export default router;
