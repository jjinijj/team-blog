import styled from "styled-components";
import type { Post } from "../types/Post";
import { useParams } from "react-router-dom";

interface PostDetailProps {
    posts: Post[];
    onGoToMain: () => void;
    onEdit: (postId: string) => void;
    onDelete: (postId: string) => void;
}

const Container = styled.div`
    width: 100%;
    min-height: 40px 20px;
    background-color: #f5f5f5;
`;

const Header = styled.div`
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 40px;
`;

const Title = styled.h1`
    font-size = 32px;
    font-weight = bold;
    color: #333;
    margin: 0;
    margin-right: auto;
`;

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
`;

const BackButton = styled(Button)`
    background-color: #6c757d;
    color: white;

    :&hover {
        background-color: #5a6268
    }
`;

const EditButton = styled(Button)`
    background-color: #0056b3;
    color: white;

    &:hover{
        background-color: #004085;
    }
`;

const DeleteButton = styled(Button)`
    background-color: #fb0000ff;
    color: white;

    &:hover{
        background-color: #c80000ff;
    }
`;

const ContentArea = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 40px;
`;

const PostTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
`;

const PostMeta = styled.div`
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const PostContent = styled.div<{
    $fontSize : number
    $isBold: boolean
    $isItalic: boolean
    $isUnderline: boolean
    $fontColor: string
}>`
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  font-size: ${(props) => props.$fontSize}px;
  font-weight: ${(props) => (props.$isBold ? 'bold' : 'normal')};
  font-style: ${(props) => (props.$isItalic ? 'italic' : 'normal')};
  text-decoration: ${(props) => (props.$isUnderline ? 'underline' : 'none')};
  color: ${(props) => props.$fontColor};
  white-space: pre-wrap;
  word-break: break-word;
`;

const NotFound = styled.div`
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #666;
    `;


const PostDetailScreen = ({posts, onGoToMain, onEdit, onDelete} : PostDetailProps) => {
    
    const {id} = useParams<{id:string}>();
    const post = posts.find(p => p.id === id);

    // id가 일치하는 글이 없는 경우
    if(!post){
        return(
            <Container>
                <Header>
                    <BackButton onClick = {onGoToMain}>
                        뒤로가기
                    </BackButton>
                </Header>
                <NotFound>
                    글을 찾을 수 없습니다.
                </NotFound>
            </Container>

        );
    }
    
    return(
        <Container>
            <Header>
                <Title>글 보기</Title>
                <EditButton onClick={() => onEdit(post.id)}>
                        수정
                </EditButton>
                <DeleteButton onClick={() => onDelete(post.id)}>
                        삭제
                </DeleteButton>
                <BackButton onClick={onGoToMain}>
                        뒤로가기
                </BackButton>
                
            </Header>

            <ContentArea>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>{post.createdAt}</PostMeta>
                <PostContent
                    $fontSize={post.fontSize}
                    $isBold={post.isBold}
                    $isItalic={post.isItalic}
                    $isUnderline = {post.isUnderline}
                    $fontColor={post.textColor}
                >
                    {post.content}
                </PostContent>
            </ContentArea>
        </Container>
    );
}

export default PostDetailScreen;