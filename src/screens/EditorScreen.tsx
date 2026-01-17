import { useState } from 'react';
import styled from 'styled-components';
import { Post } from '../types/Post';

interface EditorScreenProps {
  onGoToMain: () => void;
  onAddPost: (
    title: string, 
    content: string, 
    fontSize: number,
    isBold : boolean,
    isItalic: boolean,
    isUnderline: boolean,
  ) => void; 
  editingPost?: Post;
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

const OptionSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  min-width: 100px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius:L 4px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const StyleButtonGroup = styled.div`
  display: flex;
  gap : 8px;
`;

const StyleButton = styled.div<{$isActive: boolean}>`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${(props) => (props.$isActive ? '#007bff' : '#fff')};
  color: ${(props) => (props.$isActive ? '#fff' : '#333')};
  font-weight: bold;

  &: hover {
    border-color: #007bff
  }
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

const TextArea = styled.textarea<{
  $fontSize: number;
  $isBold: boolean;
  $isItalic: boolean;
  $isUnderline: boolean;
}>`
  width: 100%;
  min-height: 400px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: ${(props) => props.$fontSize}px;
  font-weight: ${(props) => props.$isBold ? 'bold' : 'normal'};
  font-style: ${(props) => props.$isItalic ? 'italic' : 'normal' };
  text-decoration: ${(props) => (props.$isUnderline ? 'underline' : 'none')};
  -webkit-text-decoration: ${(props) => (props.$isUnderline ? 'underline' : 'none')};
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

function EditorScreen({ onGoToMain, onAddPost, editingPost }: EditorScreenProps) {
  const [title, setTitle] = useState(editingPost?.title || '');
  const [content, setContent] = useState(editingPost?.content ||'');
  const [fontSize, setFontSize] = useState(editingPost?.fontSize ||16);
  const [isBold, setIsBold] = useState(editingPost?.isBold ||false);
  const [isItalic, setIsItalic] = useState(editingPost?.isItalic ||false);
  const [isUnderline, setIsUnderline] = useState(editingPost?.isUnderline ||false);

  const isEditing = !!editingPost;

  const handlePublish = () => {
    if(!title.trim()){
      alert('제목을 입력해주세요.')

    } else if(!content.trim()){
      alert('내용을 입력해주세요.')
    } else {
      onAddPost(title, content, fontSize, isBold, isItalic, isUnderline);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{isEditing? '글 수정' : '글 작성'}</Title>
        <ButtonGroup>
          <CancelButton onClick={onGoToMain}>취소</CancelButton>
          <PublishButton onClick={handlePublish}>{isEditing ? '수정' : '등록'}</PublishButton>
        </ButtonGroup>
      </Header>

      <EditorArea>
        <InputField 
          type="text" 
          placeholder="제목을 입력하세요" 
          value={ title }
          onChange={(e) => setTitle(e.target.value)}
        />

        <OptionSection>
          <Label>글자 크기 : </Label>
          <Select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
            <option value = {12}>12px</option>
            <option value = {14}>14px</option>
            <option value = {16}>16px</option>
            <option value = {18}>18px</option>
            <option value = {20}>20px</option>
            <option value = {24}>24px</option>
          </Select>
        </OptionSection>

        <OptionSection>
          <Label>글자 스타일</Label>
          <StyleButtonGroup>
            <StyleButton
              $isActive = {isBold}
              onClick={() => setIsBold(!isBold)}
              title="굵게"
              >
                B
            </StyleButton>
            <StyleButton
              $isActive = {isItalic}
              onClick={() => setIsItalic(!isItalic)}
              title="기울임"
              >
                I
            </StyleButton>
            <StyleButton
              $isActive = {isUnderline}
              onClick={() => setIsUnderline(!isUnderline)}
              title="밑줄"
              >
                U
            </StyleButton>
          </StyleButtonGroup>
        </OptionSection>

        <TextArea
          placeholder="내용을 입력하세요" 
          value={content}
          $fontSize={fontSize}
          $isBold = {isBold}
          $isItalic = {isItalic}
          $isUnderline = {isUnderline}
          onChange={(e) => setContent(e.target.value)}
        />
      </EditorArea>
    </Container>
  );
}

export default EditorScreen;
