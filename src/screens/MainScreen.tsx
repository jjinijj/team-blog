import styled from 'styled-components';
import type { Post } from '../types/Post';
import { useState } from 'react';

interface MainScreenProps {
  onGoToEditor: () => void;
  posts: Post[];
  onViewPost: (postId : string)=> void;
  onDeletePost: (deletePosts : Post[]) => void;
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
  gap: 20px;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
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

const WriteButton = styled(Button)`
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

const SelectButton = styled(Button)`
  background-color: #16a34a;
  color: white;

  &:hover {
    background-color: #15803d;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;

  &:hover {
    background-color: #c82333;
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

const PostListItem = styled.div`
  display: flex;  
  align-items: center;
  gap: 15px;
`;

const PostItem = styled.div`
  flex: 1;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor : pointer;

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

function MainScreen({ onGoToEditor, posts, onViewPost, onDeletePost }: MainScreenProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);

  const handleSelectPostMode = () => {
    setIsSelectMode(!isSelectMode);

    if(!isSelectMode){
      setSelectedPosts([]);
    }
  };

  const handleDeletePosts = () => {

    if(window.confirm('선택된 항목들을 삭제하겠습니까?')){
      onDeletePost(selectedPosts);
      setIsSelectMode(false);
    }

  };
  
  const handleSelectPost = (selectPost: Post) => { 
    const post = selectedPosts.find((post)=> post.id === selectPost.id);
    if(post){
      setSelectedPosts(selectedPosts.filter((post)=> post.id !== selectPost.id));
    }else{
      setSelectedPosts(prev => [selectPost, ...prev])
    }
  };

  return (
    <Container>
      <Header>
        <Title>Team Blog</Title>
        {!isSelectMode && (
          <WriteButton 
            onClick={onGoToEditor}
          >
            글쓰기
          </WriteButton>
        )}
        {isSelectMode && (
          <DeleteButton
            onClick={ handleDeletePosts}>
            삭제
          </DeleteButton>
        )}
        <SelectButton 
          onClick={handleSelectPostMode}
          >
            {isSelectMode ? '취소' : '선택'}
        </SelectButton>
        
      </Header>

      <ContentArea>
        { posts.length === 0 ? (<EmptyMessage>아직 글이 없습니다.</EmptyMessage> )
        : (
          <PostList>
            { posts.map((post) => (
              <PostListItem
                key = {post.id}
              >
                {isSelectMode && (<input 
                  type='checkbox'
                  checked={selectedPosts.some((p) => p.id === post.id)}  // ← React 상태 동기화
                  onChange={ () => {handleSelectPost(post)}}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                }}
                />)}
              <PostItem key = {post.id} onClick={() => onViewPost(post.id)}>
                
                <PostTitle>{post.title}</PostTitle>
                <PostContent>{post.content}</PostContent>
                <PostDate>{post.createdAt}</PostDate>
              </PostItem>
              </PostListItem>
            ))}
          </PostList>
        )}
      </ContentArea>
    </Container>
  );
}

export default MainScreen;
