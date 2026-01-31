import { Children, createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { User, AuthState } from "../types/Auth"

// Context 타입 정의
interface AuthContextType extends AuthState{
    signUp: (email: string, password: string) => Promise<{error: Error | null}>;
    signIn: (email: string, password: string) => Promise<{error: Error | null}>;
    signOut: () => Promise<void>;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props타입
interface AuthProviderProps{
    children: ReactNode;
}

export const AuthProvider = ({children} : AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    //TODO 동작 수정
    const value = {
        user,
        loading,
        signUp: async () => ({error: null}),
        signIn: async () => ({error: null}),
        signOut: async() => {},
    };

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// useAuth Hool
export const useAuth = () => {
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}