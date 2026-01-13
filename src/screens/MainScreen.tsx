import styled from 'styled-components';

interface MainScreenProps {
  onGoToEditor: () => void;
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

function MainScreen({ onGoToEditor }: MainScreenProps) {
  return (
    <Container>
      <Header>
        <Title>Team Blog</Title>
        <WriteButton onClick={onGoToEditor}>글쓰기</WriteButton>
      </Header>

      <ContentArea>
        <p>아직 글이 없습니다.</p>
      </ContentArea>
    </Container>
  );
}

export default MainScreen;
