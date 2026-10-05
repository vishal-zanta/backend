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
import moment from 'moment';

export class FieldVisitController {
  
  /**
   * Get field visit stats for the logged-in officer
   */
  static getVisitStats = asyncHandler(async (req: Request, res: Response) => {
    const officerId = req.user?.id;
    if (!officerId) throw new ApiError({ status: 401, message: 'Unauthorized' });

    const pipeline: any[] = [
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
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const stats = await FieldVisit.aggregate(pipeline);

    let total = 0;
    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;

    stats.forEach(stat => {
      total += stat.count;
      if (stat._id === 'SCHEDULED') scheduled = stat.count;
      else if (stat._id === 'IN_PROGRESS') inProgress = stat.count;
      else if (stat._id === 'COMPLETED') completed = stat.count;
    });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        total,
        scheduled,
        inProgress,
        completed
      },
      message: 'Field visit stats fetched successfully'
    });
  });

  /**
   * Get field visits for grievances assigned to the logged in officer
   */
  static getVisits = asyncHandler(async (req: Request, res: Response) => {
    const officerId = req.user?.id;
    if (!officerId) throw new ApiError({ status: 401, message: 'Unauthorized' });

    const { search, schedule,status, page = 1, limit = 10 } = req.query;

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
      {$match: status ? { status } : {} },
      {
        $lookup: {
          from: 'services',
          localField: 'grievance.classification.service',
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
                'serviceDetails.title': 1,
                'serviceDetails.titleHindi': 1,
                'grievance._id': 1,
                'grievance.grievanceId': 1,
                'grievance.status': 1,
                'grievance.classification': 1,
                'grievance.location': 1,
                'grievance.citizenInfo': 1,
                'grievance.geotaggedImages': 1,
                'grievance.createdAt':1,
                'grievance.assignedPriority':1,
                
              }
            },
            {
              $lookup: {
                from: 'districts',
                localField: 'grievance.location.district',
                foreignField: '_id',
                as: 'grievance.location.district'
              }
            },
            {
              $unwind: {
                path: "$grievance.location.district",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'blocks',
                localField: 'grievance.location.block',
                foreignField: '_id',
                as: 'grievance.location.block'
              }
            },
            {
              $unwind: {
                path: "$grievance.location.block",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'panchayats',
                localField: 'grievance.location.panchayat',
                foreignField: '_id',
                as: 'grievance.location.panchayat'
              }
            },
            {
              $unwind: {
                path: "$grievance.location.panchayat",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'urbanlocalbodies',
                localField: 'grievance.location.urbanPanchayat',
                foreignField: '_id',
                as: 'grievance.location.urbanPanchayat'
              }
            },
            {
              $unwind: {
                path: "$grievance.location.urbanPanchayat",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'wards',
                localField: 'grievance.location.ward',
                foreignField: '_id',
                as: 'grievance.location.ward'
              }
            },
            {
              $unwind: {
                path: "$grievance.location.ward",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                from: 'villages',
                localField: 'grievance.location.village',
                foreignField: '_id',
                as: 'grievance.location.village'
              }
            },
            {
              $unwind: {
                path: "$grievance.location.village",
                preserveNullAndEmptyArrays: true
              }
            },
           
            
            
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

    const eventsToLog: { type: string; metadata: any }[] = [];

    if (status && visit.status !== status) {
      visit.logs.push({
        changedBy: new mongoose.Types.ObjectId(officerId),
        action: 'STATUS_CHANGED',
        oldValue: visit.status,
        newValue: status,
        changedAt: new Date()
      });
      eventsToLog.push({
        type: "FIELD_VISIT_STATUS",
        metadata: timelineTemplates.FIELD_VISIT_STATUS(status)
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
        eventsToLog.push({
          type: "FIELD_VISIT_SCHEDULE",
          metadata: timelineTemplates.FIELD_VISIT_SCHEDULE(newSchedule.toLocaleDateString())
        });
        visit.schedule = newSchedule;
      }
    }

    if (remark && visit.remark !== remark) {
      eventsToLog.push({
        type: "FIELD_VISIT_REMARK",
        metadata: timelineTemplates.FIELD_VISIT_REMARK(remark)
      });
      visit.remark = remark;
    }

    if (eventsToLog.length > 0 && officerId) {
      const officer = await User.findById(officerId).populate('roles');
      if (officer) {
        for (const event of eventsToLog) {
          await TimelineService.logEvent({
            grievanceId: visit.grievance as any,
            type: event.type as any,
            actor: {
              id: officer._id ,
              name: officer.name || 'Officer',
              role: (officer.roles as any)?.[0]?.level || 'OFFICER'
            },
            metadata: event.metadata
          });
        }
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

  /**
   * API 1: Line graph analytics - Date-wise count of field visits generated
   * Supports 'from' / 'startDate' and 'to' / 'endDate' date filters
   */
  static getVisitTrend = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, status } = req.query;

    const fromDateStr = ( startDate) as string;
    const toDateStr = ( endDate) as string;

    // Default to last 30 days if not provided
    const now = new Date();
    const endMoment = toDateStr ? moment(toDateStr).endOf('day') : moment(now).endOf('day');
    const startMoment = fromDateStr
      ? moment(fromDateStr).startOf('day')
      : moment(endMoment).subtract(29, 'days').startOf('day');

    const start = startMoment.toDate();
    const end = endMoment.toDate();

    const matchStage: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (status && typeof status === 'string' && status !== 'ALL') {
      matchStage.status = status;
    }

    const pipeline: any[] = [{ $match: matchStage }];

   

    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: '+05:30',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }
    );

    const results = await FieldVisit.aggregate(pipeline);

    // Build complete daily timeline between start and end (with 0 counts for missing days)
    const dateMap = new Map<string, number>();
    const current = moment(startMoment);
    while (current.isSameOrBefore(endMoment, 'day')) {
      dateMap.set(current.format('YYYY-MM-DD'), 0);
      current.add(1, 'day');
    }

    let totalVisits = 0;
    results.forEach((r: any) => {
      if (dateMap.has(r._id)) {
        dateMap.set(r._id, r.count);
      }
      totalVisits += r.count;
    });

    const timeline = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const totalDays = timeline.length || 1;
    const avgPerDay = parseFloat((totalVisits / totalDays).toFixed(2));

    return new ApiResponse({
      res,
      status: 200,
      data: {
        summary: {
          totalVisits,
          fromDate: startMoment.format('YYYY-MM-DD'),
          toDate: endMoment.format('YYYY-MM-DD'),
          totalDays,
          avgPerDay,
        },
        timeline,
      },
      message: 'Field visit trend fetched successfully',
    });
  });

  /**
   * API 2: Fetch all field visits for a single date
   * Matching the line graph count using createdAt (+05:30 IST)
   * with connected complaint/grievance and assigned officer details
   */
  static getVisitsByDate = asyncHandler(async (req: Request, res: Response) => {
    const { date, page = 1, limit = 10 } = req.query;

    const rawDateStr = (date as string) || moment().format('YYYY-MM-DD');
    const cleanDateStr = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr;

    // Filter by createdAt in IST (+05:30) to exactly match the line graph count
    const start = moment.parseZone(`${cleanDateStr}T00:00:00.000+05:30`).toDate();
    const end = moment.parseZone(`${cleanDateStr}T23:59:59.999+05:30`).toDate();

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const pipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'grievances',
          localField: 'grievance',
          foreignField: '_id',
          as: 'grievance',
        },
      },
      { $unwind: '$grievance' },
      {
        $lookup: {
          from: 'users',
          localField: 'grievance.assignedOfficer',
          foreignField: '_id',
          as: 'assignedOfficer',
        },
      },
      { $unwind: { path: '$assignedOfficer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'services',
          localField: 'grievance.classification.service',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      },
      { $unwind: { path: '$serviceDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'grievance.classification.department',
          foreignField: '_id',
          as: 'departmentDetails',
        },
      },
      { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'districts',
          localField: 'grievance.location.district',
          foreignField: '_id',
          as: 'districtDetails',
        },
      },
      { $unwind: { path: '$districtDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'blocks',
          localField: 'grievance.location.block',
          foreignField: '_id',
          as: 'blockDetails',
        },
      },
      { $unwind: { path: '$blockDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'panchayats',
          localField: 'grievance.location.panchayat',
          foreignField: '_id',
          as: 'panchayatDetails',
        },
      },
      { $unwind: { path: '$panchayatDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                _id: 1,
                visitId: 1,
                status: 1,
                schedule: 1,
                remark: 1,
                logs: 1,
                createdAt: 1,
                updatedAt: 1,
                grievance: {
                  _id: '$grievance._id',
                  grievanceId: '$grievance.grievanceId',
                  status: '$grievance.status',
                  assignedPriority: '$grievance.assignedPriority',
                  citizenInfo: '$grievance.citizenInfo',
                  geotaggedImages: '$grievance.geotaggedImages',
                  createdAt: '$grievance.createdAt',
                  department: {
                    _id: '$departmentDetails._id',
                    name: '$departmentDetails.name',
                    code: '$departmentDetails.code',
                  },
                  service: {
                    _id: '$serviceDetails._id',
                    title: '$serviceDetails.title',
                    titleHindi: '$serviceDetails.titleHindi',
                  },
                  location: {
                    district: '$districtDetails.name',
                    block: '$blockDetails.name',
                    panchayat: '$panchayatDetails.name',
                    address: '$grievance.location.address',
                    pincode: '$grievance.location.pincode',
                  },
                },
                assignedOfficer: {
                  _id: '$assignedOfficer._id',
                  name: '$assignedOfficer.name',
                  userCode: '$assignedOfficer.userCode',
                  email: '$assignedOfficer.email',
                  phone: '$assignedOfficer.phone',
                },
              },
            },
          ],
        },
      },
    ];

    const [facetResult] = await FieldVisit.aggregate(pipeline);

    const total = facetResult?.metadata?.[0]?.total || 0;
    const data = facetResult?.data || [];
    const totalPages = Math.ceil(total / limitNum) || 1;

    return new ApiResponse({
      res,
      status: 200,
      data: {
        date: cleanDateStr,
        docs: data,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
      message: 'Field visits for the selected date fetched successfully',
    });
  });
}
