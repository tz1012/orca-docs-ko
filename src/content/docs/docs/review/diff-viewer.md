---
title: "차이점 뷰어"
sourceUrl: https://www.onorca.dev/docs/review/diff-viewer
checkedAt: "2026-08-14T01:08:16.788Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/hooks-memory/
next: /orca-docs-ko/docs/review/annotate-ai-diff/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca의 diff 뷰어는 AI 생성 코드를 잠깐 살펴보는 것이 아니라 진지하게 검토하도록 설계되었습니다. 모든 작업 트리에는 시작부터 참조에 대한 내장 차이점이 있습니다.

## 기능

-   스테이징된 파일, 스테이징되지 않은 파일 및 추적되지 않은 모든 파일의 **`Combined diff`(결합된 차이)**를 표시합니다.
-   양쪽의 **`Line numbers`(줄 번호)**를 표시하며 전환할 수 있습니다.
-   **`Image diffs`(이미지 차이)**는 바이너리 이미지를 나란히 보기, 스와이프 및 어니언 스킨 모드로 표시합니다.
-   **`HTML preview`(HTML 미리 보기)**는 **`View all`(모두 보기)** / 결합된 차이에서 작업 트리에 여전히 존재하는 HTML 섹션의 항상 표시되는 파일 열기 컨트롤 옆에 **`Open Preview to the Side`(옆에서 미리 보기 열기)**(눈 모양)를 표시합니다. 미리 보기는 작업 트리의 HTML을 측면 브라우저 분할 창에서 엽니다. 삭제된 HTML 및 커밋 전용 결합 화면에는 눈 모양이 표시되지 않습니다.
-   **`Merge-conflict UI`(병합 충돌 UI)**는 3방향 보기와 인라인 해결 기능을 제공합니다.
-   **`Staging by hunk or line`(덩어리 또는 줄별 스테이징)**은 `git add -p`과 동일한 작업을 시각적으로 수행합니다.

## 범위 지정

diff는 기본적으로 작업 트리의 시작 참조에 대한 변경 사항을 표시합니다. diff 도구 모음에서 커밋, 브랜치 또는 기본 참조에 대한 비교로 전환할 수 있습니다.

## 단어 줄 바꿈

diff 단어 줄 바꿈이 켜져 있으면 긴 줄이 제자리에 배치되므로 넓은 diff는 가로 스크롤 없이 위에서 아래로 읽혀집니다. 기본적으로 꺼져 있습니다. diff 편집기 헤더의 `⋯`(더보기) 작업 메뉴에서 `Word Wrap`(자동 줄 바꿈)을 전환하거나 `Settings → General → Diff Word Wrap`(설정 → 일반 → Diff 단어 줄 바꿈)에서 전역 기본값을 설정합니다. 두 컨트롤 모두 동일한 설정을 공유합니다. 즉, 편집기에서 전환하면 모든 위치에서 반전됩니다.

## 파일 트리

통합 diff에서는 헝크 옆에 접을 수 있는 파일 트리를 표시할 수 있습니다. 트리의 크기 조절 핸들을 드래그하거나 핸들에서 화살표 키를 사용하여 너비를 설정합니다. Shift를 누르면 조절 단위가 커지며, 크기는 세션 간에 기억됩니다. 통합 diff 도구 모음에서 트리를 접거나 표시할 수 있습니다.

## 키보드 단축키

- `j` / `k` — 다음/이전 변경 파일로 이동합니다.
- `n` / `p` — 다음/이전 변경 구간으로 이동합니다.
- `F7` / `Shift+F7` — 활성 편집기의 다음/이전 변경 사항으로 이동합니다.
- `s` — 커서가 있는 변경 구간을 스테이징합니다.
- `c` — 댓글 작성을 시작합니다([`Annotate AI Diff`(AI diff 주석 달기)](/orca-docs-ko/docs/review/annotate-ai-diff/)).
