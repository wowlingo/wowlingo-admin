# wowlingo-admin

WowLingo 언어 학습 플랫폼의 관리자 콘솔입니다. 학습 콘텐츠(Quest, Item, Unit)를 생성, 수정, 삭제하고 관리할 수 있는 웹 기반 어드민 시스템입니다.

## 주요 기능

### 학습 관리 (Quest)
- Quest 생성/수정/삭제
- Quest 타입 설정:
  - **선택형(choice)**: 1개 선택 문제(객관식 2지선다)
  - **평서문/의문문(statement-question)**: 문장 유형 구분
  - **같은/다른(same-different)**: 두 개의 단어/문장 비교 문제
- 해시태그 기반 분류 및 검색
- 문제 개수 설정 및 등록 현황 추적
- 필터링 및 검색 기능

### 문제 관리 (Item)
- Quest에 포함되는 개별 문제 관리
- 오디오 파일 업로드 지원
- Unit과 연동된 문제 관리

### 문제 유닛 관리 (Unit)
- 문제 유닛 생성 및 관리
- 문제에 사용될 컴포넌트 단위 관리

### 대시보드
- 서비스 현황 모니터링
- 주요 지표 확인

## 기술 스택

- **Frontend Framework**: [React 18](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Ant Design 5](https://ant.design/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Build Tool**: React Scripts (Create React App)

## 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── DashboardPage.tsx
│   ├── QuestPage.tsx   # Quest 관리
│   ├── ItemPage.tsx    # Item 관리
│   └── UnitPage.tsx    # Unit 관리
├── components/         # 재사용 가능한 컴포넌트
│   ├── QuestFormModal.tsx
│   ├── QuestItemFormModal.tsx
│   ├── QuestUnitFormModal.tsx
│   ├── HashtagSelector.tsx
│   ├── AudioPlayer.tsx
│   ├── AudioUploader.tsx
│   └── UnitSelectorModal.tsx
├── services/
│   └── api/           # API 클라이언트
│       ├── client.ts
│       ├── quests.ts
│       ├── questItems.ts
│       ├── questUnits.ts
│       ├── hashtags.ts
│       └── upload.ts
├── types/             # TypeScript 타입 정의
│   ├── index.ts
│   └── questUnit.ts
└── config.ts          # 환경별 설정
```

## 시작하기

### 사전 요구사항

- Node.js 16.x 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 환경 설정

`.env.example` 파일을 `.env` 파일로 복사하고 환경에 맞게 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일 예시:
```bash
# Environment (local, dev, prod)
REACT_APP_PHASE=local

# API Server URLs
REACT_APP_API_SERVER_LOCAL=http://localhost:8080
REACT_APP_API_SERVER_DEV=https://dev-api.wowlingo.com
REACT_APP_API_SERVER_PROD=https://api.wowlingo.com
```

### 실행

환경별로 다음 명령어를 사용합니다:

```bash
# 로컬 환경
npm run start:local

# 개발 환경
npm run start:dev

# 운영 환경
npm run start:prod
```

기본 개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드

프로덕션 빌드를 생성합니다:

```bash
npm run build
```

빌드된 파일은 `build/` 디렉토리에 생성됩니다.

### 테스트

```bash
npm run test
```

## 배포

이 프로젝트는 Docker를 사용하여 배포됩니다. 멀티스테이지 빌드를 통해 Node.js에서 빌드 후 Nginx로 정적 파일을 서빙합니다.

### Docker 빌드

```bash
docker build -t wowlingo-admin .
```

### Docker 실행

```bash
docker run -p 80:80 wowlingo-admin
```

배포 관련 파일:
- `Dockerfile`: 멀티스테이지 Docker 빌드 설정
- `nginx.conf`: Nginx 웹 서버 설정

## 개발 가이드

### API 연동

모든 API 호출은 `src/services/api/` 디렉토리의 모듈을 통해 수행됩니다. 환경별 API 서버 주소는 `src/config.ts`에서 관리됩니다.

### 새로운 페이지 추가

1. `src/pages/`에 새 페이지 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. 사이드바 메뉴에 항목 추가

### 새로운 API 추가

1. `src/services/api/`에 새 API 모듈 생성
2. `src/services/api/index.ts`에 export 추가
3. 필요한 경우 `src/types/`에 타입 정의 추가

## 중요 유의사항

### 백엔드 API 서버 필수
- 이 프론트엔드 애플리케이션은 백엔드 API 서버와 통신합니다
- 로컬 개발 시 백엔드 서버가 실행 중이어야 정상 작동합니다
- API 타임아웃은 30초로 설정되어 있습니다 (src/services/api/client.ts:7)
- 현재 어드민에 인증 기능은 구현되지 않았지만, 향후 JWT 토큰 기반 인증이 추가될 수 있습니다

### 오디오 파일 업로드
- 오디오 파일 업로드는 `/api/upload/audio` 엔드포인트를 사용합니다
- 백엔드 서버에서 파일 크기 및 형식 제한을 확인하세요
- 업로드된 파일은 백엔드 서버에서 관리됩니다

## 시스템 요구사항 및 제약사항

### 브라우저 호환성
권장 브라우저:
- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

### Quest 타입 제한
현재 지원되는 Quest 타입은 다음 3가지로 제한됩니다:
- `choice`: 선택형
- `statement-question`: 평서문/의문문
- `same-different`: 같은/다른

새로운 타입을 추가하려면 코드 수정이 필요합니다.

### Docker 배포 환경 설정
현재 Dockerfile에서 빌드 시 환경이 `dev`로 하드코딩되어 있습니다 (Dockerfile:14). 운영 환경 배포 시에는 해당 라인을 수정하거나 빌드 인자를 사용하도록 변경이 필요합니다.

## 문제 해결

### API 연결 오류
```
Network error. Please check your connection.
```
**원인**: 백엔드 서버가 실행되지 않았거나 잘못된 API 서버 주소
**해결**:
1. `.env` 파일의 API 서버 주소를 확인하세요
2. 백엔드 서버가 실행 중인지 확인하세요
3. 방화벽이나 네트워크 설정을 확인하세요

### 환경 변수가 적용되지 않음
**원인**: 환경 변수 변경 후 개발 서버를 재시작하지 않음
**해결**: `.env` 파일 수정 후 반드시 개발 서버를 재시작하세요

### 빌드 실패
**원인**: Node 모듈 버전 충돌 또는 의존성 누락
**해결**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Docker 이미지 빌드 느림
**원인**: npm install이 매번 실행됨
**해결**: Docker 빌드 캐시를 활용하세요. package.json이 변경되지 않으면 캐시된 레이어를 사용합니다.

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

## Acknowledgement

본 프로젝트는 카카오임팩트 테크포임팩트 프로그램을 통해 개발되었습니다.

<div align="center">
  <img src="./src/assets/kakao_impact_logo_black.png" alt="카카오임팩트 로고" width="200"/>
  <br/>
  <img src="./src/assets/TF!_Logo_B1.png" alt="테크포임팩트 로고" width="200"/>
</div>