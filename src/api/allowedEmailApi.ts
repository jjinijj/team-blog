import { supabase } from "../supabaseClient";
import type { AllowedEmail } from "../types/Auth";

// Create
export const createAllowedEmail = async (email: string) : Promise<AllowedEmail> => {
    try{
        const {data: {user}} = await supabase.auth.getUser();

        if(!user){
            throw new Error('로그인이 필요합니다.');
        }

        // 이메일 형식 검증
        const emailRegex =/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if(!emailRegex.test(email)){
            throw new Error('올바른 이메일 형식이 아닙니다.');
        }

        const {data, error} = await supabase.from('allowed_emails')
                                            .insert({
                                                email:email.toLowerCase().trim(),
                                                added_by: user.id
                                            })
                                            .select()
                                            .single();
        
        if(error){
            if(error.code === '23505'){
                throw new Error('이미 등록된 이메일입니다.');
            }
            console.error('이메일 추가 실패: ', error);
            throw error;
        }

        return data;
    }catch(error){
        console.error('이메일 추가 중 오류: ', error);
        throw error;
    }
};

// Read
export const readAllowedEmails = async() : Promise<AllowedEmail[]> => {
    try{
        const {data, error} = await supabase.from('allowed_emails')
                                            .select('*')
                                            .order('added_at', {ascending: false});
        if(error){
            console.error('화이트리스트 이메일 목록 조회 실패: ',error);
            throw error;
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            email: item.email,
            added_at: item.added_at,
            added_by: item.added_by,
            added_by_email: item.users?.email || '알 수 없음'
        }));
    }catch(error){
        console.error('화이트리스트 이메일 목록 조회 중 오류: ',error);
        throw error;
    }
};

// Delete
export const deleteAllowedEmail = async(id: string) : Promise<void> =>{
    try{
        const {error} = await supabase.from('allowed_emails')
                                        .delete()
                                        .eq('id', id);

        if(error){
            console.error('이메일 삭제 실패: ', error);
            throw error;
        }
    }catch(error){
        console.error('이메일 삭제 중 오류: ',error);
        throw error;
    }
}

// 화이트리스트에 특정 이메일이 있는지 확인
export const isEmailAllowed = async (email: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('allowed_emails')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (error) {
            console.error('이메일 확인 실패:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('이메일 확인 중 오류:', error);
        return false;
    }
};