---
title: "디자인 모드"
sourceUrl: https://www.onorca.dev/docs/browser/design-mode
checkedAt: "2026-07-29T01:03:00.276Z"
editUrl: false
prev: /orca-docs-ko/docs/browser/overview/
next: /orca-docs-ko/docs/browser/profiles/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

디자인 모드는 Orca 브라우저를 포인터-코드 도구로 전환합니다. 이를 켜고 렌더링된 페이지에서 UI 요소를 클릭하면 해당 요소가 DOM, 계산된 스타일 및 스크린샷과 함께 풍부한 컨텍스트로 에이전트 채팅에 드롭됩니다.

![디자인 모드: 버튼을 클릭하면 에이전트 채팅으로 이동](/orca-docs-ko/assets/mirror/36dcb51e0890d3cb943cac69aa607cb85e131537f862a8e5530c44dd1776e7af.jpg)

디자인 모드: 버튼을 클릭하면 상담원 채팅으로 이동됩니다.

## 켜세요

브라우저 툴바에서 `Design Mode`(디자인 모드) 토글을 클릭하세요. 커서가 선택 도구가 됩니다. 마우스를 올리면 그 아래의 요소가 강조 표시됩니다.

## 채팅에 참여하세요

요소를 클릭합니다. Orca 캡처:

- 요소의 HTML(외부 및 작은 이웃)
- 계산된 CSS — 색상, 글꼴, 간격.
- 요소의 잘린 스크린샷입니다.
- 개발 모드 소스 맵을 사용할 수 있는 경우 소스 file/line입니다.

이 모든 것이 활성 에이전트 터미널에 하나의 첨부 파일로 제공되며 변경하려는 내용을 입력하면 됩니다.

## 결과 사용

에이전트가 Orca 핫 리로드 소스를 편집하면 다시 클릭하여 확인하세요. 이 루프의 가장 엄격한 버전은 영웅 레시피 [디자인 모드로 UI 버그 수정](/orca-docs-ko/docs/recipes/design-mode-fix/)입니다.
