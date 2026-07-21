---
title: "사용량 및 속도 제한 추적"
sourceUrl: https://www.onorca.dev/docs/agents/usage-tracking
checkedAt: "2026-07-21T05:58:45.755Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/hibernation/
next: /orca-docs-ko/docs/agents/hooks-memory/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca은 Claude Code, Codex, Gemini, OpenCode, Kimi 코드 및 MiniMax에 대한 로컬 사용 상태를 읽고 이를 상태 표시줄에 표시하므로 에이전트가 정지되기 전에 속도 제한에 얼마나 근접했는지 알 수 있습니다.

## 표시되는 내용

- 활성 계정의 계획에 대한 현재 사용량입니다.
- 5시간, 매일, 매주 및 Claude Fable 주간 창(해당되는 경우)에 대한 재설정 시간입니다.
- 한도의 80%를 넘으면 경고 칩이 표시됩니다.

## 작동 방식

Orca은 각 에이전트가 디스크(`~/.claude`, `~/.codex` 및 Gemini/OpenCode에 해당하는 항목)에서 유지 관리하는 로컬 사용 상태를 읽습니다. API 호출이나 추가 인증이 없습니다. 이는 판독값이 상담원 자신의 장부만큼만 최신임을 의미합니다. 숫자는 실시간이 아니라 상담원이 쓸 때 업데이트됩니다.

## 다중 계정 회계

상태 표시줄에는 항상 *활성* 계정이 반영됩니다. 구성된 다른 계정은 고유한 사용법과 함께 계정 전환기에 표시됩니다.
