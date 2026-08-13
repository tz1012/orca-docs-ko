---
title: "10개의 작업 트리 사이를 이동합니다."
sourceUrl: https://www.onorca.dev/docs/recipes/jump-worktrees
checkedAt: "2026-08-13T01:02:43.994Z"
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

1. `Cmd-J`은 점프 팔레트를 엽니다. 작업 이름의 일부를 입력합니다. `Enter`를 누르면 이동하고 `Shift-Enter`를 누르면 분할 창에서 엽니다. 목록이 길면 **`Tab`(Tab 키)**을 눌러 호스트 또는 프로젝트별로 필터링합니다.
2. 사이드바를 확인합니다. 활성 에이전트가 있는 작업 트리에는 녹색 점이 표시됩니다. 입력이 필요한 노란색 항목으로 먼저 이동합니다.
3. 각 작업 트리에서 **`Restart`(다시 시작)** 칩을 사용하면 종료된 에이전트를 다시 실행할 수 있습니다. 노트북이 절전 모드에서 깨어난 뒤 여러 작업을 한꺼번에 재개할 때 유용합니다.
4. [영구 벨](/orca-docs-ko/docs/notifications/)을 사용하여 "에이전트 완료" 대기열을 처리합니다. 알림을 클릭하면 해당 작업 트리로 이동합니다.

## 위생

병합된 작업 트리를 적극적으로 삭제합니다. Orca을 사용하면 비용이 저렴해집니다. 한 번의 클릭으로 작업 트리와 분기가 모두 사라집니다. 수십 개의 병합된 작업 트리를 남겨두면 팔레트 속도가 느려집니다.
