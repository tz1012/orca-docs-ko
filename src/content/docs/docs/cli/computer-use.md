---
title: "컴퓨터 사용"
sourceUrl: https://www.onorca.dev/docs/cli/computer-use
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/automations/
next: /orca-docs-ko/docs/cli/worktree-checkpoints/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

접근성 트리, 스크린샷, 안전한 UI 작업을 통해 에이전트에서 로컬 데스크톱 앱을 구동합니다.

'orca computer' CLI를 사용하면 에이전트가 기본 데스크톱 앱을 검사하고 제어할 수 있습니다. 즉, 실행 중인 앱 목록을 표시하고, 접근성 트리를 읽고, 컨트롤을 클릭하고, 값을 설정하고, 텍스트를 입력하고, 스크롤하고, 스크린샷을 찍을 수 있습니다. 터미널이나 내장 브라우저가 아닌 OS나 타사 앱을 구동해야 하는 작업에 사용하세요.

베타

컴퓨터를 사용하려면 플랫폼별로 기본 도우미가 제공되며 접근성(및 macOS에서는 화면 녹화) 권한이 필요합니다. 명령 표면은 기술을 구축하기에 충분히 안정적이지만 플래그 이름은 여전히 ​​바뀔 수 있습니다.

## 최초 설정

런타임 및 권한을 확인하세요.

````
orca status --json
orca computer permissions --json
orca computer capabilities --json
````

'permissions'에서 누락된 항목이 보고되면 시스템 설정에서 `Orca Computer Use`(컴퓨터 사용)에 접근성(및 macOS의 화면 녹화)을 부여한 다음 'permissions --json'을 다시 실행하여 확인하세요.

## 스냅샷 → 행동 → 스냅샷

모든 상호작용은 동일한 루프를 따릅니다. 즉, 앱의 현재 상태를 읽고 특정 요소에 대해 작업을 수행한 다음 상태를 다시 읽어 결과를 확인합니다.

````
orca computer list-apps --json
orca computer get-app-state --app com.spotify.client --json
orca computer click --app com.spotify.client --element-index 42 --json
````

요소 인덱스의 범위는 최신 `get-app-state` 결과로 지정됩니다. 탐색, 포커스 변경, 스크롤 또는 앱 다시 렌더링 후 인덱스를 재사용하기 전에 상태를 새로 고칩니다.

## 앱 선택

`list-apps`에서 반환된 번들 ID를 선호합니다.

````
orca computer get-app-state --app com.microsoft.edgemac --json
````

앱 이름은 명확해야 작동합니다(`--app Spotify`). 번들 ID와 이름이 모두 충돌하는 경우에만 '--app pid:<number>'를 사용하세요.

## 사용 가능한 작업

````
orca computer click --app <app> --element-index <i> --json
orca computer set-value --app <app> --element-index <i> --value "text" --json
orca computer type-text --app <app> --text "text" --json
orca computer press-key --app <app> --key Return --json
orca computer hotkey --app <app> --key CmdOrCtrl+A --json
orca computer paste-text --app <app> --text "text" --json
orca computer scroll --app <app> --element-index <i> --direction down --json
orca computer drag --app <app> --from-x 100 --from-y 100 --to-x 300 --to-y 300 --json
orca computer perform-secondary-action --app <app> --element-index <i> --action <name> --json
````

원시 `type-text` 또는 `press-key`보다 의미 체계 작업(`click`, `set-value`, `perform-secondary-action`)을 선호합니다. 이는 접근성 요소를 직접 대상으로 하며 키보드 입력이 수행하지 않는 포커스 변경에도 유지됩니다.

## 민감한 입력

쉘 기록에 기록되지 않도록 stdin을 통해 비밀을 전달하십시오.

````
printf '%s' "$TEXT" | orca computer set-value \
  --app com.apple.Safari --element-index 7 --value-stdin --json
````

`--text-stdin`은 `type-text` 및 `paste-text`에 대해 동일한 방식으로 작동합니다.

## 스크린샷

`get-app-state`은 접근성 트리와 기본적으로 스크린샷을 반환합니다. `--json`를 사용하면 이미지 바이트가 디스크에 기록되고 경로가 응답에 포함되지 않고 `screenshot.path`에 반환됩니다. 픽셀이 필요하지 않은 경우 '--no-screenshot'를 전달하세요(더 빠르고 작은 페이로드). 캡처하기 전에 숨겨진 창이나 최소화된 창을 표시하려면 '--restore-window'를 전달하세요.

## 상담원으로부터 사용하세요

제공된 `computer-use` 스킬은 안전 안내와 함께 동일한 명령 표면을 패키지합니다. 에이전트의 스킬 디렉터리에 설치합니다.

````
npx skills add https://github.com/stablyai/orca --skill computer-use
````

스킬을 선택하는 방법은 [스킬 등록 및 MCP](/orca-docs-ko/docs/cli/skills/)를 참조하세요.

## 다음 단계

- [Orca CLI 개요](/orca-docs-ko/docs/cli/overview/) - 나머지 CLI 표면(작업 트리, 터미널, 브라우저).
- [기술 레지스트리 및 MCP](/orca-docs-ko/docs/cli/skills/) — 이 CLI를 에이전트에 배포합니다.
