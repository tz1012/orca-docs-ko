---
title: "기여"
sourceUrl: https://www.onorca.dev/docs/review/attribution
checkedAt: "2026-08-05T01:03:39.454Z"
editUrl: false
prev: /orca-docs-ko/docs/review/annotate-ai-diff/
next: /orca-docs-ko/docs/review/commit-push/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca은 에이전트가 터치하는 모든 줄의 출처를 추적하므로 차이점을 읽을 때 어떤 줄이 사람이 썼는지, 어떤 줄이 AI에서 왔는지 한눈에 알 수 있습니다.

## 작동 방식

에이전트가 도구를 통해 파일에 쓸 때 Orca은 범위를 기록합니다. diff 뷰어는 홈통에 미묘한 마커를 사용하여 AI에서 생성된 선을 렌더링합니다. AI 코드 위에 사람이 편집하면 속성이 다시 사람에게 돌아갑니다.

## 그것이 중요한 이유

- PR의 어떤 부분을 추가로 조사해야 하는지 알 수 있습니다.
- 보안 및 규정 준수 감사를 통해 AI로 작성된 코드와 사람이 작성한 코드를 분리할 수 있습니다.
- 검토 속도가 빨라집니다. 직접 작성한 코드를 다시 읽을 필요가 없습니다.

## 범위

속성은 Orca에 로컬이며 git에 커밋되지 않습니다. 지속적인 속성을 원할 경우 diff 도구 모음에서 diff 메타데이터를 내보내세요.
