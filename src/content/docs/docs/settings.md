---
title: "설정 참고"
sourceUrl: https://www.onorca.dev/docs/settings
checkedAt: "2026-10-06T01:03:33.118Z"
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

-   **`Open in menu`(다음에서 열기 메뉴)** — 작업 트리의 **`Open in`(다음에서 열기)** 메뉴에 표시할 앱을 선택합니다. VS Code / Insiders에서는 SSH 작업 트리에 대해 **`Remote SSH`(원격 SSH)** 열기를 사용할 수 있으며, 다른 편집기는 로컬 경로만 지원합니다.
-   **`UI zoom`(UI 확대/축소)** — 설치별 UI 배율입니다.
-   **`Default new-worktree name`(새 작업 트리 기본 이름)** — 사용자 지정 접두사 또는 해양 생물을 선택합니다.
-   **`Editor Word Wrap`(편집기 자동 줄 바꿈)** — 파일 편집기의 기본 줄 바꿈 설정이며 기본적으로 켜져 있습니다. 파일 탭의 **⋯** 메뉴 또는 `Alt+Z`에서 전환합니다. **`Diff Word Wrap`(diff 자동 줄 바꿈)**과는 별개입니다.
-   **`Reuse a preview tab when browsing files`(파일 탐색 시 미리 보기 탭 재사용)** — 기본적으로 켜져 있습니다. 현재 미리 보기 탭을 교체하지 않고 한 번 클릭한 파일을 각각 별도 탭에서 열려면 끕니다.
-   **`Collapse Unchanged Regions`(변경되지 않은 영역 접기)** — 단일 파일 diff에서 주변 컨텍스트를 약간 표시한 채 변경되지 않은 긴 구간을 접습니다. 전체 파일이 필요하면 구간을 펼칩니다. **`View all changes`(모든 변경 사항 보기)**는 자체적으로 접힌 레이아웃을 유지합니다.

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
-   Ghostty 가져오기를 지원합니다.
-   Warp 테마 가져오기 — **`Import themes from Warp`(Warp에서 테마 가져오기)**로 Warp YAML 테마를 가져오거나(운영 체제별 Warp 테마 폴더를 자동으로 찾음), **`Import from YAML`(YAML에서 가져오기)**로 Warp 형식 테마 파일이 있는 임의 폴더에서 가져옵니다.
-   macOS 일본어 키보드에서 JIS Yen(¥)을 Backslash(\)로 변환합니다.
-   새 로컬 터미널 탭의 **`Default shell`(기본 셸)**을 설정합니다. 시스템 기본값을 사용하려면 비워 둡니다. Windows에서는 사용 가능한 경우 PowerShell, Command Prompt 및 WSL도 제공합니다.
-   사용자 지정 Unix 기본 셸의 **`Shell arguments`(셸 인수)**를 **`Default shell → Advanced`(기본 셸 → 고급)** 아래에서 설정합니다. 로그인 셸에는 **`-l (default)`(-l, 기본값)**를 선택하거나, **`Custom args`(사용자 지정 인수)**를 선택하고 줄마다 인수 하나를 입력합니다. 사용자 지정 목록이 비어 있으면 인수를 전달하지 않습니다.
-   **`Allow TUI Clipboard Writes (OSC 52)`(TUI 클립보드 쓰기 허용(OSC 52))** — **기본적으로 켜져 있습니다**. Zellij, tmux, Neovim, fzf, Grok 등이 SSH 연결을 포함해 PTY를 통해 시스템 클립보드에 쓸 수 있게 합니다. 이전의 제한된 동작을 선호하면 끕니다.

## 빠른 명령

