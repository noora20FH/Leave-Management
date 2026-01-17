export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  annual_leave_quota: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}