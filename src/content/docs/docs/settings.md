---
title: "설정 참고"
sourceUrl: https://www.onorca.dev/docs/settings
checkedAt: "2026-08-04T03:02:33.909Z"
editUrl: false
prev: /orca-docs-ko/docs/recipes/remote-worktrees/
next: /orca-docs-ko/docs/telemetry/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

설정은 창으로 그룹화됩니다. 여기에 있는 모든 내용은 `Cmd-,`로 검색한 다음 키워드를 입력할 수 있습니다. 이 문서의 기능 페이지는 관련 창으로 직접 연결됩니다.

## 일반

-   **`Orca CLI`** — 셸과 에이전트에서 사용할 번들 명령줄 도구를 등록합니다.
-   **`Updates`(업데이트)** — 업데이트를 확인하고 설치합니다. **`Check for Updates`(업데이트 확인)**를 보조 키와 함께 클릭하면 다음과 같이 동작합니다.

| 보조 키 | 효과 |
| --- | --- |
| **Shift+클릭** | 최신 **RC** 시험판을 포함합니다. |
| **Cmd+클릭**(macOS) / **Ctrl+클릭**(Windows/Linux) | 최신 **perf**\-tagged 시험판을 포함합니다. |
| **Option+클릭**(macOS만 해당) | 호환성 검사를 통과한 **검증된 로컬 macOS 빌드**를 선택합니다. 실패하면 `Could Not Use Local Build`(로컬 빌드를 사용할 수 없음)와 **`Choose Another Build`(다른 빌드 선택)**가 표시됩니다. |

-   **`Open in menu`(다음에서 열기 메뉴)** — 작업 트리의 **`Open in`(다음에서 열기)** 메뉴에 표시할 앱을 선택합니다. VS Code/Insiders는 SSH 작업 트리에서 **Remote SSH** 열기를 지원하며, 다른 편집기는 로컬 경로만 지원합니다.
-   **`UI zoom`(UI 확대/축소)** — 설치별 UI 배율입니다.
-   **`Default new-worktree name`(새 작업 트리 기본 이름)** — 사용자 지정 접두사 또는 해양 생물 이름을 사용합니다.
-   **`Editor Word Wrap`(편집기 자동 줄 바꿈)** — 파일 편집기의 기본 줄 바꿈이며 기본적으로 켜져 있습니다. 파일 탭의 **⋯** 메뉴 또는 `Alt+Z`로 전환합니다. **`Diff Word Wrap`(diff 자동 줄 바꿈)**과는 별개입니다.

## 외관

-   테마, 강조색, 밀도를 설정합니다.
-   UI 글꼴 패밀리를 설정합니다. 편집기 글꼴은 선택 사항이며, 비워 두면 터미널 글꼴을 따르고 값을 설정하면 파일 편집기와 diff만 재정의합니다.
-   편집기 미니맵을 전환합니다.
-   **`Resource Manager`(리소스 관리자)**(CPU/memory/sessions, 데몬 컨트롤, 작업 공간 디스크 스캔)를 포함한 상태 표시줄 항목을 전환합니다.
-   **`Usage percentages`(사용량 백분율)** — 상태 표시줄 목록에서 공급자 한도를 **`% used`(사용한 비율)** 또는 **`% remaining`(남은 비율)**으로 표시합니다.
-   `App Icon`(앱 아이콘) — Dock 및 창 전환기에 표시되는 아이콘을 Classic, Watercolor, Blue 순으로 전환합니다.
-   **`Language`(언어)** — 기본 인터페이스 설정입니다. `System`(시스템, OS 설정을 따름), English, 中文（简体）, 한국어, 日本語 또는 Español 중에서 선택합니다. 설정 검색은 “language”에 해당하는 각 언어의 단어(语言 / 語言 / 언어 / 言語 / Idioma)도 인식하므로 UI가 아직 영어여도 `Language`(언어)를 찾을 수 있습니다.

## 힘내

- 기본 베이스 ref 확인 방식입니다.
- 커밋 서명 옵션입니다.
- 외부 git 도구용 편집기입니다.
- `Auto-Rename Branch From Work`(작업에 따라 브랜치 자동 이름 변경) — 에이전트가 작업을 시작한 뒤 Orca이 생성한 동물 이름 브랜치의 이름을 변경합니다.
- **`GitHub API Budget`(GitHub API 예산)** — 로컬 `gh` CLI에서 확인한 REST(core), Search, GraphQL의 남은 할당량입니다. PR 검사나 Tasks 갱신이 중단됐을 때 유용합니다. 수치는 정상인데 GitHub이 실시간 호출을 계속 제한한다면 [GitHub 오류 문제 해결](/orca-docs-ko/docs/github-errors/)을 참조합니다.

