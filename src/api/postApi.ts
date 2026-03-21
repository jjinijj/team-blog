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

    author_name: post.users?.display_name ?? null,
    author_color: post.users?.avatar_color ?? '#3b82f6',

    status: post.status,

    view_count: post.view_count ?? 0,
    is_pinned: post.is_pinned ?? false,

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

            status : post.status,

            // 레거시 유지용
            isMarkdown: post.content_type === 'markdown',
        }])
        .select(`
            *,
            users!author_id(email)
        `)
        .single();

    if (error) throw error;

    return mapPost(data);
};


// READ
export const readPosts = async (): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users!author_id(email,display_name,avatar_color)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapPost);
};

// READ PINNED POSTS
export const readPinnedPosts = async (): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`*, users!author_id(email,display_name,avatar_color)`)
        .eq('status', 'published')
        .eq('is_pinned', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapPost);
};

// READ RECENT POSTS (핀 고정 글 제외, limit 개수만)
export const readRecentPosts = async (limit: number): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`*, users!author_id(email,display_name,avatar_color)`)
        .eq('status', 'published')
        .eq('is_pinned', false)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data.map(mapPost);
};

// SEARCH POSTS (서버사이드 검색 + 정렬 + 페이징)
export const searchPosts = async (options: {
    keyword?: string;
    sort?: 'newest' | 'oldest' | 'popular';
    page: number;
    pageSize: number;
}): Promise<{ data: Post[]; total: number }> => {
    const { keyword, sort = 'newest', page, pageSize } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('posts')
        .select(`*, users!author_id(email,display_name,avatar_color)`, { count: 'exact' })
        .eq('status', 'published');

    if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
    } else {
        // popular: 조회수 내림차순, 동점이면 최신순
        query = query.order('view_count', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return { data: data.map(mapPost), total: count ?? 0 };
};

// READ
export const readMyPosts = async(userId: string): Promise<Post[]> => {
    const {data, error} = await supabase.from('posts')
                                        .select('*, users!author_id(email,display_name,avatar_color)')
                                        .eq('author_id', userId)
                                        .order('created_at',{ascending: false});
    if(error)
        throw error;

    return data.map(mapPost);
}

// 단건 조회 - published 글 또는 본인 글
export const readPostById = async (postId: string): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users!author_id(email,display_name,avatar_color)
        `)
        .eq('id', postId)
        .single();

    if (error) throw error;
    return mapPost(data);
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

            status: post.status,

            isMarkdown: post.content_type === 'markdown',
        })
        .eq('id', post.id)
        .select(`
            *,
            users!author_id(email)
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

// RECORD VIEW (본인 글 제외, 24시간 내 재조회 제외)
export const recordView = async (postId: string, userId: string, authorId: string | null): Promise<void> => {
    if (userId === authorId) return;
    await supabase.rpc('record_post_view', { p_post_id: postId, p_user_id: userId });
};

// READ ALL POSTS FOR ADMIN (모든 status 포함)
export const readAllPostsForAdmin = async (): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`*, users!author_id(email,display_name,avatar_color)`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapPost);
};

// TOGGLE PIN
export const togglePinPost = async (postId: string, isPinned: boolean): Promise<void> => {
    const { error } = await supabase
        .from('posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);

    if (error) throw error;
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