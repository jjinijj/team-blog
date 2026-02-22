export interface Post{
    id : string;
    title: string;
    content: string;  
    content_json?: any | null;
    content_type?: 'markdown' | 'richtext' | null;  
    created_at: string;
    updated_at: string;

    author_id: string | null; // 작성자, 기존 포스트들은 null
    author_email: string | null;

    author_name: string | null;
    author_color: string | null;

    status: 'draft' | 'published' | 'private';

    // legacy
    isMarkdown: boolean;
}

export type NewPost = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author_name' | 'author_color'>;
export type UpdatePost = Omit<Post, 'created_at' | 'updated_at' | 'author_id' | 'author_name' | 'author_color'>;

export const getRenderMode = (post: Post): 'markdown' | 'richtext' => {
    if(post.content_type){
        return post.content_type;
    }

    if(post.isMarkdown)
        return 'markdown';

    return 'richtext';
}