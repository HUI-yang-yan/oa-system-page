export interface Result<T = any> {
  code: number;
  msg: string | null;
  data: T;
}

export interface UserDTO {
  id: number;
  username: string;
  employeeId: string;
  departmentId: number;
  status: number;
  position: string;
  realName: string;
  email: string;
  phone: string;
}

export interface LoginDTO {
  username: string;
  password?: string;
}

export interface LeaveApplicationDTO {
  leaveTypeId: number;
  startTime: string; // date format
  endTime: string; // date format
  reason: string;
}

export interface PageSelectWorkerDTO {
  pageNum: number;
  pageSize: number;
  username?: string;
  employeeId?: string;
  departmentId?: number;
  status?: number;
  position?: string;
  startTime?: string;
}

export interface Role {
  id: number;
  roleName: string;
  roleCode: string;
}

// UI Specific Types
export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  LEAVE = 2
}

export interface MeetingRoomStatus {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  nextMeeting?: string;
}

export interface EquipmentStatus {
  total: number;
  available: number;
  maintenance: number;
}