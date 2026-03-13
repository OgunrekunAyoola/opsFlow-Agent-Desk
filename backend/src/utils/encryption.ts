import crypto from 'crypto';
import dotenv from 'dotenv';
import logger from '../shared/utils/logger';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_change_me_in_prod!'; 
const IV_LENGTH = 16; // For AES, this is always 16

function getKey() {
    return crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
}

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    logger.error('Encryption failed', err);
    return text;
  }
}

export function decrypt(text: string): string {
  if (!text) return text;
  // specific check for already encrypted format (hex:hex)
  if (!text.includes(':')) return text; 

  try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      if (iv.length !== IV_LENGTH) return text; // Not a valid IV

      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
  } catch (err) {
      // If decryption fails, it might be plain text (e.g. existing data)
      return text;
  }
}
