import bcrypt from 'bcryptjs';
import { generateJwtToken } from '../modules/auth/auth.service.js';

export class PasswordHelper {
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static createUserPayload(user: any, role: any) {
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role,

      token:generateJwtToken({ id: user._id, role })
    };
  }

  static createCitizenPayload(citizen: any) {
    return {
      id: citizen._id || citizen.id,
      name: citizen.fullName,
      email: citizen.email,
      mobile: citizen.mobile,
      role: 'CITIZEN',
      token: generateJwtToken({ id: citizen._id, mobile: citizen.mobile, role: 'CITIZEN' })
    };
  }
}
// bcrypt.hash("123" , 10).then(console.log)
// bcrypt.compare("123", '$2b$10$O.T65lSBenNVg6CH0Ufc1e2r7Z8QVfOE/7AaMF8p88tP2CfjhaVp6').then(console.log)