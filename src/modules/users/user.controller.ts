import { Request, Response } from 'express';
import { User } from './user.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';
import { EmailService } from '../../libs/emailService.lib.js';

export class UserController {
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["name", "email", "phone", "role", "district","password"], req.body);

    const { name, email, phone, role, district, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ApiError({ status: 400, message: 'User with this email or phone already exists' });
    }

    const assignedRole = await Role.findById(role);
    if (!assignedRole) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }


    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      district
    });

    // Send email with credentials
    await EmailService.sendEmail({
      to: email,
      subject: "Welcome! Your Account Credentials",
      html: `
        <h2>Welcome to the CRM, ${name}</h2>
        <p>Your account has been created successfully with the role: ${assignedRole.designationEnglish} (${assignedRole.designationHindi}).</p>
        <p>Here are your login credentials:</p>
        <ul>
          <li><strong>Email / Login ID:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please log in and change your password as soon as possible.</p>
      `
    });

    // Don't send password back in API response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return new ApiResponse({ res, status: 201, data: userResponse, message: 'User created successfully and email sent' });
  });

  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { role, search } = req.query;
    
    const query: any = { status: { $ne: 'INACTIVE' } };
    
    if (role) {
      if (Array.isArray(role)) {
        query.role = { $in: role };
      } else {
        query.role = role;
      }
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const users = await User.find(query).populate('role').select('-password');
    return new ApiResponse({ res, status: 200, data: users, message: 'Users fetched successfully' });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, phone, role, status, district } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status !== undefined) user.status = status;
    if (district) user.district = district;

    await user.save();
    
    return new ApiResponse({ res, status: 200, data: user, message: 'User updated successfully' });
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'User deleted successfully' });
  });
}
