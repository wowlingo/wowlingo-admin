# Ashera FE (My Settlement Dashboard)

Ashera FE는 정산, 청구, 결제, 계약 및 고객 관리를 위한 대시보드 애플리케이션입니다. React와 Ant Design을 사용하여 개발되었습니다.

## 주요 기능

-   플랜 관리
-   청구서 관리
-   결제 관리
-   계약 관리
-   거래처 및 카드 관리
-   설정

## 개발 환경

-   **Framework**: React (^19.2.0), TypeScript (^4.9.5)
-   **UI Library**: Ant Design (^5.27.5)
-   **Package Manager**: npm

### 의존성 설치

프로젝트를 로컬 환경에서 실행하기 위해 아래 명령어를 사용하여 필요한 의존성을 설치합니다.

```bash
npm install
```

## 서비스 기동 방법

다양한 환경에 맞게 서비스를 시작할 수 있는 스크립트를 제공합니다.

### 로컬 개발 환경

기본 로컬 개발 서버를 시작합니다.

```bash
npm start
```

또는 `REACT_APP_PHASE`를 `local`로 명시적으로 지정하여 시작할 수도 있습니다.

```bash
npm run start:local
```

### 기타 환경

-   **Sandbox 환경**:
    ```bash
    npm run start:sbox
    ```
-   **Stage 환경**:
    ```bash
    npm run start:stage
    ```
-   **Production 환경**:
    ```bash
    npm run start:prod
    ```

### 빌드

프로덕션 환경으로 배포하기 위해 프로젝트를 빌드합니다.

```bash
npm run build
```