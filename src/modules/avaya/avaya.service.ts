import axios from 'axios';

const AVAYA_BASE_URL = process.env.AVAYA_BASE_URL || 'https://avaya.lumirex.tech/api/telephony';

export class AvayaService {

  // 1. Connect to Avaya PBX
  static async connectSystem(adminProviderString: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/system/connect`, { adminProviderString });
    return response.data;
  }

  // 2. Make a Phone Call (Click-to-Call)
  static async makeCall(sourceExtension: string, clientNumber: string) {
    const cleaned = String(clientNumber || '').replace(/\D/g, '');
    const last10 = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
    const formattedClientNumber = `0${last10}`;

    const response = await axios.post(`${AVAYA_BASE_URL}/call`, {
      sourceExtension,
      clientNumber: formattedClientNumber,
    });
    return response.data;
  }

  // 2b. Answer/Accept an Incoming Call
  static async answerCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/answer`, { extension });
    return response.data;
  }

  // 2c. Hold Call
  static async holdCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/hold`, { extension });
    return response.data;
  }

  // 2d. Unhold / Retrieve Call
  static async unholdCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/unhold`, { extension });
    return response.data;
  }

  // 2e. Mute Call
  static async muteCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/mute`, { extension });
    return response.data;
  }

  // 2f. Unmute Call
  static async unmuteCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/unmute`, { extension });
    return response.data;
  }

  // 2g. Drop / Hangup Call
  static async dropCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/drop`, { extension });
    return response.data;
  }

  // 2h / 2k. Transfer Call (Blind Transfer if destination provided; Complete Attended Transfer if no destination)
  static async transferCall(extension: string, destination?: string) {
    const payload: any = { extension };
    if (destination) {
      payload.destination = destination;
    }
    const response = await axios.post(`${AVAYA_BASE_URL}/call/transfer`, payload);
    return response.data;
  }

  // 2i. Consultation Call (Put customer on hold & consult supervisor/agent)
  static async consultCall(extension: string, destination: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/consult`, { extension, destination });
    return response.data;
  }

  // 2j. Cancel Consultation Call (Drop consult & return to customer)
  static async cancelConsultCall(extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/call/consult/cancel`, { extension });
    return response.data;
  }

  // 2l. Conference Call (Merge ongoing consult into 3-way conference OR add party)
  static async conferenceCall(extension: string, destination?: string) {
    const payload: any = { extension };
    if (destination) {
      payload.destination = destination;
    }
    const response = await axios.post(`${AVAYA_BASE_URL}/call/conference`, payload);
    return response.data;
  }

  // 3. Start Webhook Monitoring for Multiple Extensions
  static async monitorExtensions(extensions: string[], webhookUrl: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/monitor`, { extensions, webhookUrl });
    return response.data;
  }

  // 4. Agent Login
  static async agentLogin(agentId: string, extension: string, password?: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/agent/login`, { agentId, extension, password });
    return response.data;
  }

  // 5. Change Agent State
  static async setAgentState(agentId: string, isAvailable: boolean) {
    const response = await axios.post(`${AVAYA_BASE_URL}/agent/state`, { agentId, isAvailable });
    return response.data;
  }

  // 6. Agent Logout
  static async agentLogout(agentId: string, extension: string) {
    const response = await axios.post(`${AVAYA_BASE_URL}/agent/logout`, { agentId, extension });
    return response.data;
  }

  // 7. Get Live Agent Status in a Queue
  static async getQueueAgents(queue: string) {
    const response = await axios.get(`${AVAYA_BASE_URL}/queue/${queue}/agents`);
    return response.data;
  }

  // 8. Find where a specific Agent is Logged In
  static async getAgentStatus(agentId: string) {
    const response = await axios.get(`${AVAYA_BASE_URL}/agent/${agentId}/status`);
    return response.data;
  }

  // 9. Get Active Call Details
  static async getActiveCallDetails(extension: string) {
    const response = await axios.get(`${AVAYA_BASE_URL}/call/${extension}/details`);
    return response.data;
  }

  // 10. Get Call History
  static async getCallHistory() {
    const response = await axios.get(`${AVAYA_BASE_URL}/call/history`);
    return response.data;
  }

  // 11. Health Check
  static async healthCheck() {
    const response = await axios.get(`${AVAYA_BASE_URL}/health`);
    return response.data;
  }
}
