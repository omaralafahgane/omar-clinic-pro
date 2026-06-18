export type Role = 'owner' | 'admin' | 'doctor' | 'receptionist' | 'accountant';

export type Permission = 
  | 'patients.view' | 'patients.create' | 'patients.edit' | 'patients.delete'
  | 'invoices.view' | 'invoices.create' | 'invoices.edit' | 'invoices.delete'
  | 'appointments.view' | 'appointments.create' | 'appointments.edit'
  | 'settings.view' | 'settings.edit'
  | 'reports.view'
  | 'doctors.view' | 'doctors.create' | 'doctors.edit' | 'doctors.delete'
  | 'inventory.view' | 'inventory.create' | 'inventory.edit' | 'inventory.delete'
  | 'prescriptions.view' | 'prescriptions.create' | 'prescriptions.edit' | 'prescriptions.delete';

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  ACCOUNTANT: "accountant",
};

export const PERMISSIONS = {
  PATIENT_READ: "patients.view",
  PATIENT_CREATE: "patients.create",
  PATIENT_UPDATE: "patients.edit",
  PATIENT_DELETE: "patients.delete",
  INVOICE_READ: "invoices.view",
  INVOICE_CREATE: "invoices.create",
  INVOICE_UPDATE: "invoices.edit",
  INVOICE_DELETE: "invoices.delete",
  APPOINTMENT_READ: "appointments.view",
  APPOINTMENT_CREATE: "appointments.create",
  APPOINTMENT_UPDATE: "appointments.edit",
  SETTINGS_READ: "settings.view",
  SETTINGS_UPDATE: "settings.edit",
  REPORTS_READ: "reports.view",
  DOCTORS_READ: "doctors.view",
  DOCTORS_CREATE: "doctors.create",
  DOCTORS_UPDATE: "doctors.edit",
  DOCTORS_DELETE: "doctors.delete",
  INVENTORY_READ: "inventory.view",
  INVENTORY_CREATE: "inventory.create",
  INVENTORY_UPDATE: "inventory.edit",
  INVENTORY_DELETE: "inventory.delete",
  PRESCRIPTIONS_READ: "prescriptions.view",
  PRESCRIPTIONS_CREATE: "prescriptions.create",
  PRESCRIPTIONS_UPDATE: "prescriptions.edit",
  PRESCRIPTIONS_DELETE: "prescriptions.delete",
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.OWNER]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.PATIENT_DELETE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_DELETE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.DOCTORS_READ,
    PERMISSIONS.DOCTORS_CREATE,
    PERMISSIONS.DOCTORS_UPDATE,
    PERMISSIONS.DOCTORS_DELETE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.PRESCRIPTIONS_READ,
    PERMISSIONS.PRESCRIPTIONS_CREATE,
    PERMISSIONS.PRESCRIPTIONS_UPDATE,
    PERMISSIONS.PRESCRIPTIONS_DELETE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.DOCTORS_READ,
    PERMISSIONS.DOCTORS_CREATE,
    PERMISSIONS.DOCTORS_UPDATE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.PRESCRIPTIONS_READ,
    PERMISSIONS.PRESCRIPTIONS_CREATE,
    PERMISSIONS.PRESCRIPTIONS_UPDATE,
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.PRESCRIPTIONS_READ,
    PERMISSIONS.PRESCRIPTIONS_CREATE,
    PERMISSIONS.PRESCRIPTIONS_UPDATE,
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.REPORTS_READ,
  ],
};

export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(requiredPermission) || false;
}