## 터미널

-   글꼴, 테마, 커서 스타일, 여백을 설정합니다.
-   Ghostty 설정을 가져옵니다.
-   Warp 테마 가져오기 — **`Import themes from Warp`(Warp에서 테마 가져오기)**를 사용하여 Warp YAML 테마를 가져오거나(OS별 Warp 테마 폴더를 자동 검색), Warp 형식 테마 파일이 있는 임의의 폴더에는 **`Import from YAML`(YAML에서 가져오기)**을 사용합니다.
-   macOS 일본어 키보드에서 JIS 엔 기호(¥)를 백슬래시(\)로 변환합니다.
-   Windows 기본 셸(PowerShell 또는 CMD)을 설정합니다.
-   **`Allow TUI Clipboard Writes (OSC 52)`(TUI 클립보드 쓰기 허용)** — **기본적으로 켜져 있습니다**. Zellij, tmux, Neovim, fzf, Grok 및 유사 도구가 SSH 연결을 포함하여 PTY를 통해 시스템 클립보드에 쓸 수 있게 합니다. 이전의 제한된 동작을 선호하면 끕니다.

## 빠른 명령

-   전역 또는 프로젝트 범위로 저장된 터미널 명령과 에이전트 프롬프트 사전 설정입니다.
-   명령 목록을 검토하고 편집하기 위한 범위 필터입니다. 동일한 목록이 [모바일 컴패니언](/orca-docs-ko/docs/mobile/)과 동기화됩니다.

## 에이전트

