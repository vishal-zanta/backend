import { Request, Response } from 'express';
import { User } from './user.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';
import { EmailService } from '../../libs/emailService.lib.js';
import { welcomeEmailTemplate } from '../../templates/welcomeEmail.template.js';
import { adminPasswordResetTemplate } from '../../templates/adminPasswordReset.template.js';
import { OfficerTagging } from '../officerTagging/officerTagging.model.js';

function generatePrefix(designation: string): string {
  return designation
    .split(' ')
    .filter(word => word.trim().length > 0)
    .map(word => {
      if (word.length <= 2) {
        return word.toLowerCase();
      }
      return word[0].toLowerCase();
    })
    .join('');
}

export class UserController {
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["name", "role", "password"], req.body);

    let { name, email, phone, role, district, password, skills, preferredLanguages, loginId } = req.body;

    if (email === "") email = undefined;
    if (phone === "") phone = undefined;
    if (loginId === "") loginId = undefined;

    let existingUser = null;
    if (email || phone || loginId) {
      const orConditions = [];
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });
      if (loginId) orConditions.push({ loginId });
      existingUser = await User.findOne({ $or: orConditions });
    }

    if (existingUser && existingUser.status !== 'INACTIVE') {
      throw new ApiError({ status: 400, message: 'User with this email, phone, or loginId already exists' });
    }

    const assignedRole = await Role.findById(role);
    if (!assignedRole) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }

    const prefix = generatePrefix(assignedRole.designationEnglish);
    const lastUser = await User.findOne({ userCode: { $regex: `^${prefix}-\\d+$`, $options: 'i' } })
                               .sort({ createdAt: -1 })
                               .exec();

    let nextNumber = 1;
    if (lastUser && lastUser.userCode) {
      const match = lastUser.userCode.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const userCode = `${prefix}-${nextNumber.toString().padStart(4, '0')}`.toLowerCase();


    let user;
    if (existingUser && existingUser.status === 'INACTIVE') {
      existingUser.userCode = userCode;
      existingUser.name = name;
      existingUser.email = email;
      existingUser.phone = phone;
      existingUser.password = password;
      existingUser.role = role;
      existingUser.district = district;
      if (loginId) existingUser.loginId = loginId;
      if (skills) existingUser.skills = skills;
      if (preferredLanguages) existingUser.preferredLanguages = preferredLanguages;
      existingUser.status = 'ACTIVE';
      user = await existingUser.save();
    } else {
      user = await User.create({
        userCode,
        name,
        email,
        phone,
        password,
        role,
        district,
        skills,
        preferredLanguages,
        loginId
      });
    }

    // Send email with credentials only if email is provided
    if (email) {
      await EmailService.sendEmail({
        to: email,
        subject: "Welcome! Your Account Credentials",
        html: welcomeEmailTemplate({
          name,
          roleEnglish: assignedRole.designationEnglish,
          roleHindi: assignedRole.designationHindi,
          userCode,
          email,
          password
        })
      });
    }

    // Don't send password back in API response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return new ApiResponse({ res, status: 201, data: userResponse, message: 'User created successfully and email sent' });
  });

  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { role, search } = req.query;
    
    const query: any = { status: { $ne: 'INACTIVE' } };
    
    if (role && typeof(role) =="string") {
      const roleArray=role.split(",");
      if (Array.isArray(roleArray)) {
        query.role = { $in: roleArray };
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

    const untagged = req.query.untagged;
    const subServices = req.query.subServices; 
    const wards = req.query.wards ; 

    if (untagged === 'true' || subServices || wards) {
      // Find matching taggings
      let taggingQuery: any = { active: true };
      let performTaggingQuery = false;
      
      if (subServices) {
        let subServiceArray: string[] = [];
        if (typeof subServices === 'string') {
          subServiceArray = subServices.split(',');
        }
        taggingQuery.services = { $in: subServiceArray };
        performTaggingQuery = true;
      }

      if (wards) {
        let wardsArray: string[] = [];
        if (typeof wards === 'string') {
          wardsArray = wards.split(",");
        }
        taggingQuery.wards = { $in: wardsArray };
        performTaggingQuery = true;
      }

      if (performTaggingQuery) {
        const matchedTaggings = await OfficerTagging.find(taggingQuery).select('officer');
        const matchedOfficerIds = matchedTaggings.map(t => t.officer);
        query._id = { ...query._id, $in: matchedOfficerIds };
      }
      
      if (untagged === 'true') {
        const allTaggings = await OfficerTagging.find({ active: true, services: { $exists: true, $not: { $size: 0 } } }).select('officer');
        const allTaggedOfficerIds = allTaggings.map(t => t.officer);
        
        // If we already have a $in query (from subServices or wards), we merge them via $nin.
        query._id = { ...query._id, $nin: allTaggedOfficerIds };
      }
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .populate({ path: 'role', populate: { path: 'department' } })
      .populate('district')
      .populate('skills')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Users fetched successfully' 
    });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let { name, phone, email, role, status, district, password, skills, preferredLanguages, loginId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    if (name) user.name = name;
    
    if (phone === "") user.phone = undefined as any;
    else if (phone) user.phone = phone;

    if (email === "") user.email = undefined as any;
    else if (email) user.email = email;
    
    if (role) user.role = role;
    if (status !== undefined) user.status = status;
    if (district) user.district = district;
    if (skills) user.skills = skills;
    if (preferredLanguages) user.preferredLanguages = preferredLanguages;
    
    if (loginId === "") user.loginId = undefined;
    else if (loginId !== undefined) user.loginId = loginId;
    if (password) {
      user.password = password;
      user.isPasswordResetMandatory = true;
      if (user.email) {
        await EmailService.sendEmail({
          to: user.email,
          subject: "Your Account Password Has Been Reset",
          html: adminPasswordResetTemplate({
            name: user.name,
            userCode: user.userCode,
            email: user.email,
            password
          })
        });
      }
    }

    await user.save();
    
    return new ApiResponse({ res, status: 200, data: user, message: 'User updated successfully' });
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    // Inactivate the user's tagging
    await OfficerTagging.findOneAndUpdate({ officer: id }, { active: false });

    return new ApiResponse({ res, status: 200, message: 'User deleted successfully' });
  });
}
