---
title: "워크트리 체크포인트"
sourceUrl: https://www.onorca.dev/docs/cli/worktree-checkpoints
checkedAt: "2026-08-24T01:32:32.260Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/computer-use/
next: /orca-docs-ko/docs/cli/skills/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

모든 Orca 작업 트리에는 UI에 표시되는 간단한 자유 텍스트 `comment`(설명) 필드가 있습니다. 즉, 작업 트리가 현재 수행 중인 작업에 대한 상태 스냅샷입니다. 에이전트는 CLI에서 이를 업데이트할 수 있으며 채팅을 강제하지 않고도 인간 공동작업자를 루프에 유지하기 위해 권장하는 패턴입니다.

## 패턴

````
orca worktree set --worktree active --comment "reproduced auth failure; testing credential-chain fix" --json
````

## 카드 상태(선택 사항)

자유 텍스트 댓글과 함께 단계가 바뀔 때 작업 공간 카드 상태를 설정합니다.

```
orca worktree set --worktree active \
  --comment "fix implemented; running integration tests" \
  --workspace-status in-progress \
  --json
```

상태: `todo`, `in-progress`, `in-review`, `completed` 또는 작업 공간에서 사용하는 사용자 지정 ID

## 좋은 체크포인트 순간들

- 의미있는 구현을 마쳤습니다.
- 가설을 확인하거나 반박했습니다.
- 코드 리뷰를 완료했습니다.
- 차단기에 부딪혔습니다(외부 입력 대기, 업스트림 버그, 액세스 누락).
- 조사에서 수정으로, 수정에서 검증으로 전환합니다.

## 형식

첫 번째 줄은 작업입니다. 방금 발생한 일, 위치, 상태 또는 다음 단계입니다.

````
orca worktree set --worktree active --comment "added debounce to SearchBar onChange (src/components/SearchBar.tsx); ready for review
goal: reduce redundant API calls per #298" --json
````

## 쓰기 전에 읽기

댓글에 사용자가 작성한 컨텍스트가 있을 수 있는 경우 먼저 읽어 목표나 제약 조건을 방해하지 않도록 하세요.

````
orca worktree current --json
````

아직 유효한 것을 보존하고, 오래된 것을 삭제하고, 업데이트를 엮으세요.
