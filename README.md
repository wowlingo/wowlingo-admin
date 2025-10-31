# wowlingo-admin
와우링고 서비스의 어드민 입니다. React와 Ant Design을 사용하여 구축되었습니다.

## 기능

- **대시보드:** 서비스 현황을 파악할 수 있는 메인 페이지입니다.
- **학습 관리:** WowLingo의 학습 콘텐츠(Quest, Item, Unit)를 관리합니다. 

## 기술 스택 

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Ant Design](https://ant.design/)
- [React Router](https://reactrouter.com/)

## 시작하기

### 설치

```bash
npm install
```

### 실행

- **로컬 환경:** 
```bash
npm run start:local
```
- **개발 환경:** 
```bash
npm run start:dev
```
- **운영 환경:** 
```bash
npm run start:prod
```

### 빌드

```bash
npm run build
```

### 테스트

```bash
npm run test 
```

## 배포

이 프로젝트는 Docker를 사용하여 배포됩니다. 관련 설정 파일은 다음과 같습니다.

- `Dockerfile`