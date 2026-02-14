export interface Comment{
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;

    author_email?: string;
}

export interface CommentFormData{
    content: string;
}