---
title: "작업트리별 브라우저"
sourceUrl: https://www.onorca.dev/docs/browser/overview
checkedAt: "2026-08-24T01:32:32.260Z"
editUrl: false
prev: /orca-docs-ko/docs/editing/file-explorer/
next: /orca-docs-ko/docs/browser/design-mode/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

모든 Orca 작업 트리에는 자체 브라우저가 있습니다. 주소 표시줄, 기록, 개발자 도구 등이 창에 포함된 실제 Chromium 창입니다. 탭의 범위는 작업 트리로 지정되므로 빌드 중인 앱이 다른 작업에 방해가 되지 않습니다.

![주소 표시줄 및 탭 표시줄이 있는 작업 트리별 브라우저 창](/orca-docs-ko/assets/mirror/36dcb51e0890d3cb943cac69aa607cb85e131537f862a8e5530c44dd1776e7af.jpg)

주소 표시줄과 탭 표시줄이 있는 작업 트리별 브라우저 창

## 컨트롤

-   기록 및 퍼지 URL 완성 기능이 있는 주소 표시줄입니다. URL이 아닌 텍스트는 [**`Default Search Engine`(기본 검색 엔진)**](/orca-docs-ko/docs/settings/), 즉 [새 탭 옴니박스](/orca-docs-ko/docs/model/quick-open/#new-tab-omnibox)와 동일한 엔진으로 검색합니다. **+** 필드에서 검색을 강제하려면 검색어 앞에 `?`을 붙입니다.
-   뒤로/앞으로/새로고침/중지 컨트롤입니다. 새로고침 컨트롤 위에 마우스를 올리면 일반 새로고침 단축키가 표시됩니다. 마우스 오른쪽 버튼으로 클릭하거나 길게 누르면 **`Reload`(새로고침)** 및 **`Hard Reload`(강력 새로고침)**와 각 단축키가 표시됩니다. 강력 새로고침은 로컬 프런트엔드 자산을 반복 수정할 때 캐시를 우회합니다.
-   `Cmd-F` — 페이지에서 찾습니다.
-   `Cmd-T` — 이 작업 트리로 범위가 지정된 새 탭을 엽니다.
-   `Cmd-Shift-T` — 마지막으로 닫은 탭을 다시 엽니다.

## 작업 트리 범위 지정

탭은 작업 트리별로 필터링됩니다. 작업 트리를 전환하면 해당 작업 트리의 브라우저 탭과 스크롤 위치가 복원됩니다.

![세션이 유지되는 작업 트리별 브라우저 탭 — 클릭 한 번으로 Chrome 또는 Edge의 쿠키를 가져옵니다. Google 로그인은 가져오지 않으며, Google 로그인은 Orca에서 직접 진행합니다.](/orca-docs-ko/assets/mirror/46a59e38451d06e4b06df457f9f4f2449cbd1b46ad06906c7073f414e463be28.jpg)

세션이 유지되는 작업 트리별 브라우저 탭 — 클릭 한 번으로 Chrome 또는 Edge의 쿠키를 가져옵니다. Google 로그인은 가져오지 않으며, Google 로그인은 Orca에서 직접 진행합니다.

## 링크 라우팅

[`Settings`(설정) → `Browser`(브라우저) → `Link Routing`(링크 라우팅)](/orca-docs-ko/docs/settings/)에서 터미널, Markdown 및 편집기의 http(s) 링크를 Orca의 작업 트리별 브라우저로 열지 시스템 브라우저로 열지 선택합니다.

중첩된 **`Hold Shift…`(Shift 키 누르기…)** 토글은 플랫폼 수정 키(macOS에서는 `⇧⌘-click`, Windows/Linux에서는 `Shift+Ctrl+click`)를 사용한 한 번의 클릭에 대해 기본 동작을 반대로 전환합니다.

-   링크가 **Orca**에서 열리도록 설정된 경우 수정 키를 사용하면 해당 링크 하나를 시스템 브라우저로 보냅니다.
-   링크가 **시스템 브라우저**에서 열리도록 설정된 경우 토글을 켜면 수정 키를 사용한 링크 하나가 Orca의 내장 브라우저에서 대신 열립니다. 일반 클릭은 계속 시스템 브라우저에서 열립니다.

Remote/SSH 소스는 수정 키를 사용해도 Orca 브라우저 내부에서 열리지 않습니다. 터미널 링크에는 **`Orca Browser`(Orca 브라우저)** / **`System Browser`(시스템 브라우저)** 클릭 팝오버도 표시될 수 있습니다. [Terminal → Link actions(터미널 → 링크 작업)](/orca-docs-ko/docs/terminal/#link-actions)을 참조합니다.

## 다운로드

브라우저 다운로드는 활성 상태이거나 최근 완료된 동안 도구 모음 아래 선반에 표시되며, 진행 중인 다운로드 취소, 완료된 파일 열기, 해당 폴더에 표시 또는 행 닫기 등의 작업이 포함됩니다.

## 아티팩트로 공유

작업 트리 브라우저에서 연 로컬 HTML 파일은 도구 모음의 **`Share as artifact`(아티팩트로 공유)**를 사용하여 로그인한 Orca 계정을 통해 공개 보기 링크를 만들 수 있습니다. Markdown과 동일한 명시적 활성화 설정 및 관리 화면을 사용합니다. 상대 경로 HTML 자산은 업로드되지 않으므로 자체 완결형 파일을 공유하거나 절대 자산 URL을 사용합니다. [`Settings → Artifacts`(설정 → 아티팩트)](/orca-docs-ko/docs/settings/#artifacts) 및 [`CLI reference → Artifacts`(CLI 참조 → 아티팩트)](/orca-docs-ko/docs/cli/reference/#artifacts)를 참조합니다.

## 뷰포트 크기 에뮬레이션

전체 창의 크기를 조정하지 않고도 반응형 레이아웃을 테스트하려면 브라우저 탭에서 사용자 정의 뷰포트 크기를 설정하세요. Orca은 내부적으로 Chrome DevTools 프로토콜 장치 에뮬레이션을 사용하므로 페이지에서는 `window.innerWidth` 및 미디어 쿼리에서 에뮬레이트된 크기를 볼 수 있습니다.

## 자동화

또한 브라우저는 [Orca CLI](/orca-docs-ko/docs/cli/overview/) — `orca snapshot`, `orca click`, `orca fill` 등을 통해 에이전트에 의해 스크립트 가능합니다. 상호 작용하는 동일한 브라우저, 동일한 탭.

![CLI를 통해 Orca의 내장 브라우저를 구동하는 에이전트 - 동일한 탭, 동일한 세션](/orca-docs-ko/assets/mirror/26b9f203f989c417b6700e740565a9257f17c14a3a3dfad7340e040e837101e7.jpg)

CLI를 통해 Orca의 내장 브라우저를 구동하는 에이전트 — 동일한 탭, 동일한 세션

## 다음 단계

- [디자인 모드](/orca-docs-ko/docs/browser/design-mode/) — 브라우저를 포인터-코드 피드백 루프로 전환합니다.
- [브라우저 사용 프로필](/orca-docs-ko/docs/browser/profiles/) — 특정 로그인, 쿠키 jar 또는 사용자 에이전트를 사용하여 브라우저를 실행합니다.
