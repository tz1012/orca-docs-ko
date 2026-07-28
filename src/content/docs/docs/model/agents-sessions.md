---
title: "에이전트 및 세션"
sourceUrl: https://www.onorca.dev/docs/model/agents-sessions
checkedAt: "2026-07-28T07:12:33.480Z"
editUrl: false
prev: /orca-docs-ko/docs/model/tabs-panes-splits/
next: /orca-docs-ko/docs/model/session-restore/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

상태 점, 재시작 칩, 에이전트 세션의 수명 주기입니다.

`agent session`(에이전트 세션)은 하나의 작업 트리에 있는 하나의 터미널에서 실행되는 하나의 CLI 에이전트입니다. Orca은 수명 주기를 추적하므로 확인하기 위해 각 탭을 클릭할 필요 없이 어떤 세션이 작동 중이고 어떤 세션이 유휴 상태인지 항상 알 수 있습니다.

![모든 작업 트리 카드의 인라인 에이전트 상태 - 작업 중에는 노란색, 완료되면 녹색](/orca-docs-ko/assets/mirror/f5d2c9fee6ee0b82fc893ed1a8eb54ff5bc32cd983d7083a3e6e7083ccec8a7e.jpg)

모든 작업 트리 카드의 인라인 에이전트 상태 — 작업 중에는 노란색, 완료되면 녹색

## 상태 도트

모든 탭에는 에이전트의 상태를 나타내는 작은 점이 표시됩니다.

- `Green pulsing`(녹색 깜박임) — 에이전트가 활발하게 작업 중입니다(유휴 상태가 아닌 TUI).
- `Yellow`(노란색) — 에이전트가 사용자의 입력을 기다리고 있습니다.
- `Gray`(회색) — 에이전트가 유휴 상태입니다.
- `No dot`(점 없음) — 터미널은 인식된 에이전트 CLI가 아닌 일반 쉘입니다.

상태는 Claude Code, Codex 및 기타 여러 에이전트가 내보내는 터미널의 OSC 제목 시퀀스에서 감지됩니다.

## 상담원 대시보드

사이드바의 각 작업 트리 카드는 동일한 색상의 상태 점으로 에이전트 세션을 인라인하므로 카드를 확장하지 않고도 모든 작업 트리의 모든 에이전트를 한 눈에 볼 수 있습니다. 행은 볼 때까지 굵게 유지되며 사이드바 상태 오버레이는 먼저 주의가 필요한 작업 트리를 표시합니다.

대시보드는 기본적으로 켜져 있습니다. 토글이 없습니다. 상태 점이 표시되지 않으면 해당 세션의 에이전트 CLI가 Orca이 인식하는 OSC 제목을 내보내지 않는 것입니다. 바이너리를 직접 입력하는 대신 에이전트 콤보 상자를 통해 시작하십시오.

## 실행 기본값

Orca은 완전 자율성 권한 플래그가 사전 적용된 지원되는 모든 에이전트를 시작합니다. 즉, Claude와 `--dangerously-skip-permissions`, Codex와 `--dangerously-bypass-approvals-and-sandbox`, Gemini과 `--yolo`, 그리고 선택기. 그 의도는 작업 트리 자체가 샌드박스라는 것입니다. 즉, 에이전트는 흐름을 중단시키는 도구별 승인 메시지 없이 작업을 수행할 수 있습니다.

에이전트에 대해 다른 기본값을 원하는 경우 `Settings → Agents`(설정 → 에이전트)를 열고 에이전트 행을 확장한 다음 해당 `launch arguments`(실행 인수)를 편집하세요. Orca은 재정의를 기억하고 이후 실행 시마다 이를 적용합니다. 되돌리려는 경우 필드 옆에 있는 `Reset`(재설정) 버튼을 사용하면 배송된 플래그를 다시 되돌릴 수 있습니다.

## 칩 재시작

에이전트가 종료되면(클린 또는 충돌) 탭에 `Restart`(다시 시작) 칩이 표시됩니다. 한 번의 클릭으로 동일한 작업 디렉터리로 동일한 에이전트를 재수화합니다. Codex의 재시작 칩은 현재 계정도 보존합니다([핫 스왑 Codex 계정](/orca-docs-ko/docs/agents/codex-hot-swap/) 참조).

## 세션 수명주기

1. `Launch`(실행) — 콤보 상자에서 에이전트를 선택합니다. Orca은 CLI를 생성합니다.
2. `Work`(작업) — OSC 타이틀 업데이트 상태; 터미널 출력은 검색, 복사 및 Ghostty 테마로 스크롤됩니다.
3. `Idle`(유휴) — Orca는 작업 → 유휴 전환을 감지하고 [에이전트 완료 알림](/orca-docs-ko/docs/notifications/)을 발생시킵니다.
4. `Exit`(종료) — 프로세스가 종료됩니다. 재시작 칩이 나타납니다.

정확한 탐지 규칙은 [Orca CLI](/orca-docs-ko/docs/cli/overview/)의 `terminal wait --for tui-idle` 명령을 참조하세요.
