import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { User } from '@supabase/supabase-js';
import { AuthState } from "../types/Auth"

interface AuthContextType extends AuthState {
    signUp: (email: string, password: string, displayName: string) => Promise<{error: Error | null}>;
    signIn: (email: string, password: string) => Promise<{error: Error | null}>;
    signOut: () => Promise<void>;
    refreshUserInfo: () => Promise<void>;
    profileReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({children} : AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileReady, setProfileReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [avatarColor, setAvatarColor] = useState<string>('#3b82f6');

    const fetchUserInfo = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('is_admin, display_name, avatar_color')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("❌ [fetchUserInfo] 에러:", error);
                setIsAdmin(false);
            } else {
                setIsAdmin(data?.is_admin ?? false);
                setDisplayName(data?.display_name ?? null);
                setAvatarColor(data?.avatar_color ?? '#3b82f6');
            }
        } catch (error) {
            console.error("🔴 [fetchUserInfo] catch:", error);
            setIsAdmin(false);
        } finally {
            setProfileReady(true);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                const timeout = setTimeout(() => setProfileReady(true), 3000);
                fetchUserInfo(session.user.id).finally(() => clearTimeout(timeout));
            } else {
                setIsAdmin(false);
                setDisplayName(null);
                setAvatarColor('#3b82f6');
                setProfileReady(true);
            }

            if (event === 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => { subscription.unsubscribe(); }
    }, []);

    const signUp = async(email: string, password: string, displayName: string) => {
        try {
            const {data: allowedEmail, error: checkError} = await supabase
                .from('allowed_emails')
                .select('email')
                .eq('email', email)
                .single();

            if (checkError || !allowedEmail) {
                return { error: new Error('허용되지 않은 이메일입니다. 관리자에게 문의하세요.') };
            }

            const {error: signUpError} = await supabase.auth.signUp({
                email,
                password,
                options: { data: { display_name: displayName.trim() } },
            });
            if (signUpError) return {error: signUpError};

            return {error: null};
        } catch(err) {
            return { error: new Error('회원가입 중 오류가 발생했습니다.') };
        }
    };

    const signIn = async(email: string, password: string) => {
        try {
            const {error} = await supabase.auth.signInWithPassword({ email, password });
            if (error) return {error};
            return {error: null};
        } catch(err) {
            return { error: new Error('로그인 중 오류가 발생했습니다.') };
        }
    };

    const signOut = async() => {
        try {
            await supabase.auth.signOut();
            setIsAdmin(false);
            setDisplayName(null);
            setAvatarColor('#3b82f6');
        } catch(err) {
            console.error('로그아웃 중 오류: ', err);
        }
    };

    const refreshUserInfo = async () => {
        if (user) await fetchUserInfo(user.id);
    };

    const value = {
        user,
        loading,
        profileReady,
        isAdmin,
        displayName,
        avatarColor,
        signUp,
        signIn,
        signOut,
        refreshUserInfo,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}