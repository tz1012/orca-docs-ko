---
title: "브라우저 사용 프로필"
sourceUrl: https://www.onorca.dev/docs/browser/profiles
checkedAt: "2026-07-13T09:05:36.078Z"
editUrl: false
prev: /orca-docs-ko/docs/browser/design-mode/
next: /orca-docs-ko/docs/terminal/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

브라우저 사용 프로필을 사용하면 로그인한 사용자, 특정 쿠키 항아리, 사용자 정의 사용자 에이전트 등 특정 ID로 Orca 브라우저를 실행할 수 있습니다. 상담원이 로그인해야 하거나, 세션별 버그를 재현하거나, 여러 사용자를 에뮬레이트해야 할 때 유용합니다.

## 프로필 만들기

1. [설정 → 브라우저 → 프로필](/orca-docs-ko/docs/settings/)을 엽니다.
2. `Add profile`(프로필 추가)를 클릭하고 이름을 지정합니다.
3. 선택적으로 쿠키, 사용자 에이전트 및 뷰포트 크기를 시드합니다.

## 프로필 사용

브라우저 도구 모음에서 프로필을 선택합니다. 해당 창의 모든 탭은 전환할 때까지 이를 사용합니다. 에이전트 기반 브라우저 명령은 활성 프로필을 상속합니다.

## 격리

각 프로필에는 쿠키, 로컬 저장소, 캐시 등 자체 저장소 파티션이 있습니다. 프로필은 서로 유출되지 않습니다.
