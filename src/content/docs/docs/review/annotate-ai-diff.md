---
title: "AI 차이점에 주석 달기"
sourceUrl: https://www.onorca.dev/docs/review/annotate-ai-diff
checkedAt: "2026-08-06T01:01:54.172Z"
editUrl: false
prev: /orca-docs-ko/docs/review/diff-viewer/
next: /orca-docs-ko/docs/review/attribution/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Annotate AI Diff는 에이전트 생성 코드에 대한 Orca의 인라인 검토 루프입니다. AI가 생성한 덩어리의 한 줄에 주석을 남긴 다음 수정을 위해 단일 배치로 에이전트에 다시 보냅니다. 줄 번호를 복사하거나 컨텍스트 전환을 할 필요가 없습니다.

![AI Diff 주석 달기 — diff 줄에 고정된 인라인 댓글](/orca-docs-ko/assets/mirror/7e333e573b0c6a2f5e416d359f8b8060f6fe4cb617ccec30824d21329fd065a0.jpg)

AI Diff에 주석 달기 — diff 라인에 고정된 인라인 댓글

## 댓글을 남겨주세요

1. diff에서 아무 라인이나 마우스로 가리킵니다. 홈통에 ***가 나타납니다.
2. 클릭하세요(또는 줄에 커서를 두고 `c`을 누르세요).
3. 피드백을 입력하세요. 마크다운이 지원됩니다.
4. 저장하려면 `Cmd-Enter`를 누르고, 취소하려면 `Esc`을 누르세요.

댓글은 정확한 줄에 고정됩니다. Orca은 편집 전반에 걸쳐 이를 추적하므로 diff가 이동하면 라인을 따릅니다.

## 배치 보내기

검토가 완료되면 차이점 상단에 있는 `Send to agent`(상담원에게 보내기)를 클릭하세요. Orca은 모든 설명이 줄에 고정된 단일 프롬프트를 구성한 다음 작업 트리의 사용 가능한 에이전트에 대한 `Send notes to`(메모 보내기) 메뉴를 엽니다. 변경 사항을 수정해야 하는 에이전트를 선택하거나 동일한 메뉴에서 새 에이전트를 시작하세요.

**`Send Review Notes to Agent`(에이전트에 검토 메모 보내기)**는 다른 키 조합과 충돌하지 않도록 기본적으로 키가 할당되어 있지 않습니다. [`Settings`(설정) → `Shortcuts`(바로 가기)](/orca-docs-ko/docs/settings/)에서 할당하면 편집기에 포커스가 있을 때도 키보드로 보내기 메뉴를 열 수 있습니다.

## 왜 배치인가?

한 번에 하나씩 댓글을 보내면 에이전트가 앞뒤로 흔들리게 됩니다. 일괄 처리는 피드백의 일관성을 유지합니다. 즉, 한 번의 사고, 한 번의 수정 통과 및 훨씬 더 높은 적중률을 제공합니다.

## 회신, 해결, 재검토

- 상담원이 수정한 후에도 댓글은 고정되어 있습니다. 이를 사용하여 수정 사항을 확인하세요.
- 스레드를 축소하려면 `Resolve`(해결)을 클릭하세요.
- `Send`(보내기)를 다시 누르면 해결되지 않은 댓글은 다음 일괄 처리에 포함됩니다.
