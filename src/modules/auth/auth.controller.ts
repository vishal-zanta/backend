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
import { OfficerTagging } from '../officerTagging/officerTagging.model.js';
import { Shift } from '../shift/shift.model.js';
import { AvayaService } from '../avaya/avaya.service.js';
export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, loginId, password, token, captchaToken } = req.body;
    const identifier = email || loginId;

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

        if (user.cceConfig && user.cceConfig.agentId && user.cceConfig.extension) {
          try {
            await AvayaService.agentLogin(user.cceConfig.agentId, user.cceConfig.extension, user.cceConfig.password || "123456");
            const webhookUrl = process.env.AVAYA_WEBHOOK_URL || "https://backend.bugslayer.in/api/v1/telephony/webhook";
            await AvayaService.monitorExtensions([user.cceConfig.extension], webhookUrl);
          } catch (e) {
            console.error("Avaya login or monitor failed:", e);
          }
        }

        const userData = PasswordHelper.createUserPayload(user, user.roles);
        return new ApiResponse({ res, status: 200, data: userData, message: 'Password updated and login successful' });
      } catch (error) {
        throw new ApiError({ status: 400, message: 'Invalid or expired token' });
      }
    }
    

    if (!identifier || !password) {
      throw new ApiError({ status: 400, message: 'Email/LoginId and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { loginId: identifier }],
      status: 'ACTIVE'
    }).populate('roles');

    if (user && await PasswordHelper.compare(password, user.password)) {
      user.lastLogin = new Date();
      await user.save();
      
      if (user.cceConfig && user.cceConfig.agentId && user.cceConfig.extension) {
        try {
          await AvayaService.agentLogin(user.cceConfig.agentId, user.cceConfig.extension, user.cceConfig.password || "123456");
          const webhookUrl = process.env.AVAYA_WEBHOOK_URL || "https://backend.bugslayer.in/api/v1/telephony/webhook";
          await AvayaService.monitorExtensions([user.cceConfig.extension], webhookUrl);
        } catch (e) {
          console.error("Avaya login or monitor failed:", e);
        }
      }

      const userData = PasswordHelper.createUserPayload(user, user.roles);
      
      return new ApiResponse({ 
        res, 
        status: 200, 
        data: {
          ...userData,
          isPasswordResetMandatory: user.isPasswordResetMandatory
        }, 
        message: 'Login successful' 
      });
    }

    throw new ApiError({ status: 400, message: 'Invalid credentials' });
  });

 static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;

    const user = await User.findById(id).select('-password').populate('roles district');

    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }
    const officerTagging = await OfficerTagging.findOne({ officer: id }).populate({
      path: "services",
      populate: {
        path: "department"
      }
    });

    const shift = await Shift.findOne({ user: id }).sort({ date: -1, createdAt: -1 });
    
    return new ApiResponse({
      res,
      status: 200,
      data: { ...user.toObject(), officerTagging, shift },
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
      user.isPasswordResetMandatory = false;
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

    if (user.cceConfig && user.cceConfig.agentId && user.cceConfig.extension) {
      try {
        await AvayaService.agentLogout(user.cceConfig.agentId, user.cceConfig.extension);
      } catch (e) {
        console.error("Avaya logout failed:", e);
      }
    }

    return new ApiResponse({
      res,
      status: 200,
      message: 'Logged out successfully'
    });
  });

}
