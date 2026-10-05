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
import { ROLES } from '../../config/roles.config.js';
import { ActivityService } from '../activity/activity.service.js';

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
    validateRequestFields(["name", "roles", "password"], req.body);

    let { name, email, phone, roles, district, password, skills, preferredLanguages, loginId, supervisor } = req.body;
    let userRoles = roles || [];

    if (email === "") email = undefined;
    if (phone === "") phone = undefined;
    if (loginId === "") loginId = undefined;
    if (district === "") district = undefined;
    if (supervisor === "") supervisor = undefined;

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

    const assignedRole = await Role.findById(userRoles[0]);
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
      if (userRoles.length) existingUser.roles = userRoles;
      existingUser.district = district;
      if (supervisor !== undefined) existingUser.supervisor = supervisor;
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
        roles: userRoles,
        district,
        supervisor,
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
    const { role, roles, search, department } = req.query;

     
    
    
    const query: any = { status: { $ne: 'INACTIVE' } };
    
    const roleParam = roles || role;
    if (roleParam) {
      let roleArray: string[] = [];
      if (typeof roleParam === 'string') {
        roleArray = roleParam.split(',');
      } else if (Array.isArray(roleParam)) {
        roleArray = roleParam as string[];
      }
      if (roleArray.length > 0) {
        query.roles = { $in: roleArray };
      }
    }

    if (department && typeof department === "string") {
      const deptArray = department.split(",");
      const roles = await Role.find({ department: { $in: deptArray } });
      const roleIds = roles.map(r => r._id.toString());
      
      if (query.roles && query.roles.$in) {
         query.roles.$in = query.roles.$in.filter((id: string) => roleIds.includes(id));
      } else {
         query.roles = { $in: roleIds };
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
    const services = req.query.services;
    const districts = req.query.districts;
    const blocks = req.query.blocks;
    const panchayats = req.query.panchayats;
    const urbanPanchayats = req.query.urbanPanchayats;
    const wards = req.query.wards;
    const areaType = req.query.areaType;

    if (untagged === 'true' || services || districts || blocks || panchayats || urbanPanchayats || wards || areaType) {
      // Find matching taggings
      let taggingQuery: any = { active: true };
      let performTaggingQuery = false;
      
      if (services) {
        let ServiceArray: string[] = [];
        if (typeof services === 'string') {
          ServiceArray = services.split(',');
        }
        taggingQuery.services = { $in: ServiceArray };
        performTaggingQuery = true;
      }

      if (districts) {
        taggingQuery.districts = { $in: typeof districts === 'string' ? districts.split(",") : [] };
        performTaggingQuery = true;
      }
      if (blocks) {
        taggingQuery.blocks = { $in: typeof blocks === 'string' ? blocks.split(",") : [] };
        performTaggingQuery = true;
      }
      if (panchayats) {
        taggingQuery.panchayats = { $in: typeof panchayats === 'string' ? panchayats.split(",") : [] };
        performTaggingQuery = true;
      }
      if (urbanPanchayats) {
        taggingQuery.urbanPanchayats = { $in: typeof urbanPanchayats === 'string' ? urbanPanchayats.split(",") : [] };
        performTaggingQuery = true;
      }
      if (wards) {
        taggingQuery.wards = { $in: typeof wards === 'string' ? wards.split(",") : [] };
        performTaggingQuery = true;
      }
      if (areaType) {
        taggingQuery.areaType = { $in: typeof areaType === 'string' ? areaType.split(",") : [] };
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
        
        // If we already have a $in query, we merge them via $nin.
        query._id = { ...query._id, $nin: allTaggedOfficerIds };
      }
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .populate({ path: 'roles', populate: { path: 'department' } })
      .populate('district')
      .populate('skills')
      .populate('supervisor')
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

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id || (req as any).user._id;
    const { name, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (password !== undefined) {
      user.password = password;
      // If the user updates their own password, they might not need a mandatory reset anymore
      user.isPasswordResetMandatory = false; 
    }

    await user.save();

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: userResponse, 
      message: 'Profile updated successfully' 
    });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let { name, phone, email, roles, status, district, password, skills, preferredLanguages, loginId, supervisor } = req.body;
    let userRoles = roles || [];

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    if (name) user.name = name;
    
    if (phone === "") user.phone = undefined as any;
    else if (phone) user.phone = phone;

    if (email === "") user.email = undefined as any;
    else if (email) user.email = email;
    
    if (userRoles.length) user.roles = userRoles;
    if (status !== undefined) user.status = status;
    if (district) user.district = district;
    if (skills) user.skills = skills;
    if (preferredLanguages) user.preferredLanguages = preferredLanguages;
    
    if (loginId === "") user.loginId = undefined;
    else if (loginId !== undefined) user.loginId = loginId;

    if (supervisor === "") user.supervisor = undefined;
    else if (supervisor !== undefined) user.supervisor = supervisor;
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
    const user:any = await User.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true }).populate("roles");
    
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }
    if(user.roles?.some((r: any) => r.level===ROLES.ADMIN)){
      throw new ApiError({ status: 400, message: 'Cannot delete an Admin user' });
    
    }

    // Inactivate the user's tagging
    await OfficerTagging.findOneAndUpdate({ officer: id }, { active: false });

    return new ApiResponse({ res, status: 200, message: 'User deleted successfully' });
  });

  static updateCceConfig = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { agentId, extension, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    const cceConfig = user.cceConfig || { agentId: undefined, extension: undefined, password: undefined };

    if (agentId !== undefined) {
      if (agentId === "") cceConfig.agentId = undefined;
      else cceConfig.agentId = agentId;
    }
    if (extension !== undefined) {
      if (extension === "") cceConfig.extension = undefined;
      else cceConfig.extension = extension;
    }
    if (password !== undefined) {
      if (password === "") cceConfig.password = undefined;
      else cceConfig.password = password;
    }

    user.cceConfig = cceConfig;

    await user.save();

    return new ApiResponse({
      res,
      status: 200,
      data: user.cceConfig,
      message: 'CCE config updated successfully'
    });
  });

  /**
   * CCE tracking list API with Redis live presence and browser-level screen check:
   * - Admin sees all CCE agents (with optional supervisor filter).
   * - Supervisor strictly sees only their assigned CCEs (user.supervisor == req.user._id).
   * - Pulls real-time browser screen activity from Redis cache.
   */
  static getCceTracking = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userRoles = user?.roles || [];

    const isAdmin = userRoles.some(
      (r: any) => r.level?.toLowerCase() === 'admin' || r.permissions?.includes('ALL')
    );
    const isSupervisor = userRoles.some(
      (r: any) => r.level?.toLowerCase() === 'supervisor'
    );
 

  

    const { search, supervisorId, status, page, limit } = req.query;

    // Find CCE role ID(s)
    const cceRoles = await Role.find({ level: { $regex: /^cce$/i } }).select('_id');

    const query: any = {
      status: 'ACTIVE',
    };

    if (cceRoles.length > 0) {
      query.roles = { $in: cceRoles.map((r) => r._id) };
    }

    // Role-based visibility check:
    // Admin sees all CCEs (can filter by supervisorId if supplied)
    // Supervisor strictly sees ONLY their assigned CCEs
    if (isAdmin) {
      if (supervisorId) {
        query.supervisor = supervisorId;
      }
    } else if (isSupervisor) {
      query.supervisor = user.id;
    } else {
      query._id = user.id;
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { userCode: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'cceConfig.agentId': searchRegex },
        { 'cceConfig.extension': searchRegex },
      ];
    }

    const agents = await User.find(query)
      .select('name userCode email phone supervisor cceConfig lastLogin adminLogout isBreak createdAt')
      .populate('supervisor', 'name userCode email phone')
      .lean();

    let onlineCount = 0;
    let activeOnScreenCount = 0;
    let idleOrBackgroundCount = 0;
    let onBreakCount = 0;
    let offlineCount = 0;

    // Fetch real-time activity for all agents from Redis in parallel
    const list = await Promise.all(
      agents.map(async (agent: any) => {
        const activity = await ActivityService.getUserActivity(agent._id.toString());

        let currentStatus: 'ON_BREAK' | 'ACTIVE_ON_SCREEN' | 'BACKGROUND' | 'OFFLINE' = 'OFFLINE';

        if (agent.isBreak) {
          currentStatus = 'ON_BREAK';
          onBreakCount++;
        }

        if (activity.isOnline) {
          onlineCount++;
          if (activity.isActiveOnScreen && activity.screenState === 'ACTIVE') {
            activeOnScreenCount++;
            if (!agent.isBreak) currentStatus = 'ACTIVE_ON_SCREEN';
          } else {
            idleOrBackgroundCount++;
            if (!agent.isBreak) currentStatus = 'BACKGROUND';
          }
        } else {
          offlineCount++;
          if (!agent.isBreak) currentStatus = 'OFFLINE';
        }

        return {
          _id: agent._id,
          name: agent.name,
          userCode: agent.userCode,
          email: agent.email,
          phone: agent.phone,
          supervisor: agent.supervisor,
          cceConfig: agent.cceConfig,
          lastLogin: agent.lastLogin || null,
          lastLogout: agent.adminLogout || null,
          isBreak: agent.isBreak || false,
          isOnline: activity.isOnline,
          isActiveOnScreen: activity.isActiveOnScreen,
          screenState: activity.screenState,
          lastActive: activity.lastActive,
          currentStatus,
        };
      })
    );

    // Optional status filter
    let filteredList = list;
    if (status && typeof status === 'string' && status !== 'ALL') {
      filteredList = filteredList.filter((a) => a.currentStatus === status || a.screenState === status);
    }

    // Sort: Online & active on screen first, then on break, then offline
    filteredList.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      if (a.isActiveOnScreen && !b.isActiveOnScreen) return -1;
      if (!a.isActiveOnScreen && b.isActiveOnScreen) return 1;
      return a.name.localeCompare(b.name);
    });

    // Pagination
    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const total = filteredList.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const skip = (pageNum - 1) * limitNum;
    const paginatedDocs = filteredList.slice(skip, skip + limitNum);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        summary: {
          totalAgents: agents.length,
          onlineAgents: onlineCount,
          activeOnScreenAgents: activeOnScreenCount,
          idleOrBackgroundAgents: idleOrBackgroundCount,
          onBreakAgents: onBreakCount,
          offlineAgents: offlineCount,
        },
        docs: paginatedDocs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
      message: 'CCE tracking list fetched successfully',
    });
  });
}
