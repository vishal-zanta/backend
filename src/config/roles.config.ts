export const ROLES = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  CCE: 'CCE',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

// System role levels that cannot be deleted. Only permissions and designations are editable.
export const SYSTEM_ROLE_LEVELS = ['Admin', 'Supervisor', 'CCE'];
