export const timelineTemplates = {
  COMPLAINT_REGISTERED: (complaintNo: string, source: string) =>
    `Complaint ${complaintNo} submitted via ${source}`,

  PRIORITY_SET: (priority: string) =>
    `Priority set to ${priority}`,

  STATUS_CHANGE: (oldStatus: string, newStatus: string, remarks?: string) =>
    `Status changed to ${newStatus}${remarks ? `. Reason/Remark: ${remarks}` : ''}`,

  ASSIGNED: (assigneeRole: string, assigneeName: string) =>
    `Assigned to ${assigneeRole} `,

  SMS_SENT: (phone: string) =>
    `Notification sent to ${phone}`,



  FIELD_VISIT_SCHEDULE: (date: string, remarks?: string) =>
    `Field visit scheduled for ${date}${remarks ? ` - ${remarks}` : ''}`,

  FIELD_VISIT_STATUS: (status: string) =>
    `Field visit status updated to ${status}`,

  FIELD_VISIT_REMARK: (remark: string) =>
    `Field visit remark added: ${remark}`,

  ESCALATED: (slaHours: number | string, level: string, assigneeName: string) =>
    `SLA breached (${slaHours}h). Auto-escalated to ${level} - ${assigneeName}`,

  RESOLVED: (remarks: string) =>
    `Issue addressed. ${remarks}`,

  RESOLUTION_PHOTO: (photoCount: number, latitude: number | string, longitude: number | string) =>
    `${photoCount} photo(s) uploaded with geo-tag (${latitude}, ${longitude})`,

  CITIZEN_FEEDBACK: (rating: number | string, feedback: string) =>
    `Rating: ${rating}/5 - ${feedback}`,

  // COMPLAINT_CLOSED: (afterHours: number | string) =>
  //   `Auto-closed after ${afterHours}h of resolution with no dispute`,
  COMPLAINT_CLOSED: (afterHours: number | string, remarks?: string) =>
    `Closed after ${afterHours}h of resolution with no dispute${remarks ? `. Remark: ${remarks}` : ''}`,
};
