---
title: "에이전트 세션 기록"
sourceUrl: https://www.onorca.dev/docs/agents/session-history
checkedAt: "2026-08-14T01:08:16.788Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/native-chat/
next: /orca-docs-ko/docs/agents/hibernation/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Claude, Codex, Cursor, Gemini 및 Orca의 오른쪽 사이드바에서 기타 에이전트 세션을 찾아보고 재개하세요.

Orca은 지원 에이전트 CLI가 남긴 온디스크 세션 기록을 스캔하여 `Agent Session History`(에이전트 세션 기록)이라는 오른쪽 사이드바 패널에 나열합니다. 이전 세션을 선택하고 `Resume`(재개)를 클릭하면 Orca가 새 터미널에서 에이전트의 재개 명령을 실행합니다. 동일한 `cwd`, 동일한 세션 ID, 수동 `--resume` 플래그 랭글링이 없습니다.

## 패널을 엽니다

오른쪽 사이드바를 열고 `Agents`(에이전트) 탭으로 전환하세요. 패널 헤더에는 "에이전트 세션 기록"이 표시됩니다.

헤더에는 `12 shown · 47 recent`과 같은 개수와 검색창이 표시됩니다. 세션 제목, 작업 디렉터리, 분기, 모델을 기준으로 필터링하거나 대화의 텍스트 미리보기를 입력하세요.

## 범위

패널 상단의 범위 토글은 표시되는 세션을 결정합니다.

- `Workspace`(작업 공간) — 활성 작업 공간 컨텍스트에 따라 현재 작업 공간 또는 작업 트리의 세션입니다.
- `Project`(프로젝트) — 활성 Orca 프로젝트를 확인하는 세션입니다.
- `All`(모두) — 이 머신의 모든 에이전트에서 발견된 모든 세션 Orca입니다.

원격 작업 공간은 로컬 기록을 찾아볼 수 있지만 재개 작업은 로컬 작업 공간에서만 실행됩니다. Orca은 활성 작업 트리가 원격일 때 패널에서 이를 알려줍니다.

## 보기 옵션

보기 옵션 메뉴(검색 상자 옆)는 검색할 에이전트와 정렬 및 그룹화를 제어합니다.

-   **`Agents`(에이전트)** — 개별 CLI를 켜거나 끕니다(Claude, Codex, Hermes, Pi, OMP, Prime Agent, Cursor, Gemini, Antigravity, Rovo Dev, Copilot, OpenCode, Grok, OpenClaw, Devin, Droid, Kimi). 비활성화된 에이전트는 검사 중 건너뜁니다. 모든 에이전트를 한 번에 전환하려면 `Agents`(에이전트) 헤더에서 **`Select all`(모두 선택)** / **`Clear`(지우기)**를 사용합니다. **`Clear`(지우기)**는 선택을 모두 해제하므로 긴 목록을 하나씩 해제하지 않고 필요한 CLI만 켤 수 있습니다. 아무것도 선택하지 않으면 일반적인 빈 필터 메시지 대신 **`No agents selected`(선택된 에이전트 없음)**가 표시됩니다.
-   **`Sort`(정렬)** — `Last updated`(마지막 업데이트) 또는 `Created`(생성일)입니다.
-   **`Group`(그룹)** — `Project`(프로젝트), `Folder`(폴더)(`cwd`당 제목 하나) 또는 `Agent`(에이전트)(CLI당 제목 하나)입니다.
-   **`Hide empty sessions`(빈 세션 숨기기)** — 기록된 메시지가 0개인 세션을 숨깁니다.

## 세션 재개

세션 행을 클릭하면 작업 디렉터리, 브랜치, 모델, 메시지 수, **`First prompt`(첫 번째 프롬프트)**, 최신 대화 차례 등 세부 정보가 열립니다. 세부 정보를 펼치면 **`First prompt`(첫 번째 프롬프트)**가 대화 기록에서 잘리지 않은 첫 사용자 메시지를 불러옵니다(목록 행에는 검색용 짧은 미리 보기만 유지됩니다). 해당 카드의 **`Copy`(복사)**를 사용하면 전체 요청을 클립보드에 넣을 수 있어 로그를 다시 열지 않고도 긴 프롬프트를 재사용할 때 유용합니다. 활성화된 세션 행을 작업 공간으로 끌어 재개할 수도 있습니다. 행의 작업에서 다음을 수행할 수 있습니다.

-   **`Resume`(재개)** — 세션의 `cwd`에서 새 터미널을 열고 에이전트의 재개 명령(예: `claude --resume <id>`, `codex resume <id>`, `pi --session <session_file>`, `prime-agent --resume <path>`, `cursor-agent --resume <id>`, `acli rovodev run --restore <id>`)을 실행합니다. Codex 세션은 원래 세션에서 설정한 `CODEX_HOME`도 다시 내보냅니다.

Pi는 단순 세션 ID가 아니라 후크에서 보고한 디스크상의 세션 파일(`--session <path>`)에서 재개합니다. 해당 파일이 없으면 세션 ID가 있더라도 그 행에서 `Resume`(재개)을 사용할 수 없습니다.

-   **`Copy resume command`(재개 명령 복사)** — 외부 터미널에서 사용할 수 있도록 동일한 셸 명령을 클립보드에 복사합니다.
-   **`Copy session ID`(세션 ID 복사)** / **`Copy log path`(로그 경로 복사)** — 스크립팅하거나 버그 보고서에 대화 기록을 첨부할 때 사용합니다.
-   **`Open log`(로그 열기)** / **`Reveal log`(로그 위치 표시)** — Orca에서 원시 대화 기록 파일을 열거나 OS 파일 관리자에서 해당 위치로 이동합니다.
-   **`Open cwd`(현재 작업 디렉터리 열기)** — 세션의 작업 디렉터리를 작업 공간으로 엽니다.

이력서에는 로컬 작업 공간이 필요합니다

재개는 Orca이 렌더링되는 머신에서 에이전트 CLI를 실행합니다. 원격 작업 공간에 연결되어 있는 경우 `Copy resume command`(재개)를 클릭하기 전에 로컬 작업 공간으로 다시 전환하거나 `Resume`(재개 명령 복사)를 사용하여 원격에서 직접 실행하세요.

## 성적표의 출처

Orca은 각 에이전트의 자체 온디스크 세션 저장소(Codex의 `~/.codex/sessions`, Claude의 `~/.claude` 기록, Cursor의 세션 로그, OpenCode의 레거시 세션 파일 또는 `~/.local/share/opencode/opencode.db` 등. 활성화할 추가 항목은 없습니다. CLI가 기록을 작성하면 다음 스캔 후 패널에 표시됩니다. 요청 시 다시 검색하려면 헤더에 있는 `Refresh Session History`(새로 고침 세션 기록) 버튼을 사용하세요.

## 다음 단계

- [핫 스왑 Codex 계정](/orca-docs-ko/docs/agents/codex-hot-swap/) — Codex 로그인을 다시 시작하지 않고 활성 세션 뒤에서 전환합니다.
- [후크 및 메모리](/orca-docs-ko/docs/agents/hooks-memory/) — 에이전트가 시작할 때마다(재개된 세션 포함) 어떤 컨텍스트를 선택하는지 제어합니다.
