export const API_PERMISSIONS = {
  // Grievance Management
  ALL_GRIEVANCE: "ALL_GRIEVANCE",
  CREATE_GRIEVANCE: "CREATE_GRIEVANCE",
  UPDATE_GRIEVANCE: "UPDATE_GRIEVANCE",
  ASSIGN_GRIEVANCE: "ASSIGN_GRIEVANCE",

  // Activity Management
  VIEW_ACTIVE_USERS: "VIEW_ACTIVE_USERS",
  LOGOUT_USERS: "LOGOUT_USERS",

  // complaint Source Management
  SOURCE_MANAGEMENT: "SOURCE_MANAGEMENT",
  
  // Demography Management
  DEMOGRAPHY_MANAGEMENT: "DEMOGRAPHY_MANAGEMENT",

  // Mis Report 
  MIS_REPORT: "MIS_REPORT",

  // Officer tagging

  OFFICER_TAGGING:"OFFICER_TAGGING",

  // Option management

  OPTION_MANAGEMENT:"OPTION_MANAGEMENT",

  // Role management
  ROLE_MANAGEMENT:"ROLE_MANAGEMENT",

  // Service Management
  SERVICE_MANAGEMENT:"SERVICE_MANAGEMENT",

  // SLA Configuration
  SLA_CONFIGURATION:"SLA_CONFIGURATION",

  // User Management
  USER_MANAGEMENT:"USER_MANAGEMENT",

  // Workflow management

  WORKFLOW_MANAGEMENT:"WORKFLOW_MANAGEMENT",



  // Master Admin Permission
  ALL: "ALL",
} as const;

export type ApiPermission = keyof typeof API_PERMISSIONS;

export const PERMISSIONS_LIST = Object.values(API_PERMISSIONS);
