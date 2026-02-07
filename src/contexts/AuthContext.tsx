import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { User } from '@supabase/supabase-js';
import { AuthState } from "../types/Auth"

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
    const [isAdmin, setIsAdmin] = useState(false);

    // ✅ Auth 완전 초기화 후 실행되도록 수정
    const checkAdminStatus = async (userId: string) => {
        console.log("🔴 [checkAdminStatus] 시작, userId:", userId);
        
        try {
            
            console.log("🟡 쿼리 시작");
            
            const { data, error } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', userId)
                .single();
            
            console.log("🟢 쿼리 완료!", { data, error });
            
            if (error) {
                console.error("❌ [checkAdminStatus] 에러:", error);
                setIsAdmin(false);
                return;
            }
            
            console.log("👤 [checkAdminStatus] is_admin:", data?.is_admin);
            setIsAdmin(data?.is_admin ?? false);
            
        } catch (error) {
            console.error("🔴 [checkAdminStatus] catch:", error);
            setIsAdmin(false);
        }
        
        console.log("🏁 [checkAdminStatus] 함수 끝");
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log("📌 Auth 초기화 시작");
                
                // 1. 세션 가져오기
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                console.log("📌 초기 세션:", session?.user?.email);
                
                // 2. 세션이 있으면 다음 이벤트 루프에서 isAdmin 확인
                if (session?.user) {
                    // ✅ setTimeout으로 Auth 완전 초기화 후 실행
                    setTimeout(async () => {
                        await checkAdminStatus(session.user.id);
                    }, 0);
                }
                
                setLoading(false);
                console.log("✅ Auth 초기화 완료");
                
            } catch (error) {
                console.error("❌ Auth 초기화 오류:", error);
                setLoading(false);
            }
        };
        
        initializeAuth();
        
        // Auth 상태 변경 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log("🔄 Auth 상태 변경:", _event, session?.user?.email);
            setUser(session?.user ?? null);
            
            if (session?.user) {
                // ✅ 여기도 setTimeout 추가
                setTimeout(async () => {
                    await checkAdminStatus(session.user.id);
                }, 100);
            } else {
                setIsAdmin(false);
            }
            
            setLoading(false);
        });
        
        return () => { 
            console.log("🔌 Auth 구독 해제");
            subscription.unsubscribe(); 
        }
    }, []);

    const signUp = async(email: string, password: string) => {
        try{
            // 1. 이메일 화이트리스트 체크
            const {data: allowedEmail, error: checkError} = await supabase
                .from('allowed_emails')
                .select('email')
                .eq('email',email)
                .single();

            if(checkError || !allowedEmail){
                console.log("화이트리스트 체크 실패:", {email, checkError, allowedEmail});
                return{
                    error: new Error('허용되지 않은 이메일입니다. 관리자에게 문의하세요.')
                };
            }

            // 2.회원가입 진행
            const {error: signUpError} = await supabase.auth.signUp({
                email, 
                password
            });

            if(signUpError){
                return {error: signUpError};
            }

            return {error: null};
        }catch(err){
            return{
                error: new Error('회원가입 중 오류가 발생했습니다.')
            };
        }
    };

    const signIn = async(email: string, password: string) => {
        try{
            const {error} = await supabase.auth.signInWithPassword({
                email, 
                password
            });

            if(error){
                return {error};
            }

            return {error: null};
        }catch(err){
            return {
                error : new Error('로그인 중 오류가 발생했습니다.')
            };
        }
    };

    const signOut = async() =>{
        try{
            await supabase.auth.signOut();
            setIsAdmin(false);
        }catch(err){
            console.error('로그아웃 중 오류: ', err)
        }
    }

    const value = {
        user,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
    };

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// useAuth Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}