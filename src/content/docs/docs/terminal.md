---
title: "터미널"
sourceUrl: https://www.onorca.dev/docs/terminal
checkedAt: "2026-08-11T01:01:52.326Z"
editUrl: false
prev: /orca-docs-ko/docs/browser/profiles/
next: /orca-docs-ko/docs/ways-to-run/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca의 터미널은 VS Code가 사용하는 것과 동일한 xterm.js 기반 터미널이며 AI 에이전트 워크플로에 맞게 조정된 몇 가지 추가 기능이 있습니다.

![Ghostty 스타일 터미널 - 처음 시작할 때 Ghostty 테마, 글꼴 및 커서 가져오기](/orca-docs-ko/assets/mirror/7f03154e7dfe456b1fdf4029449bf09f12171fcf1c637818f0071e8e0369e06d.jpg)

Ghostty 스타일 터미널 — 처음 시작할 때 Ghostty 테마, 글꼴 및 커서를 가져옵니다.

## 창 및 탭

터미널은 단순한 탭입니다. [탭, 창 및 분할 레이아웃](/orca-docs-ko/docs/model/tabs-panes-splits/)을 참조하세요. 터미널 창을 분할하면 두 개의 셸이 나란히 제공됩니다.

에이전트 터미널 탭에는 에이전트 ID와 실시간 상태(작업 중, 입력 대기 중, 완료 또는 완료 후 미확인)가 함께 표시됩니다. Claude 및 Codex의 경우 Orca가 해당 창을 세션에 연결할 수 있으면 탭 제목에 **`AI Vault conversation name`(AI Vault 대화 이름)**(사용자 지정 제목/스레드 이름)도 표시할 수 있습니다. 수동으로 바꾼 이름이 항상 우선합니다.

## TUI 클립보드(OSC 52)

많은 터미널 UI(Zellij, tmux, Neovim, fzf, Grok)는 OS 클립보드 API 대신 **OSC 52**를 통해 복사합니다. Orca는 이러한 쓰기를 **기본적으로** 허용하므로 copy-from-remote/TUI가 SSH에서도 로컬과 동일하게 동작합니다.

전환 위치: [`Settings`(설정) → `Terminal`(터미널) → `Allow TUI Clipboard Writes (OSC 52)`(TUI 클립보드 쓰기 허용)](/orca-docs-ko/docs/settings/)

## 검색

`Cmd-F`은 스크롤백에서 찾기를 엽니다. 일치 강조 표시, 대소문자, 정규식 및 일치 탐색이 모두 지원됩니다.

## 터미널 컨텍스트 복사

터미널을 마우스 오른쪽 버튼으로 클릭하고 `Copy Context`(컨텍스트 복사)를 선택하여 해당 창에서 제한된 기록을 복사합니다. Orca 포크를 시작하지 않고 최근 에이전트 출력을 다른 도구에 붙여넣고 싶을 때 사용합니다.

## 테마

터미널 색상 테마는 [설정 → 터미널](/orca-docs-ko/docs/settings/)에서 구성할 수 있습니다. Orca는 인기 있는 테마 라이브러리를 제공하며 이를 사용자 정의할 수 있습니다.

## 유령 가져오기

Ghostty를 사용하는 경우 Orca은 처음 시작할 때 테마, 글꼴 및 커서 구성을 가져올 수 있습니다. 나중에 [설정 → 터미널 → Ghostty에서 가져오기](/orca-docs-ko/docs/settings/)에서 가져오기를 다시 실행할 수 있습니다.

## 워프 테마 가져오기

Warp에서 테마를 수집한 경우 [설정 → 터미널](/orca-docs-ko/docs/settings/) 아래 터미널 테마 선택기에서 `Import themes from Warp`(Warp에서 테마 가져오기)를 클릭하여 Orca 터미널 테마로 가져옵니다. Orca은 현재 OS(macOS의 경우 `~/.warp/themes`, Linux의 경우 `$XDG_DATA_HOME/warp-terminal/themes`, Windows의 경우 `%APPDATA%\warp\Warp\data\themes`)에 대한 Warp의 테마 디렉터리를 검색하고 가져올 YAML 테마를 선택할 수 있도록 합니다. 옆에 있는 `Import from YAML`(YAML에서 가져오기) 버튼은 동일한 선택기를 사용하여 Warp 형식 `.yaml`/`.yml` 파일의 모든 폴더를 가리킵니다. 이는 테마를 기본 위치 외부에 저장할 때 유용합니다.

가져온 테마는 테마 드롭다운에서 Orca의 내장 기능과 함께 표시됩니다.

## 윈도우 셸

Windows의 기본 셸은 [설정 → 터미널](/orca-docs-ko/docs/settings/)에서 PowerShell, 명령 프롬프트, WSL 간에 구성할 수 있습니다. `wsl.exe --status`가 성공하면 WSL이 자동으로 제공됩니다. 탭 표시줄의 **++** 드롭다운에는 하위 메뉴도 표시되므로 기본값을 변경하지 않고도 모든 셸에서 일회용 탭을 열 수 있습니다.

WSL 파일 시스템(`\\wsl.localhost\...`)에 있는 저장소의 경우 Orca는 `wsl.exe -d <distro>`을 통해 시작됩니다. WSL에서 열린 Windows 경로 저장소의 경우 Orca는 cwd를 `/mnt/<drive>/...`로 변환하고 로그인 bash로 이동합니다.

## 단축키

