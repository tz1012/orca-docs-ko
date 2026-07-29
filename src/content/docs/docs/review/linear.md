---
title: "Linear 항목 서랍"
sourceUrl: https://www.onorca.dev/docs/review/linear
checkedAt: "2026-07-29T01:03:00.276Z"
editUrl: false
prev: /orca-docs-ko/docs/review/github/
next: /orca-docs-ko/docs/review/jira/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Linear은 작업 서랍의 호스팅 리뷰 제공자 옆에 있습니다. GitHub 문제를 연결하는 것과 동일한 방식으로 Linear 문제를 찾아보고 생성하고 업데이트하고 작업 트리에 연결합니다.

## 설정

1. [설정 → 통합 → Linear](/orca-docs-ko/docs/settings/)을 엽니다.
2. [Linear → 설정 → API](https://linear.app/settings/api)에서 개인 API 토큰을 붙여넣습니다.
3. 보고 싶은 팀을 선택하세요.

## Linear 사용

-   작업 서랍은 GitHub 및 Linear 이슈를 하나의 통합 보기에 표시합니다.
-   Linear 이슈에서 작업 트리를 만들면 이름이 미리 채워지고 이슈 ID가 연결됩니다. Linear가 이슈의 브랜치 이름을 제공하면 Orca는 제목 슬러그만 사용하지 않고 해당 이름을 작업 트리 브랜치로 사용합니다(Linear가 제안하는 이름과 동일). 이슈 세부 정보 메뉴에서 **`Copy suggested branch name`(제안 브랜치 이름 복사)**을 사용할 수 있습니다.
-   이슈 세부 정보 보기를 열면 상태, 담당자, 우선순위, 레이블 및 추정치 같은 필드를 업데이트할 수 있습니다. 우선순위는 Linear의 자체 우선순위 아이콘으로 렌더링되어 서랍과 Linear 화면이 일치합니다.
-   Linear 이슈에서 에이전트를 실행하면 Orca은 이슈 설명, 댓글 및 하위 이슈에 포함된 인라인 이미지와 미디어를 프롬프트 컨텍스트에 포함합니다. 스크린샷을 직접 붙여 넣지 않아도 에이전트가 목업이나 버그 재현을 확인할 수 있습니다.
-   긴 목록은 **`Load more`(더 불러오기)** 작업으로 페이지를 나눕니다. 프로젝트의 이슈가 초기 서랍에 표시할 수 있는 수보다 많을 때 유용합니다.
-   Orca는 저장소별로 마지막으로 사용한 작업 소스(GitHub, Linear 또는 Jira)를 기억합니다.

Linear 상태 동기화(작업 트리가 생성될 때 문제를 "진행 중"으로 이동)는 팀별로 선택됩니다.

## 에이전트와 CLI

에이전트는 `orca linear` 및 `orca-linear` 스킬을 통해 Linear을 읽고 쓸 수 있습니다. 이 인터페이스에는 MCP 호환 create/update, 목록 필터(`save-issue`, `list-issues`, 관계 add/remove), `--activity` 및 `--full` 같은 이슈 컨텍스트 플래그가 포함됩니다. [CLI 참조 → Linear](/orca-docs-ko/docs/cli/reference/#linear)을 참조합니다.

## 다음 단계

- [호스팅된 검토, 문제 및 작업](/orca-docs-ko/docs/review/github/) — 작업이 진행된 후 코드 검토 상태를 작업 트리에 연결합니다.
- [Orca에서 커밋 및 푸시](/orca-docs-ko/docs/review/commit-push/) - Orca를 떠나지 않고 브랜치를 배송합니다.
