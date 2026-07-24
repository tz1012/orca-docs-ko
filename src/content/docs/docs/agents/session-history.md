---
title: "에이전트 세션 기록"
sourceUrl: https://www.onorca.dev/docs/agents/session-history
checkedAt: "2026-07-24T01:03:34.310Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/codex-hot-swap/
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

- `Agents`(에이전트) — 개별 CLI를 켜거나 끕니다(Claude, Codex, Cursor, Gemini, Hermes, Pi, Copilot, OpenCode, Grok, OpenClaw, Droid, Rovo Dev). 비활성화된 에이전트는 검사 중에 건너뜁니다.
- `Sort`(정렬) — `Last updated` 또는 `Created`.
- `Group`(그룹) — `Project`, `Folder`(`cwd`당 제목 하나) 또는 `Agent`(CLI당 제목 하나).
- `Hide empty sessions`(빈 세션 숨기기) — 녹음된 메시지가 없는 세션을 삭제합니다.

## 세션 재개

세션 행을 클릭하면 세부 정보(작업 디렉터리, 분기, 모델, 메시지 수, 총 토큰, 원래 요청 및 최신 대화 차례)가 열립니다. 활성화된 세션 행을 작업 공간으로 끌어서 재개할 수도 있습니다. 행의 작업에서 다음을 수행할 수 있습니다.

- `Resume`(재개) — 세션의 `cwd`에서 새 터미널을 열고 에이전트의 재개 명령(예: `claude --resume <id>`, `codex resume <id>`, `cursor-agent --resume <id>`, `acli rovodev run --restore <id>`)을 실행합니다. Codex 세션은 원래 세션이 1을 설정하면 `CODEX_HOME`도 다시 내보냅니다.
- `Copy resume command`(재개 명령 복사) — 외부 터미널에서 사용할 수 있도록 동일한 셸 명령을 클립보드에 복사합니다.
- `Copy session ID`(세션 ID 복사) / `Copy log path`(로그 경로 복사) — 스크립트를 작성하거나 버그 보고서에 기록을 첨부하는 데 사용됩니다.
- `Open log`(로그 열기) / `Reveal log`(로그 공개) — Orca에서 원시 기록 파일을 열거나 OS 파일 관리자에서 해당 파일로 이동합니다.
- `Open cwd`(작업 디렉터리 열기) — 세션의 작업 디렉터리를 작업 공간으로 엽니다.

이력서에는 로컬 작업 공간이 필요합니다

재개는 Orca이 렌더링되는 머신에서 에이전트 CLI를 실행합니다. 원격 작업 공간에 연결되어 있는 경우 `Copy resume command`(재개)를 클릭하기 전에 로컬 작업 공간으로 다시 전환하거나 `Resume`(재개 명령 복사)를 사용하여 원격에서 직접 실행하세요.

## 성적표의 출처

Orca은 각 에이전트의 자체 온디스크 세션 저장소(Codex의 `~/.codex/sessions`, Claude의 `~/.claude` 기록, Cursor의 세션 로그, OpenCode의 레거시 세션 파일 또는 `~/.local/share/opencode/opencode.db` 등. 활성화할 추가 항목은 없습니다. CLI가 기록을 작성하면 다음 스캔 후 패널에 표시됩니다. 요청 시 다시 검색하려면 헤더에 있는 `Refresh Session History`(새로 고침 세션 기록) 버튼을 사용하세요.

## 다음 단계

- [핫 스왑 Codex 계정](/orca-docs-ko/docs/agents/codex-hot-swap/) — Codex 로그인을 다시 시작하지 않고 활성 세션 뒤에서 전환합니다.
- [후크 및 메모리](/orca-docs-ko/docs/agents/hooks-memory/) — 에이전트가 시작할 때마다(재개된 세션 포함) 어떤 컨텍스트를 선택하는지 제어합니다.
