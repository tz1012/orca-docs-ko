---
title: "핫스왑 Codex 계정"
sourceUrl: https://www.onorca.dev/docs/agents/codex-hot-swap
checkedAt: "2026-07-24T01:03:34.310Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/custom-cli/
next: /orca-docs-ko/docs/agents/session-history/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

토큰을 최대화하기 위해 여러 Codex 계정을 실행하는 것이 일반적입니다. Orca를 사용하면 다시 로그인하거나 구성을 편집할 필요 없이 한 번의 클릭으로 활성 계정을 핫스왑할 수 있습니다. Claude Code 계정에도 동일한 흐름이 적용됩니다.

![Codex 상태 표시줄의 계정 전환기 드롭다운](/orca-docs-ko/assets/mirror/697ac499cb101392ba67aab4e188b955c23ac512839ac76a9706c03492a43c6e.jpg)

상태 표시줄의 Codex 계정 전환기 드롭다운

## 계정 추가

1. 터미널에서 각 Codex 계정에 한 번 이상 로그인하여 인증이 `~/.codex` 아래에 위치하도록 합니다.
2. [설정 → 에이전트 → Codex 계정](/orca-docs-ko/docs/settings/)을 엽니다.
3. Orca는 감지된 모든 계정을 사용량 및 현재 제한과 함께 나열합니다.
4. 각각에게 "개인", "직장" 등 친근한 라벨을 부여하세요.

## 계정 교환

상태 표시줄에서 Codex 칩을 클릭하여 계정 전환기를 엽니다. 계정을 선택하세요. 이후에 시작된 새로운 Codex 세션은 이를 사용합니다. 이미 실행 중인 세션은 다시 시작될 때까지 원래 계정을 유지합니다.

## 규칙 및 주의 사항

- 교환이 즉시 이루어집니다. Orca은 활성 자격 증명 포인터를 다시 작성하며 재인증하지 않습니다.
- 기존 Codex 프로세스는 다시 시작할 때까지 현재 계정을 유지합니다.
- 상태 표시줄의 사용 정보는 현재 활성 계정을 따릅니다.
- 재시작 칩은 재시작 시 활성 계정을 유지합니다.

## Claude Code 계정

Claude 계정 전환기는 동일하게 작동합니다. 즉, 다른 데이터 디렉터리(`~/.claude`), 동일한 UX입니다.
