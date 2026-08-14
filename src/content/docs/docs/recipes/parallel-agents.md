---
title: "동일한 작업으로 세 명의 에이전트와 경쟁하세요"
sourceUrl: https://www.onorca.dev/docs/recipes/parallel-agents
checkedAt: "2026-08-14T01:08:16.788Z"
editUrl: false
prev: /orca-docs-ko/docs/activity/
next: /orca-docs-ko/docs/recipes/review-ai-diff/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

여러 에이전트에서 동일한 작업을 병렬로 실행하는 것은 Orca의 킬러 움직임입니다. 동일한 프롬프트, 세 개의 분기로 승자를 선택합니다.

## 단계

1. 동일한 시작 참조에서 세 개의 작업 트리를 만듭니다. 이름을 `fix-bug`, `fix-bug-2`, `fix-bug-3`으로 지정합니다.
2. 각각 다른 에이전트(Claude Code, Codex, Cursor CLI)를 시작합니다.
3. 세 가지 모두에 동일한 프롬프트를 붙여넣습니다.
4. 작동을 확인할 수 있도록 창을 분할합니다. 탭을 가장자리로 드래그합니다.
5. 완료되면 각 차이점을 검토합니다. 우승자에게 [AI Diff 주석 달기](/orca-docs-ko/docs/review/annotate-ai-diff/)를 사용하세요.
6. 승리한 작업 트리에서 PR을 커밋하고 푸시하고 엽니다.
7. 두 명의 패자를 삭제합니다. 한 번의 클릭으로 작업 트리와 분기가 제거됩니다.

## 작동하는 이유

상담원마다 실수가 다릅니다. 동일한 작업을 병렬로 실행하는 것은 순차적 재시도보다 저렴하며 불일치를 신호로 표시합니다. 세 명의 상담원이 동의하는 경우 아마도 대답이 맞을 것입니다. 그들이 갈라진 곳에서 당신은 어려운 부분을 발견했습니다.
