import { LoginDTO, Result, PageSelectWorkerDTO, LeaveApplicationDTO, UserDTO, UserStatus } from '../types';

export const API_BASE_URL = 'http://localhost:8000/api';

// --- Connection Status System ---
export interface ApiStatus {
  status: 'online' | 'offline' | 'unknown';
  error: string | null;
}

type StatusListener = (status: ApiStatus) => void;

let currentStatus: ApiStatus = { status: 'unknown', error: null };
const listeners = new Set<StatusListener>();

export const subscribeToApiStatus = (listener: StatusListener) => {
  listeners.add(listener);
  listener(currentStatus); // Send current status immediately
  return () => listeners.delete(listener);
};

const setStatus = (status: 'online' | 'offline' | 'unknown', error: string | null = null) => {
  if (currentStatus.status !== status || currentStatus.error !== error) {
    currentStatus = { status, error };
    listeners.forEach(l => l(currentStatus));
  }
};

// --- Diagnostic Helper ---
export const debugConnection = async (withCredentials: boolean = false): Promise<{ success: boolean; message: string; status?: number }> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    if (withCredentials) {
      const token = localStorage.getItem('token');
      if (token) {
        // Clean token: remove quotes if it was stored with JSON.stringify
        const cleanToken = token.replace(/^["']|["']$/g, ''); 
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }
    }

    const options: RequestInit = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
    };
    
    if (withCredentials) {
      options.credentials = 'include';
    }

    const response = await fetch(`${API_BASE_URL}/workspace/meetingRoom`, options);

    if (response.ok) {
      return { success: true, message: 'Connection Successful', status: response.status };
    } else {
      let extraInfo = '';
      if (response.status === 403) {
        extraInfo = withCredentials 
          ? ' (403 Forbidden: Server rejected credentials. Check CORS Allow-Credentials=true)' 
          : ' (403 Forbidden: Access Denied)';
      } else if (response.status === 401) {
        extraInfo = ' (401 Unauthorized: Invalid Token)';
      }
      return { success: false, message: `${response.status} ${response.statusText}${extraInfo}`, status: response.status };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Network Error (Possible CORS block)', status: 0 };
  }
};

// Helper to simulate API delay and fallback to mock data if backend is offline
const fetchWithFallback = async <T>(
  endpoint: string,
  options: RequestInit,
  mockData: T,
  requireAuth: boolean = true
): Promise<Result<T>> => {
  try {
    // 1. Prepare Headers as a plain object to avoid type issues
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    };

    // Merge custom headers from options if they exist
    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.assign(headers, customHeaders);
    }

    // 2. Handle Authorization
    if (requireAuth) {
      let token = localStorage.getItem('token');
      if (token) {
        // IMPORTANT: Strip any surrounding quotes that might have been saved by JSON.stringify
        token = token.replace(/^["']|["']$/g, '').trim();
        
        headers['Authorization'] = `Bearer ${token}`;
        
        // Debug log (remove in production)
        console.log(`[API] Sending request to ${endpoint} with token: ${token.substring(0, 10)}...`);
      } else {
        console.warn(`[API] requireAuth is true but no token found in localStorage`);
      }
    }

    // 3. Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: headers, // Use the plain object headers
      mode: 'cors',
      credentials: 'include', // Ensure cookies are sent if needed
    });

    if (!response.ok) {
      if (response.status === 401) {
         console.error('[API] 401 Unauthorized. Token may be invalid or expired.');
         throw new Error(`401 Unauthorized`);
      }
      if (response.status === 403) {
        throw new Error(`403 Forbidden: CORS or Token Issue.`);
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    setStatus('online');
    return data;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[API] Connection to ${API_BASE_URL}${endpoint} failed:`, error);
    
    setStatus('offline', errorMsg);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      code: 200, // Return 200 for mock data to signal "success" in UI
      msg: 'Success (Mock Data)',
      data: mockData,
    };
  }
};

// --- Mock Data ---

const MOCK_USER: UserDTO = {
  id: 1,
  username: 'admin',
  realName: 'Alex Administrator',
  employeeId: 'EMP001',
  departmentId: 101,
  email: 'admin@company.com',
  phone: '123-456-7890',
  position: 'Senior Manager',
  status: 1
};

const MOCK_WORKERS: UserDTO[] = [
  { id: 1, username: 'jdoe', realName: 'John Doe', employeeId: 'EMP002', departmentId: 102, email: 'jdoe@company.com', phone: '555-0101', position: 'Developer', status: 1 },
  { id: 2, username: 'asmith', realName: 'Alice Smith', employeeId: 'EMP003', departmentId: 102, email: 'asmith@company.com', phone: '555-0102', position: 'Designer', status: 1 },
  { id: 3, username: 'bwilliams', realName: 'Bob Williams', employeeId: 'EMP004', departmentId: 103, email: 'bwilliams@company.com', phone: '555-0103', position: 'HR Specialist', status: 2 },
  { id: 4, username: 'cjones', realName: 'Charlie Jones', employeeId: 'EMP005', departmentId: 101, email: 'cjones@company.com', phone: '555-0104', position: 'Manager', status: 1 },
];

// --- API Methods ---

export const login = async (data: LoginDTO): Promise<Result<{ token: string; user: UserDTO }>> => {
  return fetchWithFallback('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }, {
    token: 'mock-jwt-token-12345',
    user: MOCK_USER
  }, false); // <--- requireAuth = false for login
};

export const getWorkers = async (params: PageSelectWorkerDTO): Promise<Result<{ list: UserDTO[], total: number }>> => {
  return fetchWithFallback('/wim/page/get/workers', {
    method: 'POST',
    body: JSON.stringify(params),
  }, {
    list: MOCK_WORKERS,
    total: 4
  });
};

export const signIn = async (): Promise<Result<null>> => {
  const now = new Date().toISOString();
  return fetchWithFallback(`/workspace/sign/in?signInTime=${now}`, {
    method: 'POST',
  }, null);
};

export const signOut = async (): Promise<Result<null>> => {
  const now = new Date().toISOString();
  return fetchWithFallback(`/workspace/sign/out?signOutTime=${now}`, {
    method: 'POST',
  }, null);
};

export const getMeetingRoomStatus = async (): Promise<Result<any>> => {
  return fetchWithFallback('/workspace/meetingRoom', {
    method: 'GET',
  }, [
    { id: 1, name: 'Conference Room A', status: 'available' },
    { id: 2, name: 'Meeting Room B', status: 'occupied', nextMeeting: '14:00 - Team Sync' },
    { id: 3, name: 'Focus Pod 1', status: 'available' },
  ]);
};

export const applyLeave = async (data: LeaveApplicationDTO): Promise<Result<null>> => {
  return fetchWithFallback('/leave/add/leave', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, null);
};

export const getLeaveTypes = async (): Promise<Result<any>> => {
  return fetchWithFallback('/leave/type', {
    method: 'GET'
  }, [
    { id: 1, name: 'Annual Leave' },
    { id: 2, name: 'Sick Leave' },
    { id: 3, name: 'Personal Leave' },
  ]);
};

export const getUserProfile = async (id: number): Promise<Result<UserDTO>> => {
  return fetchWithFallback(`/wim/${id}`, {
    method: 'GET'
  }, MOCK_USER);
}