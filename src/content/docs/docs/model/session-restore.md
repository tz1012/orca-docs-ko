---
title: "세션 복원"
sourceUrl: https://www.onorca.dev/docs/model/session-restore
checkedAt: "2026-08-05T01:03:39.454Z"
editUrl: false
prev: /orca-docs-ko/docs/model/agents-sessions/
next: /orca-docs-ko/docs/model/quick-open/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca을 종료했다가 다시 열고 중단한 부분(작업 트리, 분할, 스크롤백, 포커스 탭)을 정확히 선택하세요.

Orca을 닫으면 다음 실행 시 열려 있는 모든 작업 트리, 모든 터미널 분할, 각 창의 스크롤백, 초점을 맞춘 탭 등 전체 작업 공간이 다시 수화됩니다. 어떤 지점에서 어떤 에이전트를 실행했는지 기억할 필요가 없습니다. 이것이 Orca의 작업입니다.

![Orca을 다시 시작하면 세션(터미널, 분할, 스크롤백, 포커스 탭)이 그대로 돌아옵니다.](/orca-docs-ko/assets/mirror/62d9ae8d02a8d5a60c6cb1cfddc5b9d701f83e3288542d3fb3d6c76eebf33c76.jpg)

Orca을 다시 시작하면 세션(터미널, 분할, 스크롤백, 포커스 탭)이 그대로 돌아옵니다.

## 복원되는 항목

- `Open worktrees`(작업 트리 열기) — 사이드바에 열려 있던 모든 작업 트리입니다.
- `Tabs and splits`(탭 및 분할) — 중첩 분할 및 포커스가 있는 탭을 포함하여 작업 트리당 창 레이아웃입니다.
- `Running agent processes`(에이전트 프로세스 실행 중) — 실행 중이던 에이전트는 Orca 종료 후에도 계속 실행됩니다. 백그라운드 데몬은 PTY를 소유하므로 앱 창을 닫아도 Claude Code, Codex 또는 기타 에이전트 CLI 작업 도중에 종료되지 않습니다. 다음 실행 시 Orca는 동일한 프로세스에 웜 재연결됩니다.
- `Terminal scrollback`(터미널 스크롤백) — Orca가 닫혀 있는 동안 생성된 출력을 포함하여 각 터미널의 버퍼입니다.
- `Focused worktree and tab`(중심 작업 트리 및 탭) — Orca은 닫은 것과 동일한 보기로 열립니다.

## 복원되지 않는 항목

호스트가 작동하면 데몬이 죽기 때문에 재부팅, OS 업데이트, 커널 패닉, 하드 전원 끄기 등 전체 시스템을 중단시키는 모든 작업은 실행 중인 모든 에이전트를 종료합니다. 다음 실행 시 작업 트리, 탭, 분할 및 마지막으로 알려진 스크롤백이 다시 표시되지만 에이전트 프로세스 자체는 사라집니다. 계속 진행하려면 아무 탭에서나 에이전트를 다시 실행하세요.

Orca이 닫혀 있는 동안 데몬이 충돌하면 보유하고 있던 모든 세션에 동일한 효과가 있지만 다음 실행 시 레이아웃과 스크롤백이 계속 복원됩니다.

## 복원이 실행될 때

세션 복원은 시작할 때마다 실행됩니다. 사례는 `daemon`(데몬)이 공백에서 살아남았는지 여부에 따라 나뉩니다.

`Daemon survives → agents keep running:`(데몬이 살아남음 → 에이전트가 계속 실행됨:)

- `Cmd-Q`(앱 종료) — 일반적인 종료 방법입니다. 에이전트는 백그라운드에서 계속 작업합니다.
- `Auto-updater relaunch`(자동 업데이트 프로그램 다시 시작) — 업데이트를 설치하기 위해 Orca이 다시 시작됩니다. 에이전트는 영향을 받지 않습니다.
- `App crash`(앱 충돌) — Orca 자체가 충돌하는 경우 데몬은 다음 실행 시 웜 재연결을 위해 세션을 활성 상태로 유지합니다.

`Daemon dies → agents are gone, layout still restores:`(데몬이 죽고 에이전트가 사라지고 레이아웃이 계속 복원됩니다.)

- `Host reboot`(호스트 재부팅) — 노트북 다시 시작, OS 업데이트, 커널 패닉, 하드 전원 끄기. 작업 트리, 탭, 분할 및 마지막으로 지속되는 스크롤백은 다음 실행 시 계속해서 다시 나타납니다.

새롭게 시작하다

깨끗한 상태를 원한다면 종료하기 전에 명시적으로 작업 트리를 닫으십시오. "새 세션에서 열기" 모드는 없습니다. Orca은 항상 복원됩니다. 닫힌 작업 트리는 닫힌 상태로 유지됩니다.

## 다음 단계

- [에이전트 및 세션](/orca-docs-ko/docs/model/agents-sessions/) — 에이전트 세션의 상태 점 및 수명 주기입니다.
- [탭, 창 및 분할 레이아웃](/orca-docs-ko/docs/model/tabs-panes-splits/) — 복원할 레이아웃이 처음에 어떻게 구축되는지입니다.
