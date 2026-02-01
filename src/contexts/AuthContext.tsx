import { Children, createContext, ReactNode, useContext, useEffect, useState } from "react";
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

    useEffect(()=>{
        // 초기 세션 확인
        supabase.auth.getSession().then(({data:{session}}) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 세션 변경 구독(로그인/로그아웃 시 자동 업데이트)
        const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 컴포넌트 언마운트 시 구독 해제
        return () => {subscription.unsubscribe();}
    },[])

    const signUp = async(email: string, password: string) => {
        try{
            // 1. 이메일 화이트리스트 체크
            const {data: allowedEmail, error: checkError} = await supabase
                .from('allowed_emails')
                .select('email')
                .eq('email',email).single();

            if(checkError || !allowedEmail){
                return{
                    error: new Error('허용되지 않은 이메일입니다. 관리자에게 문의하세요.')
                };
            }

            // 2.회원가입 진행
            const {error: signUpError} = await supabase.auth.signUp({
                email, password
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
                email, password
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
        }catch(err){
            console.error('로그아웃 중 오류: ', err)
        }
    }

    const value = {
        user,
        loading,
        signUp: signUp,
        signIn: signIn,
        signOut: signOut,
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