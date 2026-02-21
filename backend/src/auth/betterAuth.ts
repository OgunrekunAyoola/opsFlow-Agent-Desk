import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { organization, twoFactor } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/opsflow';

const client = new MongoClient(MONGO_URI);
const db = client.db();

export const auth = betterAuth({
  basePath: '/api/auth',
  database: mongodbAdapter(db, {}),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [organization(), twoFactor()],
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001',
  ].filter(Boolean),
  advanced: {
    cookiePrefix: 'opsflow',
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});
