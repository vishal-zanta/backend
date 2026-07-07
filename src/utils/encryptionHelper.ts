import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export class EncryptionHelper {
  static encrypt(text: string): string {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedText: string): string {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!', 'utf8').slice(0, 32);
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
