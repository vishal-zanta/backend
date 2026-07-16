export const timelineTemplates = {
  COMPLAINT_REGISTERED: (complaintNo: string, source: string) =>
    `Complaint ${complaintNo} submitted via ${source}`,

  PRIORITY_SET: (priority: string) =>
    `Priority set to ${priority}`,

  STATUS_CHANGE: (oldStatus: string, newStatus: string) =>
    `Status changed from ${oldStatus} to ${newStatus}`,

  ASSIGNED: (assigneeRole: string, assigneeName: string) =>
    `Assigned to ${assigneeRole} — ${assigneeName}`,

  SMS_SENT: (phone: string) =>
    `Notification sent to ${phone}`,

  FIELD_VISIT: (remarks: string) =>
    `${remarks}`,

  ESCALATED: (slaHours: number | string, level: string, assigneeName: string) =>
    `SLA breached (${slaHours}h). Auto-escalated to ${level} — ${assigneeName}`,

  RESOLVED: (remarks: string) =>
    `Issue addressed. ${remarks}`,

  RESOLUTION_PHOTO: (photoCount: number, latitude: number | string, longitude: number | string) =>
    `${photoCount} photo(s) uploaded with geo-tag (${latitude}, ${longitude})`,

  CITIZEN_FEEDBACK: (rating: number | string, feedback: string) =>
    `Rating: ${rating}/5 — ${feedback}`,

  COMPLAINT_CLOSED: (afterHours: number | string) =>
    `Auto-closed after ${afterHours}h of resolution with no dispute`,
};
