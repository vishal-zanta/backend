export const timelineTemplates = {
  COMPLAINT_REGISTERED: (complaintNo: string, source: string) => ({
    description: `Complaint ${complaintNo} submitted via ${source}`,
    description_local: `शिकायत ${complaintNo} ${source} के माध्यम से दर्ज की गई`,
  }),

  PRIORITY_SET: (priority: string) => ({
    description: `Priority set to ${priority}`,
    description_local: `प्राथमिकता ${priority} पर सेट की गई`,
  }),

  STATUS_CHANGE: (oldStatus: string, newStatus: string, remarks?: string) => ({
    description: `Status changed to ${newStatus}${remarks ? `. Reason/Remark: ${remarks}` : ''}`,
    description_local: `स्थिति बदलकर ${newStatus} कर दी गई${remarks ? `. कारण/टिप्पणी: ${remarks}` : ''}`,
  }),

  ASSIGNED: (assigneeRole: string, assigneeName: string) => ({
    description: `Assigned to ${assigneeRole} - ${assigneeName}`,
    description_local: `${assigneeRole} - ${assigneeName} को सौंपा गया`,
  }),

  SMS_SENT: (phone: string) => ({
    description: `Notification sent to ${phone}`,
    description_local: `${phone} पर सूचना भेजी गई`,
  }),

  FIELD_VISIT_SCHEDULE: (date: string, remarks?: string) => ({
    description: `Field visit scheduled for ${date}${remarks ? ` - ${remarks}` : ''}`,
    description_local: `क्षेत्र भ्रमण ${date} के लिए निर्धारित${remarks ? ` - ${remarks}` : ''}`,
  }),

  FIELD_VISIT_STATUS: (status: string) => ({
    description: `Field visit status updated to ${status}`,
    description_local: `क्षेत्र भ्रमण स्थिति ${status} में अद्यतन की गई`,
  }),

  FIELD_VISIT_REMARK: (remark: string) => ({
    description: `Field visit remark added: ${remark}`,
    description_local: `क्षेत्र भ्रमण टिप्पणी जोड़ी गई: ${remark}`,
  }),

  ESCALATED: (slaHours: number | string, level: string, assigneeName: string) => ({
    description: `SLA breached (${slaHours}h). Auto-escalated to ${level} - ${assigneeName}`,
    description_local: `SLA का उल्लंघन (${slaHours} घंटे)। ${level} - ${assigneeName} को स्वतः बढ़ाया गया`,
  }),

  RESOLVED: (remarks: string) => ({
    description: `Issue addressed. ${remarks}`,
    description_local: `मुद्दे का समाधान किया गया। ${remarks}`,
  }),

  RESOLUTION_PHOTO: (photoCount: number, latitude: number | string, longitude: number | string) => ({
    description: `${photoCount} photo(s) uploaded with geo-tag (${latitude}, ${longitude})`,
    description_local: `${photoCount} तस्वीर(ें) जियो-टैग (${latitude}, ${longitude}) के साथ अपलोड की गईं`,
  }),

  CITIZEN_FEEDBACK: (rating: number | string, feedback: string) => ({
    description: `Rating: ${rating}/5 - ${feedback}`,
    description_local: `रेटिंग: ${rating}/5 - ${feedback}`,
  }),

  COMPLAINT_CLOSED: (afterHours: number | string, remarks?: string) => ({
    description: `Closed after ${afterHours}h of resolution with no dispute${remarks ? `. Remark: ${remarks}` : ''}`,
    description_local: `समाधान के ${afterHours} घंटे बाद बिना किसी विवाद के बंद किया गया${remarks ? `. टिप्पणी: ${remarks}` : ''}`,
  }),
};
