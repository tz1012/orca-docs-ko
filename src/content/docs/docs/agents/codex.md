---
title: "Orca의 Codex"
sourceUrl: https://www.onorca.dev/docs/agents/codex
checkedAt: "2026-07-28T07:12:33.480Z"
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

## 칩 재시작

Codex이 종료되면 다시 시작 칩이 동일한 계정으로 에이전트를 다시 시작합니다. 세션 중에 계정을 교환하고 새 계정으로 다시 시작하려면 먼저 계정 전환기를 사용한 다음 다시 시작하세요.

## 사용량 및 속도 제한

Orca은 활성 계정에 대한 로컬 Codex 사용 상태를 읽고 이를 상태 표시줄에 표시합니다. [사용량 및 속도 제한 추적](/orca-docs-ko/docs/agents/usage-tracking/)을 참조하세요.

## Windows(WSL)의 Codex

Windows에서 Orca은 호스트 설치 또는 WSL 배포판에서 Codex를 실행할 수 있습니다. 계정 전환기에서 WSL 호스팅 Codex 계정 추가 — Orca는 distro(`~/.local/share/orca/codex-accounts/<id>/home` 아래) 내부에 격리된 계정 홈을 생성하고 인증 읽기를 위한 `\\wsl.localhost\<distro>\...` 경로로 호스트에 다시 매핑하며 선택한 배포판을 통해 시작, 핫스왑 및 속도 제한 가져오기를 라우팅합니다. Codex이 대상 배포판에 설치되지 않은 경우 바이너리가 누락된 배포판을 알려주는 실행 가능한 메시지와 함께 `Add account`(계정 추가) 대화 상자가 실패합니다.
