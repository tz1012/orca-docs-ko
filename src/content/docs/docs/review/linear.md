---
title: "선형 항목 서랍"
sourceUrl: https://www.onorca.dev/docs/review/linear
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: /orca-docs-ko/docs/review/github/
next: /orca-docs-ko/docs/review/jira/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Linear는 작업 서랍의 호스팅 리뷰 제공자 옆에 있습니다. GitHub 문제를 연결하는 것과 동일한 방식으로 선형 문제를 작업 트리에 찾아보고 생성하고 업데이트하고 연결합니다.

## 설정

1. [설정 → 통합 → 선형](/orca-docs-ko/docs/settings/)을 엽니다.
2. [선형 → 설정 → API](https://linear.app/settings/api)에서 개인 API 토큰을 붙여넣습니다.
3. 보고 싶은 팀을 선택하세요.

## 선형 사용

- 작업 서랍에는 GitHub 및 선형 문제가 하나의 결합된 보기로 표시됩니다.
- 선형 이슈에서 작업 트리를 생성하면 이름이 미리 채워지고 이슈 ID가 첨부됩니다.
- 이슈 세부정보 보기를 열어 상태, 담당자, 우선순위, 라벨, 견적 등의 필드를 업데이트하세요. Priority는 Linear의 자체 우선순위 아이콘으로 렌더링되므로 서랍이 Linear 자체에서 표시되는 것과 일치합니다.
- 선형 이슈에서 에이전트를 시작하면 Orca에는 프롬프트 컨텍스트의 이슈 설명, 댓글 및 하위 이슈에 포함된 모든 인라인 이미지와 미디어가 포함되므로 스크린샷을 직접 붙여넣을 필요 없이 에이전트가 모형이나 버그 재현을 볼 수 있습니다.
- 긴 목록은 `Load more`(더 보기) 작업으로 페이지를 매깁니다. 프로젝트에 초기 서랍에 들어갈 수 있는 것보다 더 많은 문제가 있을 때 유용합니다.
- Orca는 저장소별로 마지막으로 사용한 작업 소스(GitHub, Linear 또는 Jira)를 기억합니다.

선형 상태 동기화(작업 트리가 생성될 때 문제를 "진행 중"으로 이동)는 팀별로 선택됩니다.

## 다음 단계

- [호스팅된 검토, 문제 및 작업](/orca-docs-ko/docs/review/github/) — 작업이 진행된 후 코드 검토 상태를 작업 트리에 연결합니다.
- [Orca에서 커밋 및 푸시](/orca-docs-ko/docs/review/commit-push/) - Orca를 떠나지 않고 브랜치를 배송합니다.
