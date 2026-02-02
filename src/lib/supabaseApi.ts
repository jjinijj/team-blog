import { supabase } from "../supabaseClient";
import type { Post } from '../types/Post';

// CREATE
export const createPost = async (post: Post): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .insert([{
            id: post.id,
            title: post.title,
            content: post.content,
            fontSize: post.fontSize,
            isBold: post.isBold,
            isItalic: post.isItalic,
            isUnderline: post.isUnderline,
            textColor: post.textColor,
            createdAt: post.createdAt,
            isMarkdown: post.isMarkdown,
        }])
        .select();

    if (error) {
        console.error('글 생성 실패:', error);
        throw error;
    }

    return data[0];
};

// READ
export const readPost = async (): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users!author_id (
                email
            )
        `);

    if (error) {
        console.error('글 가져오기 실패:', error);
        throw error;
    }

    return data.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        fontSize: post.fontSize,
        isBold: post.isBold,
        isItalic: post.isItalic,
        isUnderline: post.isUnderline,
        textColor: post.textColor,
        createdAt: post.createdAt,
        isMarkdown: post.isMarkdown,
        author_id: post.author_id,
        author_email: post.users?.email || null,
    }));
};

// UPDATE
export const updatePost = async (post: Post): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .update({
            title: post.title,
            content: post.content,
            fontSize: post.fontSize,
            isBold: post.isBold,
            isItalic: post.isItalic,
            isUnderline: post.isUnderline,
            textColor: post.textColor,
            isMarkdown: post.isMarkdown,
        })
        .eq('id', post.id)
        .select();

    if (error) {
        console.error('글 업데이트 실패:', error);
        throw error;
    }

    return data[0];
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