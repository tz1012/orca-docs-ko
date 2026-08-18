---
title: "브라우저 사용 프로필"
sourceUrl: https://www.onorca.dev/docs/browser/profiles
checkedAt: "2026-08-18T00:27:24.492Z"
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

1. [`Settings`(설정) → `Browser`(브라우저) → `Profiles`(프로필)](/orca-docs-ko/docs/settings/)을 엽니다.
2. **`Add profile`(프로필 추가)**을 클릭하고 이름을 지정합니다.
3. 선택적으로 쿠키, 사용자 에이전트 및 뷰포트 크기를 초기값으로 설정합니다.
4. Orca의 기본 Chrome 형식 사용자 에이전트를 거부하는 사이트(일부 Google 로그인 흐름 등)에서는 위장하지 않고 **`native Electron user agent`(기본 Electron 사용자 에이전트)**를 유지하는 프로필을 만듭니다. 기본 프로필은 Cloudflare와의 폭넓은 호환성을 위해 정리된 Chrome 사용자 에이전트를 계속 사용합니다.

브라우저 설정을 스크립트로 구성할 때는 CLI에서 `orca tab profile create --no-ua-spoof`을 사용하여 사용자 에이전트를 위장하지 않는 프로필을 만들 수도 있습니다.

## 쿠키 가져오기 및 Google 로그인

`Settings`(설정) 또는 브라우저 도구 모음에서 Chrome이나 Edge의 쿠키(또는 쿠키 파일)를 프로필로 가져옵니다. Google 쿠키는 제외됩니다. 가져오기 메뉴에는 **`Google logins aren't imported`(로그인은 가져오지 않음)**이 표시되고 **`Sign in to Google directly in Orca.`(직접 로그인)**이라고 안내합니다. Google 쿠키를 건너뛴 가져오기가 끝나면 가져오기를 실행한 호스트를 명시하는 별도 경고가 표시됩니다. 해당 호스트의 Orca에서 같은 프로필로 브라우저를 연 다음 로그인합니다.

## 프로필 사용

브라우저 도구 모음에서 프로필을 선택합니다. 해당 창의 모든 탭은 전환할 때까지 이를 사용합니다. 에이전트 기반 브라우저 명령은 활성 프로필을 상속합니다.

## 격리

각 프로필에는 쿠키, 로컬 저장소, 캐시 등 자체 저장소 파티션이 있습니다. 프로필은 서로 유출되지 않습니다.
