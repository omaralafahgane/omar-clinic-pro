export type Role = 'owner' | 'admin' | 'doctor' | 'receptionist' | 'accountant';

export type Permission = 
  | 'patients.view' | 'patients.create' | 'patients.edit' | 'patients.delete'
  | 'invoices.view' | 'invoices.create' | 'invoices.edit' | 'invoices.delete'
  | 'appointments.view' | 'appointments.create' | 'appointments.edit'
  | 'settings.view' | 'settings.edit'
  | 'reports.view';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'patients.view', 'patients.create', 'patients.edit', 'patients.delete',
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'settings.view', 'settings.edit',
    'reports.view'
  ],
  admin: [
    'patients.view', 'patients.create', 'patients.edit',
    'invoices.view', 'invoices.create',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'settings.view', 'settings.edit',
    'reports.view'
  ],
  doctor: [
    'patients.view', 'patients.create', 'patients.edit',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'reports.view'
  ],
  receptionist: [
    'patients.view', 'patients.create',
    'appointments.view', 'appointments.create', 'appointments.edit'
  ],
  accountant: [
    'invoices.view', 'invoices.create', 'invoices.edit',
    'reports.view'
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
