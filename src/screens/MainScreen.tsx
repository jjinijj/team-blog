import styled from 'styled-components';
import { Post } from '../types/Post';

interface MainScreenProps {
  onGoToEditor: () => void;
  posts: Post[];
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
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
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const WriteButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const ContentArea = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #999;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #999;
  font-size: 16px;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PostItem = styled.div`
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;

  &:hover{
    border-color: #ddd;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PostTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
`;

const PostContent = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostDate = styled.span`
  font-size: 12px;
  color: #999;
`;

function MainScreen({ onGoToEditor, posts }: MainScreenProps) {
  return (
    <Container>
      <Header>
        <Title>Team Blog</Title>
        <WriteButton onClick={onGoToEditor}>글쓰기</WriteButton>
      </Header>

      <ContentArea>
        { posts.length === 0 ? (<EmptyMessage>아직 글이 없습니다.</EmptyMessage> )
        : (
          <PostList>
            { posts.map((post) => (
              <PostItem key = {post.id}>
                <PostTitle>{post.title}</PostTitle>
                <PostContent>{post.content}</PostContent>
                <PostDate>{post.createdAt}</PostDate>
              </PostItem>
            ))}
          </PostList>
        )}
      </ContentArea>
    </Container>
  );
}

export default MainScreen;
