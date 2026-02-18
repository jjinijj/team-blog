import { supabase } from "../supabaseClient";
import type { Post, NewPost, UpdatePost } from '../types/Post';

const mapPost = (post: any): Post => ({
    id: post.id,
    title: post.title,

    content: post.content ?? "",
    content_json: post.content_json ?? null,
    content_type: post.content_type ?? null,

    created_at: post.created_at,
    updated_at: post.updated_at,

    author_id: post.author_id,
    author_email: post.users?.email ?? null,

    // 레거시 fallback
    isMarkdown: post.isMarkdown ?? false,
});


// CREATE
export const createPost = async (post: NewPost): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .insert([{
            title: post.title,

            content: post.content ?? "",
            content_json: post.content_json ?? null,
            content_type: post.content_type ?? null,

            author_id: post.author_id,

            // 레거시 유지용
            isMarkdown: post.content_type === 'markdown',
        }])
        .select(`
            *,
            users!author_id (email)
        `)
        .single();

    if (error) throw error;

    return mapPost(data);
};


// READ
export const readPost = async (): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users!author_id (email)
        `)
        .order('createdAt', { ascending: false });

    if (error) throw error;

    return data.map(mapPost);
};


// UPDATE
export const updatePost = async (post: UpdatePost): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .update({
            title: post.title,

            content: post.content ?? "",
            content_json: post.content_json ?? null,
            content_type: post.content_type ?? null,

            isMarkdown: post.content_type === 'markdown',
        })
        .eq('id', post.id)
        .select(`
            *,
            users!author_id (email)
        `)
        .single();

    if (error) throw error;

    return mapPost(data);
};


// DELETE
export const deletePost = async (postId: string): Promise<void> => {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('글 삭제 실패:', error);
        throw error;
    }
};

// DELETE MULTIPLE
export const deleteMultiplePosts = async (postIds: string[]): Promise<void> => {
    const { error } = await supabase
        .from('posts')
        .delete()
        .in('id', postIds);

    if (error) {
        console.error('글 여러개 삭제 실패:', error);
        throw error;
    }
};