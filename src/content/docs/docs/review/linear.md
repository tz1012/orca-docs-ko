---
title: "Linear 항목 서랍"
sourceUrl: https://www.onorca.dev/docs/review/linear
checkedAt: "2026-09-01T01:03:52.289Z"
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
-   Linear 작업 보기에서 **`Has Workspace`(작업 공간 있음)** 모드를 사용하면 로컬 작업 트리 또는 폴더 작업 공간에 이미 연결된 이슈만 표시할 수 있습니다. 작업 공간이 연결된 행을 선택하면 해당 작업 공간이 열리며, 두 번째 체크아웃이 필요하면 같은 이슈에서 새 작업 공간을 시작할 수도 있습니다.
-   Linear 이슈에서 작업 트리를 만들면 GitHub 항목과 같은 경로의 대화형 작업 공간 작성기가 열리므로 이슈 명령 자동화, SSH 및 폴더 작업 공간을 적용할 수 있습니다. Orca는 이름을 미리 채우고 이슈 ID를 연결합니다. Linear가 이슈의 브랜치 이름을 제공하면 Orca는 제목 슬러그만 사용하지 않고 해당 이름을 작업 트리 브랜치로 사용합니다. 이는 Linear가 제안하는 이름과 같습니다. 이슈 세부 정보 메뉴에서 **`Copy suggested branch name`(제안 브랜치 이름 복사)**을 사용할 수 있습니다.
-   작업 공간 카드에서 **`Edit Worktree Details`(작업 트리 세부 정보 편집)**을 열고 **`Issue`(이슈)** 필드의 **Linear** 칩을 사용하거나 Linear URL을 붙여넣으면 작업 트리를 다시 만들지 않고 이슈를 연결하거나 변경할 수 있습니다. GitHub와 Linear은 이 필드를 공유하므로 새 연결을 저장하면 이전 공급자 연결이 대체됩니다.
-   이슈 세부 정보 보기를 열면 상태, 담당자, 우선순위, 레이블 및 추정치 같은 필드를 업데이트할 수 있습니다. 우선순위는 Linear의 자체 우선순위 아이콘으로 렌더링되어 서랍과 Linear 화면이 일치합니다.
-   Linear 이슈에서 에이전트를 실행하면 Orca는 이슈 설명, 댓글 및 하위 이슈에 포함된 인라인 이미지와 미디어를 프롬프트 컨텍스트에 포함합니다. 스크린샷을 직접 붙여넣지 않아도 에이전트가 목업이나 버그 재현을 확인할 수 있습니다.
-   **`New Linear issue`(새 Linear 이슈)** 및 **`New Linear project`(새 Linear 프로젝트)** 대화 상자를 실수로 닫더라도(`Escape`(Esc 키), `Cancel`(취소), 바깥쪽 클릭 또는 닫기) title/description을 유지합니다. 프로젝트의 경우 이름, 요약 및 개요도 유지합니다. 같은 앱 세션에서 대화 상자를 다시 열면 텍스트가 복원됩니다. 초안은 생성에 성공하면 지워지며 앱을 다시 시작한 뒤에는 유지되지 않습니다. Team/project 선택기는 평소처럼 대화 상자를 열 때의 기본값을 사용합니다.
-   긴 목록은 **`Load more`(더 불러오기)** 작업으로 페이지를 나눕니다. 프로젝트의 이슈가 초기 서랍에 표시할 수 있는 수보다 많을 때 유용합니다.
-   목록/보드 보기, 그룹화, 정렬, 표시 열 및 속성 필터 같은 레이아웃 선택은 앱을 다시 시작해도 유지됩니다. 속성 필터는 **Linear 작업 공간별로** 저장되므로 작업 공간을 전환해도 다른 작업 공간의 필터 조건이 적용되지 않습니다.
-   Orca는 저장소별로 마지막으로 사용한 작업 소스(GitHub, Linear 또는 Jira)를 기억합니다.

Linear 상태 동기화(작업 트리가 생성될 때 문제를 "진행 중"으로 이동)는 팀별로 선택됩니다.

## 에이전트와 CLI

에이전트는 `orca linear` 및 `orca-linear` 스킬을 통해 Linear을 읽고 쓸 수 있습니다. 이 인터페이스에는 MCP 호환 create/update, 목록 필터(`save-issue`, `list-issues`, 관계 add/remove), `--activity` 및 `--full` 같은 이슈 컨텍스트 플래그가 포함됩니다. [CLI 참조 → Linear](/orca-docs-ko/docs/cli/reference/#linear)을 참조합니다.

## 다음 단계

- [호스팅된 검토, 문제 및 작업](/orca-docs-ko/docs/review/github/) — 작업이 진행된 후 코드 검토 상태를 작업 트리에 연결합니다.
- [Orca에서 커밋 및 푸시](/orca-docs-ko/docs/review/commit-push/) - Orca를 떠나지 않고 브랜치를 배송합니다.
