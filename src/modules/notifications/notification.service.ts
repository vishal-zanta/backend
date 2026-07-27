import mongoose from 'mongoose';
import { Notification } from './notification.model.js';
import { User } from '../users/user.model.js';
import { Role } from '../roles/role.model.js';

export class NotificationService {
  /**
   * Base method to send a single notification
   */
  static async sendNotification(data: {
    recipient: mongoose.Types.ObjectId | string;
    title: string;
    message: string;
    type?: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
    referenceId?: mongoose.Types.ObjectId | string;
    referenceModel?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await Notification.create(data);
      // Future enhancement: emit to socket.io here for real-time delivery
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  /**
   * Base method to send notification to all users having a specific role
   */
  static async sendToRole(roleNameOrLevel: string, data: {
    title: string;
    message: string;
    type?: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
    referenceId?: mongoose.Types.ObjectId | string;
    referenceModel?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const role = await Role.findOne({ 
        $or: [
          { level: roleNameOrLevel },
          { designationEnglish: new RegExp(`^${roleNameOrLevel}$`, 'i') }
        ]
      });
      if (!role) return;

      const users = await User.find({ role: role._id, status: 'ACTIVE' }).select('_id');
      const notifications = users.map(u => ({
        recipient: u._id,
        ...data
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error(`Failed to send notification to role ${roleNameOrLevel}:`, error);
    }
  }

  // ---------------------------------------------------------
  // Specific Use Cases as requested
  // ---------------------------------------------------------

  static async notifyOfficerAssignment(officerId: any, grievanceId: any, grievanceRef: string, isReassignment = false) {
    const title = isReassignment ? "Grievance Re-assigned" : "Grievance Assigned";
    const message = `Grievance #${grievanceRef} has been ${isReassignment ? 're-assigned' : 'assigned'} to you.`;
    await this.sendNotification({ recipient: officerId, title, message, type: 'INFO', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
  }

  static async notifyTransfer(officerId: any, grievanceId: any, grievanceRef: string) {
    const title = "Grievance Transferred";
    const message = `Grievance #${grievanceRef} has been transferred to you.`;
    await this.sendNotification({ recipient: officerId, title, message, type: 'INFO', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
  }

  static async notifyEscalation(officerId: any, supervisorId: any, grievanceId: any, grievanceRef: string) {
    const title = "Grievance Auto-Escalated";
    const message = `Grievance #${grievanceRef} has been escalated.`;
    await this.sendNotification({ recipient: officerId, title, message, type: 'ALERT', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
    
    if (supervisorId) {
      await this.sendNotification({ 
        recipient: supervisorId, 
        title: "Escalation Received", 
        message: `Grievance #${grievanceRef} has been escalated to you.`, 
        type: 'ALERT', 
        referenceId: grievanceId, 
        referenceModel: 'Grievance',
        metadata: { grievanceRef }
      });
    }
  }

  static async notifySLAWarning(officerId: any, grievanceId: any, grievanceRef: string) {
    const title = "SLA Warning (Nearing Breach)";
    const message = `Grievance #${grievanceRef} is nearing its SLA breach time.`;
    await this.sendNotification({ recipient: officerId, title, message, type: 'WARNING', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
  }

  static async notifySLABreach(grievanceId: any, grievanceRef: string) {
    const title = "SLA Breached";
    const message = `Grievance #${grievanceRef} has breached its SLA.`;
    await this.sendToRole('ADMIN', { title, message, type: 'ALERT', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
  }

  static async notifyNewComplaint(grievanceId: any, grievanceRef: string) {
    const title = "New Complaint Created";
    const message = `A new grievance #${grievanceRef} has been registered.`;
    await this.sendToRole('CCE', { title, message, type: 'INFO', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
  }

  static async notifyFeedbackReminder(grievanceId: any, grievanceRef: string) {
    const title = "Feedback Call Reminder";
    const message = `Grievance #${grievanceRef} has been resolved. Please call the citizen for feedback.`;
    await this.sendToRole('CCE', { title, message, type: 'INFO', referenceId: grievanceId, referenceModel: 'Grievance', metadata: { grievanceRef } });
  }

  static async notifyTaggingGap(subServiceId: string, ward: string = 'N/A', grievanceId?: any, grievanceRef?: string) {
    let subServiceName = String(subServiceId);
    try {
      // Lazy load to avoid circular dependencies and get the friendly name
      const { SubService } = await import('../services/subService.model.js');
      const subService = await SubService.findById(subServiceId).select('title titleHindi');
      if (subService) {
        subServiceName = subService.title || subService.titleHindi || subServiceName;
      }
    } catch (e) {
      console.error("Error looking up SubService for Tagging Gap notification", e);
    }
    
    const finalWard = ward ? ward : 'N/A';
    const title = "Officer Tagging Gap Alert";
    const message = `Auto-assignment failed for Grievance #${grievanceRef || 'Unknown'} - SubService (${subServiceName}) and Ward (${finalWard}). No eligible officer tagging found.`;
    await this.sendToRole('ADMIN', { title, message, type: 'ALERT', referenceId: grievanceId, referenceModel: grievanceId ? 'Grievance' : undefined, metadata: { subServiceId, subServiceName, ward: finalWard, grievanceRef } });
  }
}
