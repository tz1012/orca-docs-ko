---
title: "Orca의 Claude Code"
sourceUrl: https://www.onorca.dev/docs/agents/claude-code
checkedAt: "2026-07-16T01:03:39.973Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/supported/
next: /orca-docs-ko/docs/agents/glm-agent/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Claude Code은 Anthropic의 에이전트 CLI입니다. Orca은 계정 인식 세션 시작, 사용 추적 및 계정 핫 스와핑 기능을 갖춘 일류 터미널 에이전트로 이를 실행합니다.

## 설정

1. Claude Code(`npm i -g @anthropic-ai/claude-code` 또는 Anthropic의 문서를 따르세요)을 설치하세요.
2. 아무 터미널에서나 한 번 로그인하세요.
3. Orca는 `~/.claude`를 자동으로 선택합니다. 추가 구성이 필요하지 않습니다.

## 출시

작업 트리에서 터미널을 열고 에이전트 콤보 상자에서 `Claude Code`(Claude Code 에이전트)을 선택합니다. Orca는 작업 디렉터리로 작업 트리를 사용하고 Orca이 상태 도트에 사용하는 OSC 제목 이벤트를 내보내는 상태 줄 후크를 사용하여 이를 시작합니다.

## 사용량 및 속도 제한

Orca은 로컬 `~/.claude` 사용 상태를 읽고 상태 표시줄에 현재 사용량과 비율 제한 근접성을 표시합니다. [사용량 및 속도 제한 추적](/orca-docs-ko/docs/agents/usage-tracking/)을 참조하세요.

## 계정 핫스왑

Orca은 여러 Claude 계정을 지원하며 Codex 흐름과 일치하도록 한 번의 클릭으로 계정 간에 전환할 수 있습니다. 계정 전환은 라이브 Claude 세션이 실행 중인 경우에도 작동합니다. Orca는 진행 중인 스위치를 가드 뒤에 보유하므로 중복된 인증 새로 고침이 트리거되지 않습니다. [핫스왑 Codex 계정](/orca-docs-ko/docs/agents/codex-hot-swap/)을 참조하세요. Claude 흐름은 모양이 동일합니다.

## 후크 및 메모리

Claude Code은 저장소별 후크 및 메모리 파일을 지원합니다. Orca는 [에이전트 후크 및 메모리](/orca-docs-ko/docs/agents/hooks-memory/) 아래에 이를 표시합니다.
