import { Request, Response } from 'express';
import { User } from '../users/user.model.js';
import { PasswordHelper } from '../../utils/passwordHelper.js';
import { EncryptionHelper } from '../../utils/encryptionHelper.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';
import { EmailService } from '../../libs/emailService.lib.js';
import { resetPasswordEmailTemplate } from '../../templates/resetPassword.template.js';
import { CaptchaService } from '../captcha/captcha.service.js';

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password,token,captchaToken } = req.body;

    // TODO: 
//  const isCaptchaValid = await CaptchaService.verifyGoogleCapcha(captchaToken);
    // if (!isCaptchaValid) {
    //   throw new ApiError({ status: 400, message: 'Invalid captcha' });
    // }

    if (token) {
      try {
        const decryptedEmail = EncryptionHelper.decrypt(token);
        const user = await User.findOne({ email: decryptedEmail, status: 'ACTIVE' });
        
        if (!user) {
          throw new ApiError({ status: 404, message: 'User not found' });
        }

        user.password = password;
        user.lastLogin = new Date();
        await user.save();

        const userData = PasswordHelper.createUserPayload(user, user.role);
        return new ApiResponse({ res, status: 200, data: userData, message: 'Password updated and login successful' });
      } catch (error) {
        throw new ApiError({ status: 400, message: 'Invalid or expired token' });
      }
    }
    

    validateRequestFields(["email","password"], req.body);

    const user = await User.findOne({ email, status: 'ACTIVE' }).populate('role');
    if (user && await PasswordHelper.compare(password, user.password)) {
      user.lastLogin = new Date();
      await user.save();
      
      const userData = PasswordHelper.createUserPayload(user, user.role);
      return new ApiResponse({ res, status: 200, data: userData, message: 'Login successful' });
    }

    throw new ApiError({ status: 400, message: 'Invalid credentials' });
  });

 static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;

    const user = await User.findById(id).select('-password').populate('role district');

    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: user,
      message: 'Profile fetched successfully'
    });
  });


  // ================= UPDATE PROFILE =================
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    const { name, password } = req.body;

    if(!name && !password){
      throw new ApiError({ status: 400, message: 'Name or password is required' });
    }

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    if(name){
      user.name = name;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    return new ApiResponse({
      res,
      status: 200,
      message: 'Profile updated successfully'
    });
  });

  

  // ================= FORGOT PASSWORD =================
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    validateRequestFields(["email"], req.body);

    const user = await User.findOne({ email, status: 'ACTIVE' });
    
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    const resetToken = EncryptionHelper.encrypt(email);
    const appUrl = process.env.APP_URL  ;
    const resetUrl = `${appUrl}/login?token=${resetToken}&email=${email}`;
    
    await EmailService.sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: resetPasswordEmailTemplate({
        name: user.name,
        resetUrl
      })
    });
    
    return new ApiResponse({
      res,
      status: 200,
      message: 'Password reset email sent successfully'
    });
  });

  // ================= LOGOUT =================
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    // We reuse the adminLogout logic to invalidate tokens issued before this time
    user.adminLogout = new Date();
    await user.save();

    return new ApiResponse({
      res,
      status: 200,
      message: 'Logged out successfully'
    });
  });

}
