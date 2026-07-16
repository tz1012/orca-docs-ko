---
title: "Jira 항목 서랍"
sourceUrl: https://www.onorca.dev/docs/review/jira
checkedAt: "2026-07-16T01:03:39.973Z"
editUrl: false
prev: /orca-docs-ko/docs/review/linear/
next: /orca-docs-ko/docs/editing/monaco/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Linear 또는 GitHub 항목을 연결하는 것과 동일한 방식으로 Jira Cloud 이슈를 찾아보고 편집하고 작업 트리에 연결합니다.

Jira는 작업 서랍의 GitHub 및 Linear 옆에 있습니다. Orca을 떠나지 않고도 Jira Cloud 이슈를 탐색하고, 업데이트하고, 모든 이슈에서 작업 트리를 생성할 수 있습니다.

## Jira 사이트 연결

1. `Tasks`(작업) 사이드바 항목을 열고 소스 선택기에서 **Jira**를 선택합니다. Jira는 자격 증명이 저장되기 전에도 기본적으로 GitHub 및 Linear 옆에 있습니다.
2. `Connect Jira`(Jira 연결)을 클릭합니다. `Connect Jira site`(Jira 사이트 연결) 대화 상자가 나타납니다.
3. 세 가지 필드를 입력합니다.
    - `Jira Cloud site URL`(Jira Cloud 사이트 URL) — 예: `https://example.atlassian.net`.
    - `Atlassian email`(Atlassian 이메일) — Atlassian 계정의 주소입니다.
    - `Atlassian API token`(Atlassian API 토큰) — [id.atlassian.com → 보안 → API 토큰](https://id.atlassian.com/manage-profile/security/api-tokens)에서 하나를 만듭니다.
4. `Connect`(연결)을 클릭합니다. Orca은 자격 증명을 확인하고 사이트를 로드합니다.

둘 이상의 Atlassian 사이트를 연결할 수 있습니다. 사이트가 연결되면 작업 헤더에 사이트 선택기가 있습니다. `All sites`(모든 사이트)를 선택하여 여러 사이트의 문제를 결합합니다.

Jira를 전혀 사용하지 않는 경우 [설정 → 작업](/orca-docs-ko/docs/settings/)을 통해 소스 선택기에서 숨기세요.

## Jira 사용하기

- 각 소스가 활성화되면 작업 서랍에 GitHub, Linear 및 Jira 문제가 통합 목록으로 표시됩니다.
- 이슈를 열어 측면 서랍에서 전체 설명, 댓글, 메타데이터를 확인하세요. 상태(사용 가능한 전환을 통해), 우선순위, 담당자 및 사용자 정의 필드를 인라인으로 편집합니다.
- 서랍의 댓글 작성기에서 댓글을 추가하세요.
- Jira 이슈에서 작업 트리를 생성하면 작업 이름이 미리 채워지고 작업 트리가 이슈에 연결되므로 리뷰와 이슈가 함께 연결됩니다.
- Orca은 리포지토리별로 마지막으로 사용된 작업 소스를 기억하므로 Jira 기반 리포지토리는 다음 번 열 때 기본적으로 Jira로 설정됩니다.

토큰이 사는 곳

Atlassian API 토큰은 OS 키체인을 통해 암호화되어 로컬에 저장됩니다. 이는 구성된 Jira 사이트를 호출하는 데에만 사용됩니다. Orca 사용을 중지하는 경우 Atlassian 계정 설정을 취소하세요.

## 다음 단계

- [Linear 항목 서랍](/orca-docs-ko/docs/review/linear/) — Linear과 동일한 흐름입니다.
- [호스팅된 리뷰, 이슈 및 작업](/orca-docs-ko/docs/review/github/) — Jira 이슈가 진행되면 작업 트리를 호스팅된 리뷰에 전달합니다.
- [Orca에서 커밋 및 푸시](/orca-docs-ko/docs/review/commit-push/) — Orca을 떠나지 않고 브랜치를 전달합니다.
