# Team Blog Editor

팀이 함께 글을 작성, 편집, 관리할 수 있는 웹 기반 에디터입니다.

🌐 **[라이브 데모](https://team-blog-delta.vercel.app)**

---

## ✨ 주요 기능

- 📝 **글 작성/수정/삭제** - 개별 삭제 및 다중 삭제 지원
- 🎨 **글자 스타일 옵션**
  - 글자 크기 (12px ~ 24px)
  - 글자 스타일 (굵게, 기울임, 밑줄)
  - 글자 색상 (컬러 피커)
- 🔍 **검색 기능** - 제목 또는 내용으로 검색
- 📊 **정렬 기능** - 최신순/오래된순 정렬
- 💾 **자동 저장** - localStorage를 통한 데이터 영속성
- 📱 **반응형 UI** - 모든 화면에서 최적화

---

## 🛠 기술 스택

| 항목 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Framework** | React 18 |
| **Styling** | styled-components |
| **State** | React Hooks |
| **Storage** | localStorage |
| **Build** | Create React App |
| **Deployment** | Vercel |
| **Version Control** | Git/GitHub |

---

## 📋 화면 구성

### 1. MainScreen (메인 화면)
- 글 목록 표시
- 검색 기능
- 정렬 옵션
- 다중 선택 및 삭제
- 글 상세보기 이동

### 2. EditorScreen (에디터 화면)
- 제목/내용 입력
- 글자 크기/스타일/색상 설정
- 실시간 스타일 미리보기
- 새 글 작성 / 글 수정

### 3. PostDetailScreen (상세보기 화면)
- 완전한 글 내용 표시
- 저장된 스타일 적용
- 수정/삭제 기능
- 뒤로가기

---

## 🚀 시작하기

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/team-blog.git
cd team-blog

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 빌드

```bash
npm run build
```

빌드 폴더가 생성되고, 정적 파일로 배포할 준비가 완료됩니다.

---

## 📂 프로젝트 구조

```
team-blog/
├── src/
│   ├── App.tsx                    # 메인 앱, 상태 관리
│   ├── types/
│   │   └── Post.ts                # Post 인터페이스
│   ├── screens/
│   │   ├── MainScreen.tsx         # 글 목록 화면
│   │   ├── EditorScreen.tsx       # 글 작성/수정 화면
│   │   └── PostDetailScreen.tsx   # 글 상세보기 화면
│   └── index.tsx
├── docs/
│   └── DOCUMENTATION.md           # 상세 문서
├── public/
├── package.json
└── README.md
```

---

## 💾 데이터 구조

```typescript
interface Post {
  id: string;              // 타임스탬프 기반 고유 ID
  title: string;           // 글 제목
  content: string;         // 글 본문
  fontSize: number;        // 글자 크기 (12-24px)
  isBold: boolean;         // 굵기 여부
  isItalic: boolean;       // 기울임 여부
  isUnderline: boolean;    // 밑줄 여부
  textColor: string;       // 글자 색상 (hex 색상코드)
  createdAt: string;       // 작성일자 (YYYY-MM-DD)
}
```

---

## 🔄 데이터 흐름

```
User Input
    ↓
React State (App.tsx)
    ↓
Component Update
    ↓
localStorage Save
    ↓
UI Render
```

자세한 데이터 흐름은 [문서](./docs/DOCUMENTATION.md#5-데이터-흐름)를 참고하세요.

---

## 🌐 배포

### Vercel 배포 (현재)
- **URL**: https://team-blog-delta.vercel.app
- **자동 배포**: main 브랜치 push 시 자동 배포

### 배포 과정
1. GitHub에 코드 push
2. Vercel이 자동으로 감지
3. 빌드 및 배포
4. 1-2분 후 라이브 배포 완료

---

## 📖 자세한 문서

전체 기능, 상태 관리, 스타일링 등 상세 내용은 [전체 문서](./docs/DOCUMENTATION.md)를 참고하세요.

주요 섹션:
- [데이터 구조](./docs/DOCUMENTATION.md#4-데이터-구조)
- [데이터 흐름](./docs/DOCUMENTATION.md#5-데이터-흐름)
- [각 스크린별 기능](./docs/DOCUMENTATION.md#6-각-스크린별-주요-기능)
- [상태 관리](./docs/DOCUMENTATION.md#7-상태-관리-apptsx)

---

## 🔮 향후 계획

### Phase 2: Supabase 연동
- PostgreSQL 데이터베이스 연동
- 팀원 간 글 공유 기능
- 실시간 동기화

### Phase 3: React Router
- URL 기반 라우팅
- 각 화면별 직접 접근
- 브라우저 뒤로가기 지원

### Phase 4: 추가 기능
- 페이징
- 카테고리/태그
- 댓글
- 사용자 인증

---

## 🛠 개발 시 유용한 명령어

```bash
# 개발 서버 실행
npm start

# 빌드
npm run build

# 테스트
npm test

# linting
npm run lint
```

---

## 📝 라이선스

MIT License

---

## 👥 기여

이 프로젝트는 팀 프로젝트입니다. 개선 사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

---

## 📞 문의

프로젝트에 대한 질문이나 피드백은 GitHub Issues를 통해 연락주세요.

---

**마지막 업데이트**: 2026년 1월 20일
