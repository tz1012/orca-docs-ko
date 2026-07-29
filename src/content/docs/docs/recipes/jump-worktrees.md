---
title: "10개의 작업 트리 사이를 이동합니다."
sourceUrl: https://www.onorca.dev/docs/recipes/jump-worktrees
checkedAt: "2026-07-29T01:03:00.276Z"
editUrl: false
prev: /orca-docs-ko/docs/recipes/review-ai-diff/
next: /orca-docs-ko/docs/recipes/design-mode-fix/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

10개의 작업 트리는 다루기 힘든 작업입니다. 점프 팔레트 + 재시작 칩 + 에이전트 상태 도트는 이 정확한 규모를 위해 구축되었습니다.

## 단계

1. `Cmd-J`은 점프 팔레트를 엽니다. 작업 이름의 일부를 입력하세요. 점프를 입력하십시오. Shift-Enter가 분할되어 열립니다.
2. 사이드바를 스캔합니다. 활성 에이전트가 있는 작업 트리에는 녹색 점이 있습니다. 먼저 입력(노란색)이 필요한 항목으로 이동하세요.
3. 각 작업 트리에서 `Restart`(다시 시작) 칩은 종료된 모든 에이전트를 다시 시작합니다. 노트북 절전 모드 후 대량 재개에 적합합니다.
4. [영구 벨](/orca-docs-ko/docs/notifications/)을 사용하여 "에이전트 완료" 대기열을 비웁니다. 알림을 클릭하면 작업 트리로 이동합니다.

## 위생

병합된 작업 트리를 적극적으로 삭제합니다. Orca을 사용하면 비용이 저렴해집니다. 한 번의 클릭으로 작업 트리와 분기가 모두 사라집니다. 수십 개의 병합된 작업 트리를 남겨두면 팔레트 속도가 느려집니다.
