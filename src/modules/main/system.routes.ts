import moment from "moment";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../../utils/apiResponse.js";
import { Router, type Request, type Response } from "express";
import os from "os";
import { execSync } from "child_process"
const router = Router();


/**
 * Get real-time CPU usage percentage
 */
const getCpuUsage = (): number => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - (100 * idle) / total;

  return Math.round(usage * 100) / 100;
};

/**
 * Get real-time RAM usage
 */
const getRamUsage = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usagePercentage = (usedMemory / totalMemory) * 100;

  return {
    total: Math.round((totalMemory / 1024 / 1024 / 1024) * 100) / 100, // GB
    used: Math.round((usedMemory / 1024 / 1024 / 1024) * 100) / 100, // GB
    free: Math.round((freeMemory / 1024 / 1024 / 1024) * 100) / 100, // GB
    usagePercentage: Math.round(usagePercentage * 100) / 100,
  };
};

/**
 * Get real-time disk usage
 */
const getDiskUsage = () => {
  try {
    const platform = os.platform();
    let diskInfo;

    if (platform === "win32") {
      // Windows
      const output = execSync('wmic logicaldisk get size,freespace,caption').toString();
      const lines = output.trim().split('\n').slice(1);
      diskInfo = lines[0].trim().split(/\s+/);
    } else {
      // Linux/Mac
      const output = execSync("df -k /").toString();
      const lines = output.trim().split("\n");
      diskInfo = lines[1].trim().split(/\s+/);
    }

    const total = platform === "win32" ? parseInt(diskInfo[2]) / 1024 / 1024 / 1024 : parseInt(diskInfo[1]) / 1024 / 1024;
    const used = platform === "win32" ? (parseInt(diskInfo[2]) - parseInt(diskInfo[1])) / 1024 / 1024 / 1024 : parseInt(diskInfo[2]) / 1024 / 1024;
    const free = platform === "win32" ? parseInt(diskInfo[1]) / 1024 / 1024 / 1024 : parseInt(diskInfo[3]) / 1024 / 1024;
    const usagePercentage = (used / total) * 100;

    return {
      total: Math.round(total * 100) / 100, // GB
      used: Math.round(used * 100) / 100, // GB
      free: Math.round(free * 100) / 100, // GB
      usagePercentage: Math.round(usagePercentage * 100) / 100,
    };
  } catch (error) {
    return {
      total: 0,
      used: 0,
      free: 0,
      usagePercentage: 0,
      error: "Unable to fetch disk usage",
    };
  }
};

/**
 * Get real-time network usage
 */
const getNetworkUsage = () => {
  const networkInterfaces = os.networkInterfaces();
  const interfaces = Object.keys(networkInterfaces).map((name) => {
    const iface = networkInterfaces[name];
    const ipv4 = iface?.find((i) => i.family === "IPv4");
    return {
      name,
      address: ipv4?.address || "N/A",
      mac: ipv4?.mac || "N/A",
    };
  });

  return {
    interfaces,
    hostname: os.hostname(),
  };
};

router.get("/health", (req: Request, res: Response) => {
  const currentTime = moment().format("hh:mm A Do MMMM YYYY");

  // Get real-time system usage
  const cpuUsage = getCpuUsage();
  const ramUsage = getRamUsage();
  const diskUsage = getDiskUsage();
  const networkUsage = getNetworkUsage();

  new ApiResponse({
    res,
    status: StatusCodes.OK,
    message: "Server is healthy",
    data: {
      time: currentTime,
      cpu: {
        usagePercentage: cpuUsage,
        cores: os.cpus().length,
      },
      ram: ramUsage,
      disk: diskUsage,
      network: networkUsage,
    },
  });
});


export default router;