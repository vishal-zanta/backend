import axios from 'axios';

const AVAYA_BASE_URL = 'http://avaya.lumirex.tech/api/telephony';

export class AvayaService {
  /**
   * 1. Connect to Avaya PBX
   */
  static async connectSystem(adminProviderString: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/system/connect`, { adminProviderString });
    return response.data;
  }

  /**
   * 2. Make a Phone Call (Click-to-Call)
   */
  static async makeCall(sourceExtension: string, clientNumber: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call`, { sourceExtension, clientNumber });
    return response.data;
  }

  /**
   * 2b. Answer/Accept an Incoming Call
   */
  static async answerCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/answer`, { extension });
    return response.data;
  }

  /**
   * 3. Start Webhook Monitoring for Multiple Extensions
   */
  static async monitorExtensions(extensions: string[], webhookUrl: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/monitor`, { extensions, webhookUrl });
    return response.data;
  }

  /**
   * 4. Agent Login
   */
  static async agentLogin(agentId: string, extension: string, password?: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/agent/login`, { agentId, extension, password });
    return response.data;
  }

  /**
   * 5. Change Agent State
   */
  static async setAgentState(agentId: string, isAvailable: boolean) {
    const response = await axios.post(`${AVAYA_BASE_URL}/agent/state`, { agentId, isAvailable });
    return response.data;
  }

  /**
   * 6. Agent Logout
   */
  static async agentLogout(agentId: string, extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/agent/logout`, { agentId, extension });
    return response.data;
  }

  /**
   * 7. Get Live Agent Status in a Queue
   */
  static async getQueueAgents(queue: string) {
    const response = await axios.get(`${AVAYA_BASE_URL}/queue/${queue}/agents`);
    return response.data;
  }

  /**
   * 8. Find where a specific Agent is Logged In
   */
  static async getAgentStatus(agentId: string) {
    const response = await axios.get(`${AVAYA_BASE_URL}/agent/${agentId}/status`);
    return response.data;
  }

  /**
   * 9. Get Active Call Details
   */
  static async getActiveCallDetails(extension: string) {
    const response = await axios.get(`${AVAYA_BASE_URL}/call/${extension}/details`);
    return response.data;
  }

  /**
   * 10. Get Call History
   */
  static async getCallHistory() {
    const response = await axios.get(`${AVAYA_BASE_URL}/call/history`);
    return response.data;
  }
}