- `Cmd-T` — 현재 작업 트리의 새 터미널 탭입니다.
- `Cmd-Alt-T`(macOS) — 기본 에이전트를 사용하는 새 에이전트 탭입니다. Linux 및 Windows에서는 이 코드가 바인딩되지 않은 상태로 제공됩니다. [설정 → 바로가기](/orca-docs-ko/docs/settings/)에서 하나를 할당하세요("새 에이전트 탭" 검색). 지원되는 각 에이전트에는 고유한 에이전트별 "새 에이전트 탭" 작업도 있습니다. 코드를 바인딩하면 기본값을 거치지 않고 특정 CLI를 직접 시작할 수 있습니다.
- `Cmd-W` — 현재 탭을 닫습니다.
- `Cmd-\` — 오른쪽으로 분할.
- `Cmd-Shift-\` — 분할됩니다.

## 기본 키 바인딩

Orca은 키티 키보드 프로토콜을 광고하므로 터미널 앱은 실제 `Shift+Enter`, `Ctrl+Enter` 및 기타 수정자 인식 키 입력을 볼 수 있습니다. 바인딩은 Ghostty, WezTerm 또는 기본 터미널에서와 마찬가지로 Orca에서도 동일하게 작동합니다.

![키티 키보드 프로토콜을 통한 기본 키 바인딩 — Shift+Enter 및 친구들은 독립형 터미널에서와 똑같이 에이전트 CLI에 도달합니다.](/orca-docs-ko/assets/mirror/5b4b383b58509c12e086db79890586733e77617f33b383789b7a679a1626c99a.jpg)

키티 키보드 프로토콜을 통한 기본 키 바인딩 - Shift+Enter 및 친구들은 독립형 터미널에서와 똑같이 에이전트 CLI에 도달합니다.

macOS의 일본어 JIS 키보드에서 물리적 엔 키가 터미널 세션에 백슬래시를 보내도록 하려면 `Settings → Terminal → JIS Yen (¥) to Backslash (\\)`(설정 → 터미널 → JIS 엔(¥)을 백슬래시(\\)로 변환)를 활성화합니다. macOS 한국어 키보드에서는 한국어 입력 소스가 활성화된 동안 물리적 원 키가 백틱을 보내도록 `Settings → Terminal → Korean Won (₩) to Backquote`(설정 → 터미널 → 한국 원(₩)을 백쿼트로 변환)를 활성화합니다. Markdown 코드 펜스와 셸 인용을 입력할 때 키보드 레이아웃을 전환하지 않아도 됩니다.

## 플로팅 터미널

부동 터미널은 현재 작업 트리나 탭에 관계없이 항상 한 코드 떨어져 있는 전역 쉘 표면입니다. 새로 설치하는 경우 기본적으로 켜져 있습니다.

- `Cmd+Option+A`(macOS) / `Ctrl+Alt+A`(Linux/Windows)로 전환합니다. 동일한 코드는 이미 열려 있는 경우 패널에 초점을 맞추고 이미 초점이 맞춰진 경우 패널을 닫습니다.
- 창 가장자리에 있는 플로팅 버튼을 클릭하거나, [설정 → 터미널 → 플로팅 터미널](/orca-docs-ko/docs/settings/) 아래 상태 표시줄로 트리거를 이동하세요.
- 시작 작업 디렉터리를 동일한 설정(기본적으로 `~`)으로 설정하면 새 부동 탭이 예상하는 위치에 놓이게 됩니다.
- 부동 패널은 자체 탭을 호스팅하고 오케스트레이션 설정을 지원합니다. 작업 트리 창을 요청하지 않고 백그라운드 실행을 시작합니다.

## 빠른 명령

빠른 명령은 `npm run dev`, `pnpm test` 또는 프로젝트별 설정 스크립트와 같이 자주 실행하는 터미널 명령을 저장합니다. 또한 Claude 및 Codex와 같은 시작 시간 프롬프트 에이전트에 대해 재사용 가능한 에이전트 프롬프트를 저장할 수도 있습니다. `Settings → Quick Commands`(설정 → 빠른 명령) 또는 탭 표시줄의 `Add command`(명령 추가) 버튼에서 생성한 다음 작업 트리 탭 표시줄의 빠른 명령 분할 버튼 또는 터미널 컨텍스트 메뉴에서 실행합니다.

각 명령에는 레이블, 명령 텍스트 및 범위가 있습니다. 모든 곳에 적용되는 명령의 경우 `Global`(전역)을 사용하고, 특정 저장소의 작업 트리에만 명령을 표시하려면 `Project`(프로젝트)를 사용하세요. 탭 표시줄 버튼은 새로운 터미널 탭을 열고 명령을 실행합니다. 터미널 상황에 맞는 메뉴는 현재 터미널에 명령을 삽입할 수 있습니다.

페어링된 [Remote Orca Server(원격 서버)](/orca-docs-ko/docs/remote-servers/) 또는 다른 실행 호스트를 사용할 때 선택기는 **로컬 및 원격** 컬렉션을 나란히 표시하고 호스트별 레이블을 붙일 수 있습니다. 예를 들어 *`Local Mac`(로컬 Mac)* 및 *Orca `Server`(서버)*로 표시됩니다. **`Saved on`(저장 위치)**은 명령이 저장된 위치이며, 명령을 실행하면 호출한 터미널 또는 작업 공간에서 계속 실행됩니다. 따라서 클라이언트 소유 명령도 원격 작업 트리 안에서 실행할 수 있습니다. 다중 호스트 `Quick Commands`(빠른 명령)를 알리지 않는 이전 서버에서는 로컬 전용 목록으로 대체됩니다.
