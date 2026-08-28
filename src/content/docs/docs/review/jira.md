---
title: "Jira 항목 서랍"
sourceUrl: https://www.onorca.dev/docs/review/jira
checkedAt: "2026-08-28T01:14:52.497Z"
editUrl: false
prev: /orca-docs-ko/docs/review/linear/
next: /orca-docs-ko/docs/editing/monaco/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Linear 또는 GitHub 항목을 연결하는 것과 같은 방식으로 Jira Cloud 또는 자체 호스팅 Server/Data Center 이슈를 탐색하고 편집하여 작업 트리에 연결합니다.

작업 서랍에서 Jira는 GitHub 및 Linear 옆에 있습니다. Orca를 벗어나지 않고 Jira 이슈를 탐색하고 업데이트하며 어떤 이슈에서든 작업 트리를 만들 수 있습니다.

## Jira 사이트 연결

1.  사이드바의 **`Tasks`(작업)** 항목을 열고 소스 선택기에서 **`Jira`**를 선택합니다. 자격 증명을 저장하기 전에도 Jira는 기본적으로 GitHub 및 Linear 옆에 있습니다.
2.  **`Connect Jira`(Jira 연결)**를 클릭합니다. **`Connect Jira site`(Jira 사이트 연결)** 대화 상자가 나타납니다.
3.  **`Cloud`(클라우드)** 또는 **`Self-hosted (Server / Data Center)`(자체 호스팅 서버/Data Center)**를 선택합니다.

**`Cloud`(클라우드)**

-   **`Jira Cloud site URL`(Jira Cloud 사이트 URL)** — 예: `https://example.atlassian.net`
-   **`Atlassian email`(이메일)** — Atlassian 계정의 주소입니다.
-   **`Atlassian API token`(API 토큰)** — [id.atlassian.com → `Security`(보안) → `API tokens`(API 토큰)](https://id.atlassian.com/manage-profile/security/api-tokens)에서 만듭니다.

**`Self-hosted`(자체 호스팅)**

-   **`Jira base URL`(Jira 기본 URL)** — Server/DC 기본 주소입니다(Jira가 `/`에 없으면 경로 포함).
-   인증 방식:
    -   **`Personal access token`(개인 액세스 토큰)** — Bearer PAT(최신 Server/DC에서 권장)
    -   **`Username and password`(사용자 이름 및 암호)** — PAT를 지원하지 않는 이전 인스턴스용 기본 인증

4.  **`Connect`(연결)**를 클릭합니다. Orca가 자격 증명을 확인하고 사이트를 불러옵니다.

Atlassian 사이트를 두 개 이상 연결할 수 있습니다. 사이트를 연결하면 `Tasks`(작업) 헤더에 사이트 선택기가 표시되며, **`All sites`(모든 사이트)**를 선택하면 여러 사이트의 이슈를 합쳐서 볼 수 있습니다.

Jira를 전혀 사용하지 않으면 [`Settings`(설정) → `Tasks`(작업)](/orca-docs-ko/docs/settings/)에서 소스 선택기의 Jira를 숨깁니다.

## Jira 사용하기

-   각 소스를 활성화하면 작업 서랍에 GitHub, Linear 및 Jira 이슈가 통합 목록으로 표시됩니다.
-   이슈를 열면 전체 설명, 댓글 및 메타데이터가 측면 서랍에 표시됩니다. 상태(사용 가능한 전환 사용), 우선순위, 담당자 및 사용자 지정 필드를 인라인으로 편집할 수 있습니다.
-   서랍의 댓글 작성기에서 댓글을 추가합니다.
-   **`New Jira issue`(새 Jira 이슈)** 대화 상자를 실수로 닫더라도—`Escape`(Esc 키), `Cancel`(취소), 바깥쪽 클릭 또는 닫기—제목과 설명을 유지합니다. 같은 앱 세션에서 대화 상자를 다시 열면 텍스트가 복원됩니다. 초안은 이슈 생성에 성공하면 지워지며 앱을 다시 시작한 뒤에는 유지되지 않습니다. 이슈 유형과 다른 선택기는 평소처럼 대화 상자를 열 때의 기본값을 사용합니다.
-   Jira 이슈에서 작업 트리를 만들면 작업 이름이 미리 채워지고 작업 트리가 이슈에 연결되어 리뷰와 이슈가 함께 유지됩니다.
-   **`Create workspace`(작업 공간 생성)** 대화 상자에서 Jira 이슈 URL(`https://…/browse/ABC-123`)을 이름 필드에 붙여 넣거나 필드를 **`Jira`(Jira)** 검색으로 전환해 텍스트로 이슈를 선택할 수도 있습니다. Orca은 작업 공간 이름을 채우고 이슈를 연결하며, 작업 트리 카드에 키와 요약을 **`View on Jira`(Jira에서 보기)**와 함께 표시합니다. 붙여넣기는 여러 사이트를 인식합니다. URL 출처와 일치하는 연결된 사이트가 여러 개이면 Orca이 사용할 사이트를 묻고, 일치하는 사이트가 없으면 해당 사이트가 연결되지 않았다고 알립니다.
-   Orca은 저장소별로 마지막에 사용한 작업 소스를 기억하므로 Jira 중심 저장소는 다음에 열 때 Jira가 기본값으로 선택됩니다.

자격 증명 저장 위치

Atlassian API 토큰 또는 자체 호스팅 자격 증명은 OS 키체인을 통해 암호화되어 로컬에 저장되며, 구성한 Jira 사이트를 호출할 때만 사용됩니다. Orca 사용을 중지하면 Atlassian 계정 설정에서 토큰을 취소합니다.

## 다음 단계

- [Linear 항목 서랍](/orca-docs-ko/docs/review/linear/) — Linear과 동일한 흐름입니다.
- [호스팅된 리뷰, 이슈 및 작업](/orca-docs-ko/docs/review/github/) — Jira 이슈가 진행되면 작업 트리를 호스팅된 리뷰에 전달합니다.
- [Orca에서 커밋 및 푸시](/orca-docs-ko/docs/review/commit-push/) — Orca을 떠나지 않고 브랜치를 전달합니다.