-   설치된 에이전트(감지된 에이전트와 사용자 지정 에이전트)를 표시합니다.
-   감지된 에이전트를 활성화하거나 비활성화하여 실행 메뉴에 사용할 CLI만 표시합니다.
-   `Agent Permissions`(에이전트 권한)에서 CLI 권한 프롬프트를 줄이려면 **`Yolo`(자동 승인)**를 선택하고, 사용자 지정하지 않은 에이전트가 자체 승인 흐름을 유지하도록 하려면 **`Manual`(수동)**을 선택합니다.
-   Claude 및 Codex 계정 목록을 표시합니다.
-   에이전트별 시작 훅을 설정합니다.
-   **`Skill freshness`(스킬 최신 상태)** — `Agents`(에이전트) 창과 스킬 카드는 전체 상태를 계속 표시합니다. 사이드바 탐색에는 조치가 필요한 스킬만 배지가 표시됩니다(**`Update available`(업데이트 사용 가능)**, **`Needs attention`(확인 필요)**/검토). 정상, 로딩 중 및 설치되지 않은 선택 항목에는 배지가 표시되지 않습니다. 대화 상자의 **`Update`(업데이트)**를 사용하면 터미널 없이 전역 스킬을 백그라운드에서 새로 고칩니다. 진행 상태는 상태 표시줄에 나타나며 대화 상자를 닫아도 실행은 취소되지 않습니다. [Orca 스킬](/orca-docs-ko/docs/cli/skills/#keep-skills-up-to-date)을 참조합니다.

## 브라우저

-   프로필([브라우저 사용 프로필](/orca-docs-ko/docs/browser/profiles/) 참조)을 설정합니다.
-   `Default Zoom`(기본 확대/축소) — 새로 연 브라우저 탭에 적용할 확대/축소 수준입니다. `Cmd-wheel`(Cmd+휠)로 탭별로 조정한 값은 별도로 기억됩니다.
-   `Design Mode`(디자인 모드) 기본값을 설정합니다.
-   `Devtools`(개발자 도구) 사용 여부를 설정합니다.
-   **`Link Routing`(링크 라우팅)** — 터미널, 마크다운 및 편집기의 http(s) 링크를 Orca 브라우저 또는 시스템 브라우저에서 엽니다. 중첩된 **`Hold Shift…`(Shift 키 누르기…)** 옵션은 한 번의 클릭에 대해 이 기본 동작을 반대로 전환합니다(`⇧⌘-click` / `Shift+Ctrl+click`). [작업 트리별 브라우저](/orca-docs-ko/docs/browser/overview/#link-routing)를 참조합니다.

## 통합

-   GitHub OAuth
-   Linear API 토큰
-   Jira — Cloud(이메일 + API 토큰) 또는 자체 호스팅 Server/Data Center(PAT 또는 username/password)를 연결합니다. [Jira 항목 서랍](/orca-docs-ko/docs/review/jira/)을 참조합니다.
-   MiniMax — MiniMax CLI의 로컬 사용량 및 사용 한도 추적을 활성화하려면 `platform.minimax.io/console/usage`에서 가져온 MiniMax 세션 쿠키를 붙여 넣습니다. 선택적인 그룹 ID 및 사용 모델 필드는 쿠키에서 선택한 기본값을 재정의합니다.
-   MCP 서버

## 알림

- 에이전트 완료: 시스템, 사운드, 칩.
- 카테고리별로 사용자 정의 데스크탑 알림 소리.
- PR 확인 실패.
- 업데이트가 가능합니다.

## 음성

-   **`Enable Voice Dictation`(음성 받아쓰기 활성화)** — 마이크 권한이 필요하며 macOS에서는 `Privacy & Security`(개인정보 보호 및 보안)가 열릴 수 있습니다.
-   **`Dictation mode`(받아쓰기 모드)** — **`Toggle`(전환)**(바로 가기를 눌러 start/stop) 또는 **`Hold`(누르고 있기)**(말하는 동안 바로 가기를 누름)을 선택합니다.
-   **`Speech Model`(음성 모델)** — 온디바이스 모델을 download/select하거나 API 키를 붙여 넣은 후 클라우드 OpenAI 모델을 사용합니다.
    -   **Parakeet TDT v3**(권장) — 유럽의 여러 언어를 지원하며 오프라인으로 작동합니다.
    -   **Parakeet TDT v2** — 영어를 지원하며 더 빠릅니다.
    -   **Zipformer** 제품군 — 중국어+영어 이중 언어 스트리밍, 스트리밍 EN/ZH, 한국어용 **Zipformer Streaming KO**
    -   **Paraformer Bilingual** — 중국어 방언 + 영어
    -   **Parakeet TDT-CTC JA** — 일본어
    -   **SenseVoice** — 언어 자동 감지와 함께 중국어/영어/일본어/한국어/광둥어 지원
    -   **Whisper Tiny** — 90개 이상의 언어를 지원하지만 정확도가 더 낮습니다.
    -   **GPT-4o mini / GPT-4o Transcribe** — 클라우드 모델이며 같은 창에 OpenAI 키가 필요합니다.
-   듣는 동안 **`Listening…`(듣는 중)** 필에 **`Stop`(중지)** 컨트롤이 표시됩니다. 전환 모드에서는 도구 설명에 받아쓰기 바로 가기도 표시됩니다.

## SSH

-   SSH 작업 트리, 대상, 암호 및 기본 ID 파일을 설정합니다.
-   고급: 프록시/점프 호스트 및 **`Reuse SSH connection for faster setup`(빠른 설정을 위해 SSH 연결 재사용)**을 설정합니다. 시스템 OpenSSH 다중화를 사용하며 기본적으로 켜져 있습니다.
-   Kerberos 호스트: OpenSSH 구성의 `GSSAPIAuthentication`가 시스템 OpenSSH 인증을 제어합니다([SSH 작업 트리](/orca-docs-ko/docs/ssh/) 참조).

## 원격 Orca 서버

- 원격 Orca 런타임에 페어링하고 연결합니다.
- 이 데스크톱 앱을 서버로 광고하고 취소 가능한 액세스 링크를 생성하세요.
- 서버 라우팅 프로젝트, 터미널 및 공급자 확인을 위한 고급 기본 런타임 선택.

## 단축키

-   모든 키 바인딩을 다시 매핑할 수 있는 전체 키맵입니다.
-   `Toggle Sleeping Workspaces`(절전 작업 공간 전환)는 기본적으로 키가 할당되지 않습니다. 사이드바의 절전 작업 트리 필터를 직접 전환하려면 여기서 할당합니다.
-   모든 편집기 탭 닫기의 기본값은 macOS에서 `Cmd+Option+W`, Windows/Linux에서 `Ctrl+Alt+W`입니다.
-   **탭 탐색 기본값(새 설치):** 모든 유형을 가로지르는 next/previous 탭은 `Cmd+Shift+]` / `Cmd+Shift+[`(Linux/Windows에서는 Ctrl)입니다. 동일 유형의 next/previous은 `Cmd+Option+]` / `Cmd+Option+[`입니다. 최근 사용한 이전 탭은 `Ctrl+Tab`입니다. 기존 설치는 사용자 지정 재정의를 `~/.orca/keybindings.json`에 유지합니다.
-   **`Add Review Note`(검토 메모 추가)**의 기본값은 `Cmd+Shift+A`(macOS) / `Ctrl+Shift+A`(Windows/Linux)이며 다시 매핑할 수 있습니다.
-   **`Send Review Notes to Agent`(에이전트에 검토 메모 보내기)**는 기본적으로 키가 할당되지 않습니다. 마우스를 사용하지 않고 활성 작업 트리의 diff 메모 보내기 메뉴를 열려면 여기서 할당합니다.

## 저장소

-   저장소별 기준 참조와 후크를 설정합니다.
-   작업 트리를 만들 때 명령을 자동 실행합니다.
-   사이드바의 저장소 아이콘으로 아이콘, 이모지, 업로드 이미지, 웹사이트 파비콘 또는 GitHub 아바타를 선택한 다음 사전 설정 또는 사용자 지정 16진수 배지 색상을 선택합니다.
-   커밋 메시지, 풀 리퀘스트 세부 정보 및 브랜치 이름의 소스 제어 AI 재정의를 설정합니다.
-   **`Worktree Shared Paths`(작업 트리 공유 경로)** — 기본 체크아웃의 Git에서 무시하는 경로를 각 새 작업 트리에 생성합니다. 가능한 경우 macOS에서는 APFS 복제 복사를 사용하고, 그 외에는 심볼릭 링크를 사용합니다. `orca.yaml`의 저장소 커밋 `worktree.sharedDirectories` 및 `.worktreeinclude`를 보완합니다([작업 트리](/orca-docs-ko/docs/model/worktrees/) 참조).

## 플로팅 작업 공간

-   **`Enable Floating Workspace`(플로팅 작업 공간 활성화)** — 저장소 작업 트리에 연결되지 **않은** 터미널, 브라우저 및 Markdown 탭을 위한 전역 화면입니다.
-   **`Terminal Directory`(터미널 디렉터리)** — 새 플로팅 터미널 탭의 시작 디렉터리입니다(`~` = 홈).
-   **`Toggle Button Location`(전환 버튼 위치)** — 플로팅 작업 공간 전환 버튼이 표시될 위치입니다. 버튼 위치와 관계없이 키보드 바로 가기는 작동합니다.

## 플러그인(실험적 기능)

-   **`Plugin system`(플러그인 시스템)** — `Settings`(설정) → `Plugins`(플러그인)에서 시스템을 켠 다음 각 플러그인을 개별적으로 검토하고 활성화합니다. 동의하기 전에는 아무것도 실행되지 않습니다.
-   **`Marketplaces`(마켓플레이스)** — Git 마켓플레이스 소스를 추가하고, 플러그인을 탐색하고, 기능(패널, 명령, 언어 팩, VM 레시피)을 미리 보고, 설치·업데이트·롤백합니다.
-   플러그인 워커는 항상 이 컴퓨터에서 실행되며, SSH 작업 공간 작업은 계속 Orca을 통해 라우팅됩니다.
-   기능과 API 형식은 변경될 수 있으므로 타사 플러그인은 신뢰할 수 없는 소프트웨어로 취급합니다.

## 실험적

-   [Activity Page](/orca-docs-ko/docs/activity/) — 에이전트 이벤트를 보여 주는 Slack 스타일 작업 트리 피드입니다.
-   `Compact worktree cards`(간결한 작업 트리 카드) — 레이아웃이 실험 단계인 동안 사이드바의 중복된 두 번째 줄을 숨깁니다.
-   [에이전트 최대 절전 모드](/orca-docs-ko/docs/agents/hibernation/) — 유휴 백그라운드 에이전트를 일시 중지하고 다시 열 때 자동으로 재개합니다.
-   **`Agent Dashboard`(에이전트 대시보드)** — `Needs You`(확인 필요), `Working`(작업 중), `Done`(완료) 에이전트와 선택적 `Idle`(유휴) 에이전트를 보여 주는 칸반입니다. 검색과 project/workspace/PR 필터를 제공하며 창 내부 또는 팝아웃으로 열 수 있습니다. [에이전트 및 세션](/orca-docs-ko/docs/model/agents-sessions/#agent-dashboard)을 참조합니다.
-   **`Chat UI`(채팅 UI)** — 지원되는 에이전트 터미널에서 선택적으로 사용하는 채팅 화면입니다. [채팅 UI](/orca-docs-ko/docs/agents/native-chat/)를 참조합니다.
-   **`Cloud VM`(클라우드 VM)** — 저장소에서 관리하는 주문형 환경(클라우드 샌드박스, VM 또는 로컬 Docker)의 설정 컨트롤과 작업 공간 **`Run on`(실행 위치)** 대상을 표시합니다. 설정 가이드와 레시피 설치는 이 실험 기능 토글 아래에 있습니다. [Orca 실행 방식](/orca-docs-ko/docs/ways-to-run/#4-cloud-vms-per-workspace-environments)을 참조합니다.
-   아직 안정화되지 않은 기능은 동작이 변경될 수 있습니다.
