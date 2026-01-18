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
}