import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { organization, twoFactor } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { EmailService } from '../services/EmailService';

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/opsflow';

const client = new MongoClient(MONGO_URI);
const db = client.db();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  basePath: '/api/auth',
  database: mongodbAdapter(db, {}),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const email = user.email;
      if (!email) {
        return;
      }
      const emailService = new EmailService();
      const subject = 'Verify your email for OpsFlow';
      const name = user.name || 'there';
      const text = `Hi ${name},\n\nWelcome to OpsFlow. Verify your email address to finish setting up your workspace:\n\n${url}\n\nIf you didn’t sign up, you can ignore this email.\n`;
      const html = `<p>Hi ${name},</p><p>Welcome to OpsFlow. Verify your email address to finish setting up your workspace.</p><p><a href="${url}">Verify email</a></p><p>If you didn’t sign up, you can ignore this message.</p>`;
      await emailService.send({ to: email, subject, text, html });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      const email = user.email;
      if (!email) {
        return;
      }
      const emailService = new EmailService();
      const subject = 'Reset your OpsFlow password';
      const name = user.name || 'there';
      const text = `Hi ${name},\n\nWe received a request to reset your OpsFlow password.\n\nYou can set a new password here:\n${url}\n\nIf you didn’t request this, you can safely ignore this email.\n`;
      const html = `<p>Hi ${name},</p><p>We received a request to reset your OpsFlow password.</p><p><a href="${url}">Reset password</a></p><p>If you didn’t request this, you can safely ignore this email.</p>`;
      await emailService.send({ to: email, subject, text, html });
    },
    resetPasswordTokenExpiresIn: 60 * 60,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  socialProviders: {
    google: {
      enabled: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
      clientId: GOOGLE_CLIENT_ID || '',
      clientSecret: GOOGLE_CLIENT_SECRET || '',
      prompt: 'select_account',
    },
  },
  plugins: [organization(), twoFactor()],
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001',
    'http://localhost:3000',
  ].filter(Boolean),
  advanced: {
    cookiePrefix: 'opsflow',
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});
