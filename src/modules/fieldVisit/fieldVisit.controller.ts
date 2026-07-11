import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { FieldVisit } from './fieldVisit.model.js';
import { Grievance } from '../grievance/grievance.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { TimelineService } from '../timeline/timeline.service.js';
import { timelineTemplates } from '../timeline/timeline.template.js';
import { User } from '../users/user.model.js';
import ApiResponse from '../../utils/apiResponse.js';

export class FieldVisitController {
  
  /**
   * Get field visits for grievances assigned to the logged in officer
   */
  static getVisits = asyncHandler(async (req: Request, res: Response) => {
    const officerId = req.user?.id;
    if (!officerId) throw new ApiError({ status: 401, message: 'Unauthorized' });

    const { search, schedule, page = 1, limit = 10 } = req.query;

    const matchQuery: any = {};
    if (search && typeof search === 'string') {
      matchQuery.visitId = new RegExp(search, 'i');
    }

    if (schedule && typeof schedule === 'string') {
      const date = new Date(schedule);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        matchQuery.schedule = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'grievances',
          localField: 'grievance',
          foreignField: '_id',
          as: 'grievance'
        }
      },
      { $unwind: '$grievance' },
      { $match: { 'grievance.assignedOfficer': new mongoose.Types.ObjectId(officerId) } },
      {
        $lookup: {
          from: 'subservices',
          localField: 'grievance.classification.subService',
          foreignField: '_id',
          as: 'subServiceDetails'
        }
      },
      { $unwind: { path: '$subServiceDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'services',
          localField: 'subServiceDetails.service',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: { path: '$serviceDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $project: {
                visitId: 1,
                status: 1,
                schedule: 1,
                createdAt: 1,
                updatedAt: 1,
                'subServiceDetails.title': 1,
                'subServiceDetails.titleHindi': 1,
                'serviceDetails.title': 1,
                'serviceDetails.titleHindi': 1,
                'grievance._id': 1,
                'grievance.grievanceId': 1,
                'grievance.status': 1,
                'grievance.classification': 1,
                'grievance.address': 1,
                'grievance.citizenInfo': 1,
                'grievance.geotaggedImages': 1
              }
            }
          ]
        }
      }
    ];

    const result = await FieldVisit.aggregate(pipeline);
    const total = result[0].metadata[0]?.total || 0;
    const visits = result[0].data;

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: visits,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
      },
      message: 'Field visits fetched successfully'
    });
  });

  /**
   * Update Field Visit status and schedule
   */
  static updateVisit = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, schedule, remark } = req.body;

    const officerId = req.user?.id;
    
    const visit = await FieldVisit.findById(id);
    if (!visit) {
      throw new ApiError({ status: 404, message: 'Field visit not found' });
    }

    if (status && visit.status !== status) {
      visit.logs.push({
        changedBy: new  mongoose.Types.ObjectId(officerId),
        action: 'STATUS_CHANGED',
        oldValue: visit.status,
        newValue: status,
        changedAt: new Date()
      });
      visit.status = status;
    }

    if (schedule) {
      const newSchedule = new Date(schedule);
      if (visit.schedule?.getTime() !== newSchedule.getTime()) {
        visit.logs.push({
          changedBy: new mongoose.Types.ObjectId(officerId),
          action: 'SCHEDULE_UPDATED',
          oldValue: visit.schedule,
          newValue: newSchedule,
          changedAt: new Date()
        });
        visit.schedule = newSchedule;
      }
    }

    let shouldLogTimeline = false;
    if ((status === 'COMPLETED' && visit.status !== 'COMPLETED' && (remark || visit.remark)) || 
        (remark && visit.remark !== remark && (status === 'COMPLETED' || visit.status === 'COMPLETED'))) {
      shouldLogTimeline = true;
    }

    if (remark) {
      visit.remark = remark;
    }

    if (shouldLogTimeline && officerId) {
      const officer = await User.findById(officerId).populate('role');
      if (officer) {
        await TimelineService.logEvent({
          grievanceId: visit.grievance as any,
          type: "FIELD_VISIT",
          actor: {
            id: officer._id ,
            name: officer.name || 'Officer',
            role: (officer.role as any)?.level || 'OFFICER'
          },
          metadata: {
            description: timelineTemplates.FIELD_VISIT(visit.remark || 'Field visit completed.')
          }
        });
      }
    }

    await visit.save();

    return new ApiResponse({
      res,
      status: 200,
      data: visit,
      message: 'Field visit updated successfully'
    });
  });
}
