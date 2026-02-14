import { supabase } from "../supabaseClient"

const tableName = 'comments'

export const fetchComment = async (postId: string) => {

    try{
        const {data, error} = await supabase.from(tableName)
                                            .select(`
                                                *,
                                                author:public.users!author_id(email)
                                                `)
                                                .eq('post_id', postId)
                                                .order('create_at', {ascending: false});

        if(error){
            console.error("fetchComment fail : ",error);
            throw error;
        }

        return data;

    }catch(e){
        console.error('Error fetching comments: ', e);
    }

    return null;
}
export const createComment = async(postId: string, authorId : string, content: string) => {
    try{
        const {data, error} = await supabase.from(tableName)
                                            .insert({
                                                post_id: postId,
                                                author_id: authorId,
                                                content: content.trim()
                                            })
                                            .select(`
                                                *,
                                                author:public.users!author_id(email)
                                                `)
                                            .single();

        if(error){
            console.error('createComment fail: ', error);
            throw error;
        }

        return data;

    }catch(e){
        console.error('Error creating comment: ', e);
    }

    return null;
}

export const updateComment = async(commentId: string, content: string) => {
    try{
        const {data, error} = await supabase.from(tableName)
                                        .update({
                                            content: content.trim(),
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', commentId);

        if(error){
            console.error('updateComment fail: ',error);
            throw error;
        }

        return data;

    }catch(e){
        console.error('Error updating comment: ', e);
    }

    return null;
}

export const deleteComment = async(CommentId: string) => {
    if(!confirm('댓글을 삭제하시겠습니까?'))
            return;

    try{
        const {error} = await supabase.from(tableName)
                                        .delete()
                                        .eq('id', CommentId);

        if(error){
            console.error('deleteComment fail: ', error);
            throw error;
        }
        
    }catch(e){
        console.error('Error deleting comment: ',e);
    }
}