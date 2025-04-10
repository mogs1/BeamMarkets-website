export interface UserType {
    id: string;
    fullName: string;
    email: string;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: UserType | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    fullName: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    user: UserType;
    token: string;
  }