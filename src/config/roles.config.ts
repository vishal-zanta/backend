export const ROLES = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  CCE: 'CCE',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];
