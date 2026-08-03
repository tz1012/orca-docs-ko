---
title: "Orca의 Codex"
sourceUrl: https://www.onorca.dev/docs/agents/codex
checkedAt: "2026-08-03T07:35:41.401Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/glm-agent/
next: /orca-docs-ko/docs/agents/cursor-cli/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Codex은 OpenAI의 에이전트 CLI입니다. Orca의 Codex 통합은 앱에서 가장 심층적인 통합 중 하나입니다. 사용, 핫스왑 및 다시 시작은 모두 계정 ID를 유지합니다.

## 설정

1. OpenAI의 문서에 따라 Codex을 설치합니다.
2. 아무 터미널에서나 로그인하세요.
3. Orca은 계정 및 자격 증명에 대해 `~/.codex`를 읽습니다.

## 출시

에이전트 콤보 상자에서 `Codex`(Codex 에이전트)을 선택합니다. Orca는 작업 트리를 `cwd`로 사용하여 `codex`을 시작하고 현재 선택된 계정을 통해 인증을 라우팅합니다.

## 계정 핫스왑

많은 Codex 사용자는 속도 제한을 늘리기 위해 여러 계정을 실행합니다. Orca의 계정 전환기는 재로그인이나 구성 편집 없이 활성 계정을 교체합니다. [핫스왑 Codex 계정](/orca-docs-ko/docs/agents/codex-hot-swap/)을 참조하세요.

## 시스템 기본 계정과 추가 계정

**`System default`(시스템 기본값)**는 실제 `~/.codex` 로그인을 사용합니다(Orca 외부에서 별도로 실행한 `codex`가 사용하는 것과 동일한 홈입니다). Orca가 관리하는 추가 계정은 Orca의 계정 데이터 아래에 각각 전용 홈을 두므로 자격 증명과 롤아웃이 격리됩니다. 새 Codex 실행은 활성 계정을 따르지만, 이미 실행 중인 세션은 다시 시작할 때까지 시작할 때 사용한 홈을 유지합니다.

## 중첩된 Task 하위 에이전트

Codex가 Task 하위 에이전트를 생성하면 Orca는 작업 트리 에이전트 목록과 [에이전트 대시보드](/orca-docs-ko/docs/model/agents-sessions/#agent-dashboard)에서 이를 상위 에이전트 아래의 하위 행으로 표시할 수 있습니다. 펼침 화살표를 열어 각 하위 에이전트를 확인할 수 있으며, 하위 에이전트를 클릭하면 상위 터미널에 포커스가 맞춰집니다(하위 에이전트에는 별도 창이 할당되지 않습니다).

## 새 세션에서 `Continue`(계속)

에이전트 터미널의 헤더나 컨텍스트 메뉴에서 **`Continue in New Session…`(새 세션에서 계속)**을 선택합니다. Orca는 동일하거나 다른 CLI로 새 에이전트 세션을 시작하고 이전 기록 또는 캡처한 컨텍스트에서 범위를 제한한 인계 프롬프트를 주입합니다. 원래 세션은 그대로 유지되며, 이는 `codex resume`이 아닙니다.

## 칩 재시작

Codex이 종료되면 다시 시작 칩이 동일한 계정으로 에이전트를 다시 시작합니다. 세션 중에 계정을 교환하고 새 계정으로 다시 시작하려면 먼저 계정 전환기를 사용한 다음 다시 시작하세요.

## 사용량 및 속도 제한

Orca은 활성 계정에 대한 로컬 Codex 사용 상태를 읽고 이를 상태 표시줄에 표시합니다. [사용량 및 속도 제한 추적](/orca-docs-ko/docs/agents/usage-tracking/)을 참조하세요.

## Windows(WSL)의 Codex

Windows에서 Orca은 호스트 설치 또는 WSL 배포판에서 Codex를 실행할 수 있습니다. 계정 전환기에서 WSL 호스팅 Codex 계정 추가 — Orca는 distro(`~/.local/share/orca/codex-accounts/<id>/home` 아래) 내부에 격리된 계정 홈을 생성하고 인증 읽기를 위한 `\\wsl.localhost\<distro>\...` 경로로 호스트에 다시 매핑하며 선택한 배포판을 통해 시작, 핫스왑 및 속도 제한 가져오기를 라우팅합니다. Codex이 대상 배포판에 설치되지 않은 경우 바이너리가 누락된 배포판을 알려주는 실행 가능한 메시지와 함께 `Add account`(계정 추가) 대화 상자가 실패합니다.
