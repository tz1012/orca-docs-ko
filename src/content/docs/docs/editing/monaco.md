---
title: "모나코 편집기 및 자동 저장"
sourceUrl: https://www.onorca.dev/docs/editing/monaco
checkedAt: "2026-08-05T01:03:39.454Z"
editUrl: false
prev: /orca-docs-ko/docs/review/jira/
next: /orca-docs-ko/docs/editing/markdown/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca의 코드 편집기는 VS Code가 사용하는 것과 동일한 편집기인 Monaco이며 몇 가지 Orca 관련 수정 사항이 있습니다.

## 자동 저장

흐려지거나 짧은 유휴 기간이 지나면 파일이 저장됩니다. 일반 흐름에는 저장되지 않은 변경 사항이 없기 때문에 "더티" 점이 없습니다.

## 다중 커서, 이동, 찾기

-   `Cmd-D` — 다음 일치 항목을 선택합니다.
-   `Cmd-F` / `Cmd-Shift-F` — 파일 찾기/작업 트리 찾기를 실행합니다. 텍스트가 선택되어 있으면 파일 찾기에서 현재 선택 영역을 검색 상자의 초기값으로 사용합니다.
-   `Cmd-Click` — 언어 확장이 지원하는 경우 정의로 이동합니다.

## 보기 모드 변경

편집기 탭에서 `Changes view mode`(보기 모드)를 전환하여 커서 위치를 벗어나지 않고 파일을 탭 내 HEAD-vs-working-tree diff로 뒤집습니다. [Diff 뷰어](/orca-docs-ko/docs/review/diff-viewer/)와 동일한 단축키 — `n`/`p` - 덩어리를 걷고, `s`를 스테이지로 이동합니다. 일반 파일 보기로 돌아가려면 다시 전환하세요.

## 자동 줄 바꿈

파일 편집기는 기본적으로 긴 줄을 줄 바꿈합니다. 편집기 탭의 **⋯** 메뉴에서 **`Word Wrap`(자동 줄 바꿈)**을 전환하거나, `Alt+Z`을 누르거나(VS Code와 동일하며 [`Settings`(설정) → `Shortcuts`(바로 가기)](/orca-docs-ko/docs/settings/)에서 다시 매핑할 수 있음), [`Settings`(설정) → `General`(일반) → `Editor Word Wrap`(편집기 자동 줄 바꿈)](/orca-docs-ko/docs/settings/)에서 기본값을 설정합니다. 이 설정은 diff 편집기에만 영향을 주는 **`Diff Word Wrap`(diff 자동 줄 바꿈)**과 별개입니다.

## 미니맵

미니맵은 파일 편집기의 [설정 → 모양](/orca-docs-ko/docs/settings/)에서 사용할 수 있습니다. 기본적으로 꺼져 있습니다. VS Code 스타일 개요 레일을 선호하는 경우 이 기능을 켜세요.

## 사용자 정의 편집기 글꼴

기본적으로 편집기와 diff 보기는 터미널과 동일한 글꼴을 사용합니다. 이 연결을 유지하려면 [`Settings`(설정) → `Appearance`(모양)](/orca-docs-ko/docs/settings/)에서 **`Editor Font Family`(편집기 글꼴 패밀리)**를 비워 둡니다. 글꼴을 설정하면 편집기에만 적용되며 UI 글꼴은 별도로 유지됩니다.

## 언어 지원

Monaco가 기본적으로 지원하는 언어에 대한 구문 강조 기능이 제공됩니다. Orca은 의도적으로 IDE 우선이 아닌 편집기 우선입니다. 터미널 창에서 유형 검사기와 린터를 실행합니다.
