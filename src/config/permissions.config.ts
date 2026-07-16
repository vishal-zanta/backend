export const API_PERMISSIONS = {
  // Grievance Management
  ALL_GRIEVANCE: "ALL_GRIEVANCE",
  CREATE_GRIEVANCE: "CREATE_GRIEVANCE",
  UPDATE_GRIEVANCE: "UPDATE_GRIEVANCE",
  ASSIGN_GRIEVANCE: "ASSIGN_GRIEVANCE",


  // Master Admin Permission
  ALL: "ALL",
} as const;

export type ApiPermission = keyof typeof API_PERMISSIONS;

export const PERMISSIONS_LIST = Object.values(API_PERMISSIONS);
