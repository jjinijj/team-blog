export interface User{
    id: string;
    email: string;
    created_at: string;
}

export interface AuthState{
    user: User | null;
    loading: boolean;
}

export interface LoginForData{
    email: string;
    password: string;
}

export interface SignupFormData{
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AllowedEmail{
    id: string;
    email: string;
    added_at: string;
    added_by: string | null;
}