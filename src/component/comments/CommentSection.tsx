import { useEffect, useState } from "react";
import { Comment } from "../../types/Comment";

interface CommentSectionProps{
    postId: string;
}

export const CommentSection = ({postId} : CommentSectionProps) => {

    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    
    useEffect( () => {
        // fetchComments();
    }, [postId])
}