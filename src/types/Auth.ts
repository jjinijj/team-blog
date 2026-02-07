import { User } from "@supabase/supabase-js";

export interface AuthState{
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
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
    added_by_email?: string;
}