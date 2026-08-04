---
title: "사용자 정의 CLI 에이전트 추가"
sourceUrl: https://www.onorca.dev/docs/agents/custom-cli
checkedAt: "2026-08-04T03:02:33.909Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/cursor-cli/
next: /orca-docs-ko/docs/agents/codex-hot-swap/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca은 모든 CLI 에이전트를 일류 시민으로 취급합니다. 몇 초 안에 하나를 추가하세요.

![CLI 에이전트 추가 — Orca을 바이너리로 지정하면 콤보 상자에 표시됩니다.](/orca-docs-ko/assets/mirror/743e59b274b86ee42d3656ee82e30e567f926972e16347c6a202f5a2868faf52.jpg)

CLI 에이전트를 추가하세요. 바이너리에서 Orca을 가리키면 콤보 상자에 표시됩니다.

## 에이전트 추가

1. [설정 → 에이전트](/orca-docs-ko/docs/settings/)를 엽니다.
2. `Add custom agent`(사용자 지정 에이전트 추가)를 클릭합니다.
3. 이름, 바이너리 경로 또는 명령, 기본 인수를 입력합니다.
4. 선택적으로 시작 후크를 연결합니다. 에이전트를 시작하기 전에 쉘 명령 Orca가 실행됩니다(예: `source .envrc`).

## 당신이 얻는 것

- 에이전트는 모든 터미널의 콤보박스에 표시됩니다.
- 작업 디렉터리는 항상 현재 작업 트리입니다.
- 종료 시 칩을 다시 시작합니다.
- CLI가 OSC 제목을 내보내는 *경우* 상태를 점으로 표시합니다(아래 참조).

## 상태 점이 작동하도록 만들기

Orca은 OSC 타이틀 업데이트를 관찰하여 작동/유휴 상태를 감지합니다. 에이전트가 `working` 또는 `idle`과 같은 제목을 내보내면 Orca가 자동으로 이를 선택합니다. 그렇지 않은 경우 탭은 라이브 상태 점이 없는 완전한 기능을 갖춘 터미널입니다.

Orca은 에이전트 콤보 상자를 통해 일반 `bash` 또는 `zsh`을 실행하는 데 만족합니다. 이는 에이전트 없이 모든 작업 트리 컨텍스트가 있는 범위 지정 셸을 원할 때 유용합니다.