-   전역 또는 프로젝트 범위로 저장된 터미널 명령과 에이전트 프롬프트 사전 설정입니다. 각 행에는 명령 본문용 복사 컨트롤이 있습니다.
-   명령 목록을 검토하고 편집하기 위한 범위 필터입니다. 동일한 목록이 [모바일 컴패니언](/orca-docs-ko/docs/mobile/)과 동기화됩니다.
-   원격 또는 다중 호스트 환경에서는 명령을 소유한 Orca 호스트별로 그룹화하고 **`Saved on`(저장 위치)**을 표시합니다. 호스트 소유권은 Global/Project 범위 및 명령 실행 위치와 별개입니다. [Terminal → Quick Commands(터미널 → 빠른 명령)](/orca-docs-ko/docs/terminal/#quick-commands)를 참조합니다.

## 에이전트

-   `Installed agents`(설치된 에이전트) — 활성화하거나 비활성화할 수 있는 감지된 CLI입니다.
-   감지된 에이전트를 활성화하거나 비활성화하여 시작 메뉴에 사용하려는 CLI만 표시합니다.
-   `Agent Permissions`(에이전트 권한) — 사용자 지정하지 않은 에이전트에 대해 CLI 권한 확인을 줄이려면 **`Yolo`**, 각 에이전트의 자체 승인 흐름을 유지하려면 **`Manual`(수동)**을 선택합니다.
-   **`Trust the folder when Orca starts an agent`(Orca에서 에이전트를 시작할 때 폴더 신뢰)** — **기본적으로 켜져 있습니다**. 오케스트레이션 워커, 자동화 및 휴대전화에서 시작한 에이전트를 포함하여 Orca가 시작하는 에이전트는 "이 폴더를 신뢰하십니까?" 프롬프트를 건너뜁니다. 각 에이전트의 자체 신뢰 프롬프트를 유지하려면 끕니다. [Codex의 Orca 통합](/orca-docs-ko/docs/agents/codex/) 및 [지원되는 에이전트](/orca-docs-ko/docs/agents/supported/)를 참조합니다.
-   **`Run each Codex terminal on its own server`(각 Codex 터미널을 자체 서버에서 실행)** — **기본적으로 켜져 있습니다**. Orca의 상태와 탭 닫기 동작을 Codex 탭에서 정확하게 유지합니다. Codex의 공유 서버와 에이전트 개요를 사용하려면 끕니다. 새 터미널에 적용됩니다. 함께 제공되는 **`Warn when a Codex tab shares a server`(Codex 탭이 서버를 공유할 때 경고)** 알림은 직접 시작한 Codex가 서버를 공유할 때 표시됩니다. [Codex의 Orca 통합](/orca-docs-ko/docs/agents/codex/)을 참조합니다.
-   Claude 및 Codex 계정 목록을 관리합니다. Linux에서는 암호화할 수 없었던 저장된 자격 증명이 이곳에 경고와 함께 표시됩니다.
-   OpenCode Go 세션 쿠키 — Go 속도 제한을 표시하려면 전체 `opencode.ai` Cookie 헤더에 `__Host-console_session`를 포함해 붙여 넣습니다. `auth` 쿠키만으로는 충분하지 않습니다.
-   에이전트별 시작 후크를 설정합니다.
-   **`Agent status hooks`(에이전트 상태 후크)** — Orca에 작업 중 / 대기 중 / 완료 상태를 표시합니다. 앱을 재시작하지 않아도 토글이 적용되며 Windows WSL 후크 릴레이에도 적용됩니다. CLI: `orca agent hooks on|off|status`.
-   **`Keep computer awake`(컴퓨터 절전 방지)** — **`On`(켜기)**(항상 절전 방지), **`Agent`(에이전트)**(에이전트가 작업 중일 때 절전 방지) 또는 **`Off`(끄기)**를 선택합니다. 같은 컨트롤이 데스크톱 상태 표시줄에 **`Caffeinate`(절전 방지)**(커피 아이콘)로 표시됩니다. 페어링된 웹 클라이언트에서는 숨겨집니다.
-   **`Skill freshness`(스킬 최신 상태)** — 에이전트 창과 스킬 카드에는 계속 전체 상태가 표시됩니다. 사이드바 탐색에는 조치가 필요한 스킬(**`Update available`(업데이트 가능)**, **`Needs attention`(확인 필요)** / 검토)에만 배지가 표시되며, 정상, 로드 중, 선택적 미설치 행은 별도 표시를 하지 않습니다. 대화 상자에서 **`Update`(업데이트)**를 선택하면 터미널 없이 전역 스킬을 백그라운드에서 새로 고칩니다. 진행 상황은 상태 표시줄에 표시되며 대화 상자를 닫아도 실행이 취소되지 않습니다. [Orca 스킬](/orca-docs-ko/docs/cli/skills/#keep-skills-up-to-date)을 참조합니다.

## 브라우저

-   프로필([Browser-use profiles(브라우저 사용 프로필)](/orca-docs-ko/docs/browser/profiles/) 참조)을 설정합니다.
-   `Default Zoom`(기본 확대/축소) — 새로 연 브라우저 탭에 적용할 확대/축소 수준입니다. `Cmd-wheel`(Cmd+휠)로 탭별로 조정한 값은 별도로 기억됩니다.
-   `Design Mode`(디자인 모드) 기본값을 설정합니다.
-   `Devtools`(개발자 도구) 사용 여부를 설정합니다.
-   **`Remote server workspaces`(원격 서버 작업 공간)** — 새 페어링 런타임 브라우저 페이지를 이 데스크톱에서 렌더링하려면 **`This device`(이 기기)**를 선택하고, 서버에서 렌더링하려면 **`Server (streamed)`(서버(스트리밍))**를 선택합니다. 트래픽은 항상 원격 서버를 통과하며 선택 내용은 새 페이지에만 적용됩니다. [Per-worktree browser → Remote workspaces(작업 트리별 브라우저 → 원격 작업 공간)](/orca-docs-ko/docs/browser/overview/#remote-workspaces)를 참조합니다.
-   **`Browse through SSH workspace hosts`(SSH 작업 공간 호스트를 통해 탐색)** — 브라우저 트래픽과 DNS를 각 작업 공간의 SSH 호스트를 통해 전송합니다. 이 기기에서 탐색하려면 이 옵션을 끍니다.
-   **`Link Routing`(링크 라우팅)** — 터미널, 마크다운, 편집기의 http(s) 링크를 Orca의 브라우저 또는 시스템 브라우저에서 엽니다. 하위 **`Hold Shift…`(Shift 키 누르기…)**는 한 번의 클릭에 대해 이 기본 동작을 반대로 전환합니다(`⇧⌘-click` / `Shift+Ctrl+click`). [작업 트리별 브라우저](/orca-docs-ko/docs/browser/overview/#link-routing)를 참조합니다.
-   **`Terminal URL clicks`(터미널 URL 클릭)** — URL을 일반 클릭했을 때 작업 메뉴를 열지, 즉시 열지, 수정 키를 요구할지 선택합니다. 가운데 버튼으로 URL을 클릭했을 때의 동작은 별도로 설정합니다.
-   **`Show terminal link actions`(터미널 링크 작업 표시)** — **기본적으로 켜져 있습니다**. 터미널 링크를 일반 클릭하면 간결한 작업 팝오버가 열립니다. 이 옵션을 끄면 `⌘`\-click / `Ctrl`\-click이 필요합니다. [Terminal → Link actions(터미널 → 링크 작업)](/orca-docs-ko/docs/terminal/#link-actions)을 참조합니다.
-   **`Default Search Engine`(기본 검색 엔진)** — 브라우저 주소 표시줄이나 [새 탭 옴니박스](/orca-docs-ko/docs/model/quick-open/#new-tab-omnibox)에 URL이 아닌 텍스트를 입력할 때 사용합니다.

## 아티팩트

-   **`Orca account`(Orca 계정)** — 공유 파일을 게시하고 관리하려면 로그인합니다. Orca Relay와 같은 계정 계열을 사용합니다.
-   **`Allow publishing public artifact links`(공개 아티팩트 링크 게시 허용)** — **기본적으로 꺼져 있습니다**. 기기 전체에 적용되는 설정으로, 켜면 사용자, 에이전트 및 이 컴퓨터의 `orca` CLI가 최대 **10 MiB**의 HTML/Markdown을 업로드하고 공개 보기 링크를 만들 수 있습니다. 설정을 꺼도 기존 링크는 삭제되지 않습니다.
-   **`Show Artifacts`(아티팩트 표시)**/사이드바 바로 가기 — `Artifacts`(아티팩트) 목록을 열어 계정 소유 링크를 검색하고, 미리 보고, 복사하거나 삭제합니다.
-   **`Ask Before Deleting Artifacts`(아티팩트 삭제 전 확인)** — 공개 링크를 끊기 전에 선택적으로 확인합니다.
-   열린 로컬 HTML 페이지나 Markdown 편집기에서 **`Share as artifact`(아티팩트로 공유)**를 사용하거나 `orca artifacts …`을 통해 공유합니다. [`CLI reference → Artifacts`(CLI 참조 → 아티팩트)](/orca-docs-ko/docs/cli/reference/#artifacts)를 참조합니다.

## 통합

-   GitHub OAuth.
-   Linear API 토큰.
-   Jira — Cloud(이메일 + API 토큰) 또는 자체 호스팅 Server/Data Center(PAT 또는 username/password)를 연결합니다. [Jira 항목 서랍](/orca-docs-ko/docs/review/jira/)을 참조합니다.
-   Bitbucket Cloud — **`Connect`(연결)**에서 기본값인 **`Email & API token`(이메일 및 API 토큰)** 또는 **`Access token`(액세스 토큰)**을 사용합니다. Orca는 자격 증명을 저장하기 전에 검증합니다. `ORCA_BITBUCKET_*` 환경 변수가 우선하며 `Connect`(연결)/`Disconnect`(연결 해제)를 숨깁니다. 저장된 자격 증명은 이 컴퓨터에만 보관됩니다. [원격 Orca 서버](/orca-docs-ko/docs/remote-servers/)에서는 대신 서버에 환경 변수를 설정합니다. [호스팅 검토](/orca-docs-ko/docs/review/github/)를 참조합니다.
-   MiniMax — MiniMax 세션 쿠키(`platform.minimax.io/console/usage`에서 가져옴)를 붙여 넣어 MiniMax CLI의 로컬 사용량과 사용 한도 추적을 활성화합니다. 선택적인 그룹 ID와 사용 모델 필드는 쿠키에서 선택한 기본값을 재정의합니다.
-   MCP 서버.

## 알림

- 에이전트 완료: 시스템, 사운드, 칩.
- 카테고리별로 사용자 정의 데스크탑 알림 소리.
- PR 확인 실패.
- 업데이트가 가능합니다.

## 음성

-   **`Enable Voice Dictation`(음성 받아쓰기 활성화)** — 마이크 권한이 필요하며 macOS에서는 `Privacy & Security`(개인정보 보호 및 보안)가 열릴 수 있습니다.
-   **`Microphone`(마이크)** — 받아쓰기에 사용할 입력 장치를 선택합니다. 기본값은 시스템 마이크입니다. 운영체제 기본 장치를 사용하지 않으려면 헤드셋 같은 특정 장치를 선택합니다. 선택한 마이크의 연결이 끊겼거나 장치를 찾을 수 없으면 Orca은 시스템 기본값으로 대체하고 작업을 방해하지 않는 알림을 표시합니다.
-   **`Dictation mode`(받아쓰기 모드)** — **`Toggle`(전환)**(바로 가기를 눌러 start/stop) 또는 **`Hold`(누르고 있기)**(말하는 동안 바로 가기를 누름)을 선택합니다.
-   **`Speech Model`(음성 모델)** — 온디바이스 모델은 download/select 방식으로 사용하거나 API 키를 붙여 넣은 후 클라우드 OpenAI 모델을 사용합니다.
    -   **Parakeet TDT v3**(권장) — 유럽의 여러 언어를 지원하며 오프라인으로 작동합니다.
    -   **Parakeet TDT v2** — 영어를 지원하며 더 빠릅니다.
    -   **Zipformer** 제품군 — 중국어+영어 이중 언어 스트리밍, 스트리밍 EN/ZH, 한국어용 **Zipformer Streaming KO**
    -   **Paraformer Bilingual** — 중국어 방언 + 영어
    -   **Parakeet TDT-CTC JA** — 일본어
    -   **SenseVoice** — 언어 자동 감지와 함께 중국어/영어/일본어/한국어/광둥어 지원
    -   **Whisper Tiny** — 90개 이상의 언어를 지원하지만 정확도가 더 낮습니다.
    -   **GPT-4o mini / GPT-4o Transcribe** — 클라우드 모델이며 같은 창에 OpenAI 키가 필요합니다.
-   듣는 동안 **`Listening…`(듣는 중)** 알약 모양 배지에 **`Stop`(중지)** 컨트롤이 표시됩니다. 전환 모드에서는 도구 설명에 받아쓰기 바로 가기도 표시됩니다.

## SSH

-   SSH 작업 트리, 대상, 암호 및 기본 ID 파일을 설정합니다.
-   고급: 프록시/점프 호스트 및 **`Reuse SSH connection for faster setup`(빠른 설정을 위해 SSH 연결 재사용)**을 설정합니다. 시스템 OpenSSH 다중화를 사용하며 기본적으로 켜져 있습니다.
-   Kerberos 호스트: OpenSSH 구성의 `GSSAPIAuthentication`가 시스템 OpenSSH 인증을 제어합니다([SSH 작업 트리](/orca-docs-ko/docs/ssh/) 참조).

## 원격 Orca 서버

-   원격 Orca 런타임과 페어링하고 연결합니다.
-   이 데스크톱 앱을 서버로 알리고 취소 가능한 액세스 링크를 만듭니다.
-   페어링된 모바일 호스트에 사용할 이 데스크톱의 **`Machine name`(컴퓨터 이름)**을 설정합니다. 감지된 컴퓨터 이름을 사용하려면 비워 둡니다. [모바일 컴패니언](/orca-docs-ko/docs/mobile/#pairing)을 참조합니다.
-   서버를 통해 라우팅되는 프로젝트, 터미널 및 제공자 검사의 고급 기본 런타임 선택을 설정합니다.

## 단축키

-   `Full keymap`(전체 키맵) — 모든 키 바인딩을 다시 매핑할 수 있습니다.
-   `Toggle Sleeping Workspaces`(절전 작업 공간 전환)는 기본적으로 키가 할당되지 않습니다. 사이드바의 절전 작업 트리 필터를 직접 전환하려면 여기서 할당합니다.
-   **`Toggle Workspace Board`(작업 공간 보드 전환)**는 기본적으로 키가 할당되지 않습니다. 하나의 단축키로 `Workspace Board`(작업 공간 보드)를 열거나 닫으려면 여기서 할당합니다. 기존 `workspace.openBoard` 바인딩도 계속 작동합니다.
-   `Close all editor tabs`(모든 편집기 탭 닫기)의 기본값은 macOS에서 `Cmd+Option+W`, Windows/Linux에서 `Ctrl+Alt+W`입니다.
-   **`Tab navigation defaults (new installs)`(탭 탐색 기본값(새 설치)):** **모든 유형**을 가로지르는 next/previous 탭은 `Cmd+Shift+]` / `Cmd+Shift+[`(Linux/Windows에서는 Ctrl)입니다. 같은 유형 내 next/previous은 `Cmd+Option+]` / `Cmd+Option+[`입니다. 최근 사용한 이전 탭은 `Ctrl+Tab`입니다. 기존 설치는 사용자 지정 재정의를 `~/.orca/keybindings.json`에 유지합니다.
-   **`Add Review Note`(검토 메모 추가)**의 기본값은 `Cmd+Shift+A`(macOS) / `Ctrl+Shift+A`(Windows/Linux)이며 다시 매핑할 수 있습니다.
-   **`Send Review Notes to Agent`(에이전트에 검토 메모 보내기)**는 기본적으로 키가 할당되지 않습니다. 마우스를 사용하지 않고 활성 작업 트리의 diff 메모 보내기 메뉴를 열려면 여기서 할당합니다.
-   **`Delete workspace`(작업 공간 삭제)**의 기본값은 macOS에서 `Cmd+Shift+Backspace`, Windows/Linux에서 `Ctrl+Shift+Backspace`입니다. 삭제하려는 사이드바 작업 공간에 마우스를 올리면 Orca가 계속 확인을 요청합니다.

## 저장소

-   저장소별 기준 ref와 후크를 설정합니다.
-   작업 트리를 만들 때 명령을 자동 실행합니다.
-   사이드바의 저장소 아이콘으로 아이콘, 전체 검색이 가능한 이모지 선택기, 업로드 이미지, 웹사이트 파비콘 또는 GitHub 아바타를 선택한 다음 사전 설정 또는 사용자 지정 16진수 배지 색상을 선택합니다.
-   커밋 메시지, 풀 리퀘스트 세부 정보 및 브랜치 이름에 대한 `Source Control AI`(소스 제어 AI) 재정의를 설정합니다.
-   **`Worktree Shared Paths`(작업 트리 공유 경로)** — 기본 체크아웃에서 Git이 무시하는 경로를 각 새 작업 트리에 구체화합니다. 가능한 경우 macOS에서는 APFS 복제 복사를 사용하고, 그 외에는 심볼릭 링크를 사용합니다. 저장소에 커밋된 `worktree.sharedDirectories`(`orca.yaml`)와 `.worktreeinclude`를 보완합니다([작업 트리](/orca-docs-ko/docs/model/worktrees/) 참조).

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

-   [`Activity Page`(활동 페이지)](/orca-docs-ko/docs/activity/) — 에이전트 이벤트를 보여 주는 Slack 스타일 작업 트리 피드입니다.
-   `Compact worktree cards`(간결한 작업 트리 카드) — 레이아웃이 실험 단계인 동안 사이드바의 중복된 두 번째 줄을 숨깁니다.
-   [에이전트 최대 절전 모드](/orca-docs-ko/docs/agents/hibernation/) — 유휴 백그라운드 에이전트를 일시 중지하고 다시 열 때 자동으로 재개합니다.
-   **`Agent Dashboard`(에이전트 대시보드)** — `Needs You`(확인 필요), `Working`(작업 중), `Done`(완료) 에이전트와 선택적 `Idle`(유휴) 에이전트를 보여 주는 칸반 보드입니다. 검색과 `project/workspace/PR`(프로젝트/작업 공간/PR) 필터를 제공하며 창 내부 또는 팝아웃으로 열 수 있습니다. **`Show idle agents`(유휴 에이전트 표시)**는 이 설정이 아니라 대시보드 보드 설정 컨트롤에 있습니다. [에이전트 및 세션](/orca-docs-ko/docs/model/agents-sessions/#agent-dashboard)을 참조합니다.
-   **`Chat UI`(채팅 UI)** — 지원되는 에이전트 터미널에서 선택적으로 사용하는 채팅 화면입니다. [채팅 UI](/orca-docs-ko/docs/agents/native-chat/)를 참조합니다.
-   **`Cloud VM`(클라우드 VM)** — 저장소에서 관리하는 주문형 환경(클라우드 샌드박스, VM 또는 로컬 Docker)의 설정 컨트롤과 작업 공간 **`Run on`(실행 위치)** 대상을 표시합니다. 설정 가이드와 레시피 설치는 이 실험 기능 토글 아래에 있습니다. [Orca 실행 방식](/orca-docs-ko/docs/ways-to-run/#4-cloud-vms-per-workspace-environments)을 참조합니다.
-   아직 안정화되지 않은 기능은 동작이 변경될 수 있습니다.
