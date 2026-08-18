---
title: "Orca CLI 개요"
sourceUrl: https://www.onorca.dev/docs/cli/overview
checkedAt: "2026-08-18T00:27:24.492Z"
editUrl: false
prev: /orca-docs-ko/docs/remote-servers/
next: /orca-docs-ko/docs/cli/reference/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca CLI를 사용하여 터미널에서 Orca를 스크립팅하고, 작업 트리를 관리하고, 에이전트 터미널을 제어하고, 내장 브라우저를 자동화하고, 에이전트 기술을 설치하십시오.

Orca CLI는 `orca` 명령줄 인터페이스로, 모든 셸에서 실행 중인 Orca 편집기를 스크립팅합니다. 이를 사용하여 작업 트리를 생성 및 검사하고, 에이전트 터미널을 구동하고, 파일과 차이점을 열고, 내장 브라우저를 자동화하고, 예약된 자동화를 실행하고, HTML/Markdown 아티팩트를 공유하고, 스크립트 또는 AI 에이전트에서 Orca 기본 도구를 제어합니다.

데스크톱 앱에 포함되어 있으며 [`Settings`(설정) → `General`(일반) → `Orca CLI`](/orca-docs-ko/docs/settings/)에서 등록합니다.

에이전트는 다음을 사용하여 일치하는 Orca CLI 기술을 설치할 수 있습니다.

```
npx skills add https://github.com/stablyai/orca --skill orca-cli
# headless / no Settings UI:
orca skills install --skill orca-cli
```

[스킬 레지스트리 및 MCP](/orca-docs-ko/docs/cli/skills/)에서 설치할 수 있는 모든 Orca 스킬과 `orca skills install` / `orca skills update` 사용법을 확인합니다.

![Orca CLI — 모든 셸에서 작업 트리, 터미널 및 내장 브라우저 구동](/orca-docs-ko/assets/mirror/88450513fdc1327a1819317c9a012ccc3f0cad28b6921ee9a78c4c2ad8a4a1c0.jpg)

Orca CLI — 모든 셸에서 작업 트리, 터미널 및 내장 브라우저를 구동합니다.

## 설치 및 확인

````
command -v orca
orca status --json
````

## 작업트리 명령

````
orca worktree ps --json
orca worktree create --repo id:<repoId> --name my-task --issue 123 --json
orca worktree current --json
orca worktree set --worktree active --comment "reproduced bug" --json
orca worktree rm --worktree id:<id> --force --json
````

선택기, 설정 플래그, parent/child 작업 트리 및 더 광범위한 명령 맵은 [Orca CLI 참조](/orca-docs-ko/docs/cli/reference/)를 참조하세요.

## 터미널 명령

````
orca terminal list --json
orca terminal read --json
orca terminal send --text "continue" --enter --json
orca terminal wait --for tui-idle --timeout-ms 30000 --json
orca terminal create --worktree path:/projects/app --command "npm test" --json
orca terminal split --direction vertical --command "npm run dev" --json
````

추적된 다중 에이전트 작업의 경우 일반 터미널 프롬프트 대신 [Orchestration](/orca-docs-ko/docs/cli/orchestration/)을 사용하세요.

## 파일 명령

셸에서 활성 Orca 작업 트리의 파일 및 차이점을 엽니다.

````
orca file open src/App.tsx
orca file diff src/App.tsx --staged
orca file open-changed --mode both
````

셸의 현재 디렉터리가 대상 작업 트리 내부에 없으면 `--worktree <selector>`을 사용하세요.

## 브라우저 프로필

브라우저 프로필은 탭 세션 상태를 격리하므로 스크립트나 에이전트가 다양한 쿠키, 로컬 저장소 및 로그인 ID를 사용하여 테스트할 수 있습니다. CLI는 `orca tab profile` 아래에 프로필 명령을 표시합니다. `orca tab profile list --json`로 시작한 다음 필요에 따라 `create`, `set`, `clone` 또는 `use-default`을 사용하세요.

## 예약된 자동화

셸에서 예약된 Orca 작업을 생성, 검사, 실행 및 제거하려면 `orca automations`을 사용하세요. 저장소 또는 기존 작업 트리에 대해 반복 프롬프트를 실행하려면 [예약된 자동화](/orca-docs-ko/docs/cli/automations/)로 시작하세요.

## 아티팩트

로그인한 Orca 계정을 통해 HTML 또는 Markdown을 공개 보기 링크로 공유합니다(`orca artifacts share|update|list|delete`). 게시 기능은 `Settings → Artifacts`(설정 → 아티팩트)에서 **명시적으로 활성화**해야 합니다. 명령 세부 정보는 [`CLI reference → Artifacts`(CLI 참조 → 아티팩트)](/orca-docs-ko/docs/cli/reference/#artifacts)를 참조합니다.

## 브라우저 자동화

CLI는 또한 스냅샷-상호작용-재스냅샷 루프를 사용하여 내장 브라우저를 구동합니다.

```
orca goto --url https://example.com --json
orca snapshot --json     # returns refs like @e1, @e3
orca click --element @e3 --json
orca fill --element @e1 --value "[email protected]" --json
orca screenshot --json
```

반응형 브라우저 검사를 위해 활성 탭을 명명된 장치 프로필로 전환합니다.

````
orca set device --name "iPhone 12" --json
orca screenshot --json
````

## 모바일 에뮬레이터

CLI는 Orca의 모바일 에뮬레이터 브리지를 통해 iOS 시뮬레이터를 구동할 수도 있습니다. 범위는 활성 작업 트리로 지정되므로 에이전트와 스크립트는 `orca emulator list`에서 시뮬레이터를 연결하고, 정규화된 좌표를 탭하고, 텍스트를 입력하고, 제스처를 보내고, 장치를 회전하고, Orca을 떠나지 않고도 종료할 수 있습니다.

````
orca emulator list --json
orca emulator attach "<device-name-or-udid>" --json
orca emulator tap 0.5 0.7 --json
orca emulator type "hello" --json
orca emulator gesture '[{"type":"begin","x":0.5,"y":0.8},{"type":"move","x":0.5,"y":0.4},{"type":"end","x":0.5,"y":0.2}]' --json
orca emulator rotate landscape_left --json
orca emulator kill --json
````

스크립트에 명시적 대상이 필요한 경우 `--worktree <selector>`, `--device <udid-or-name>` 또는 `--emulator <id>`을 사용하세요.

탭, 대기, 쿠키 및 프레임을 포함한 전체 명령 화면은 [Orca CLI 참조](/orca-docs-ko/docs/cli/reference/)를 참조한 다음 Orca CLI 기술([기술 레지스트리](/orca-docs-ko/docs/cli/skills/) 참조)을 설치하고 에이전트가 이를 가리키도록 하십시오.
