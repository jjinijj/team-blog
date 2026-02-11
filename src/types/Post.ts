export interface Post{
    id : string;
    title: string;
    content: string;  
    content_json?: any | null;
    content_type?: 'markdown' | 'richtext' | null;  
    createdAt: string;

    author_id: string | null; // 작성자, 기존 포스트들은 null
    author_email: string | null;

    // legacy
    isMarkdown: boolean;
}

export const getRenderMode = (post: Post): 'markdown' | 'richtext' => {
    if(post.content_type){
        return post.content_type;
    }

    if(post.isMarkdown)
        return 'markdown';

    return 'richtext';
}