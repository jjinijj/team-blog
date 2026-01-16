import styled from "styled-components";
import type { Post } from "../types/Post";

interface PostDetailProps {
    post: Post;
    onGoToMain: () => void;
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
    margin-bottom: 40px;
`;

const Title = styled.h1`
    font-size = 32px;
    font-weight = bold;
    color: #333;
    margin: 0;
`;

const BackButton = styled.button`
    padding: 12px 24px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    :&hover {
        background-color: #5a6268
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

const PostContent = styled.div<{fontSize : number}>`
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  font-size: ${(props) => props.fontSize}px;
  white-space: pre-wrap;
  word-break: break-word;
`;


const PostDetailScreen = ({post, onGoToMain} : PostDetailProps) => {
    return(
        <Container>
            <Header>
                <Title>글 보기</Title>
                <BackButton onClick={onGoToMain}>
                        뒤로가기
                </BackButton>
            </Header>

            <ContentArea>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>{post.createdAt}</PostMeta>
                <PostContent
                    fontSize={post.fontSize}
                >
                    {post.content}
                </PostContent>
            </ContentArea>
        </Container>
    );

}

export default PostDetailScreen;