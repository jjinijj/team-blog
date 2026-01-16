import { useState } from 'react';
import styled from 'styled-components';

interface EditorScreenProps {
  onGoToMain: () => void;
  onAddPost: (title: string, content: string) => void; 
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const CancelButton = styled(Button)`
  background-color: #6c757d;
  color: white;

  &:hover {
    background-color: #5a6268;
  }
`;

const PublishButton = styled(Button)`
  background-color: #28a745;
  color: white;

  &:hover {
    background-color: #218838;
  }
`;

const EditorArea = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 40px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 400px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

function EditorScreen({ onGoToMain, onAddPost }: EditorScreenProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePublish = () => {
    if(!title.trim()){
      alert('제목을 입력해주세요.')

    } else if(!content.trim()){
      alert('내용을 입력해주세요.')
    } else {
      onAddPost(title, content);
    }
  };

  return (
    <Container>
      <Header>
        <Title>글 작성</Title>
        <ButtonGroup>
          <CancelButton onClick={onGoToMain}>취소</CancelButton>
          <PublishButton onClick={handlePublish}>등록</PublishButton>
        </ButtonGroup>
      </Header>

      <EditorArea>
        <InputField 
          type="text" 
          placeholder="제목을 입력하세요" 
          value={ title }
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          placeholder="내용을 입력하세요" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </EditorArea>
    </Container>
  );
}

export default EditorScreen;
