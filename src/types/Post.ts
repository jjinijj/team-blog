export interface Post{
    id : string;
    title: string;
    content: string;
    fontSize: number;
    
    isBold : boolean;
    isItalic: boolean;
    isUnderline: boolean;

    textColor: string;
    
    createdAt: string;

    isMarkdown: boolean;

    author_id: string | null; // 작성자, 기존 포스트들은 null
    author_email: string | null;
}