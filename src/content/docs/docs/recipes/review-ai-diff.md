---
title: "AI 차이점을 한 줄씩 검토합니다."
sourceUrl: https://www.onorca.dev/docs/recipes/review-ai-diff
checkedAt: "2026-09-03T01:05:09.592Z"
editUrl: false
prev: /orca-docs-ko/docs/recipes/parallel-agents/
next: /orca-docs-ko/docs/recipes/jump-worktrees/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

AI 차이점을 잘 검토하는 것은 빠른 배송과 버그 배송의 차이입니다. 여기에 루프가 있습니다.

## 단계

1. 작업 트리의 Diff 보기를 엽니다.
2. `j` / `k`를 사용하여 파일별로 이동합니다. 각 덩어리에 대해 다음과 같이 질문하십시오. 변경이 필요한가요? 최소한인가요? 파일의 나머지 부분과 일치합니까?
3. 변경하고 싶은 내용에 `c`을 사용하여 댓글을 남겨주세요. 완전한 문장이 가장 좋습니다.
4. 전체 비교 과정을 마친 후 `Send to agent`(에이전트에게 보내기)를 클릭하세요. Orca는 모든 설명을 하나의 프롬프트로 일괄 처리합니다.
5. 상담원이 수정하는 모습을 지켜보세요. 상태 점이 노란색(추가 입력 대기 중) 또는 녹색(작동 중)으로 변합니다.
6. 유휴 상태일 때 diff를 다시 엽니다. 귀하의 댓글은 고정되어 있습니다. 수정된 부분은 해결하고 나머지 부분은 후속 조치를 남겨주세요.
7. 깨끗해질 때까지 반복한 다음 커밋합니다.
