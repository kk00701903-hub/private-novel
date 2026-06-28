# 웹소설 AI 편집 어시스턴트 (Vite 버전) - 설치 가이드

## 패키지 설치

```bash
npm install

# 핵심 패키지 (이미 package.json에 포함):
# npm install browser-image-compression   ← 클라이언트 측 이미지 압축
# npm install lucide-react                ← 탭 UI 아이콘
# npm install openai                      ← OpenAI SDK
```

## 환경변수 설정

프로젝트 루트에 `.env` 파일:
```
VITE_OPENAI_API_KEY=sk-...your-key-here...
```
또는 앱 UI의 API Key 입력란에 직접 입력 가능합니다.

## 개발 서버 실행

```bash
npm run dev
```

## 빌드

```bash
npm run build
npm run preview
```

## 참고

이 프로젝트는 Vite + React 18 + TypeScript 기반입니다. Vite 프론트엔드는 로컬 파일 시스템을 직접 읽을 수 없으므로, 세계관/플롯/이전 회차 데이터는 `src/data/novelData.ts`의 TypeScript 상수로 관리합니다.
