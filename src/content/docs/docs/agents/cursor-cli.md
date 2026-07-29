---
title: "Orca의 Cursor CLI"
sourceUrl: https://www.onorca.dev/docs/agents/cursor-cli
checkedAt: "2026-07-29T01:03:00.276Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/codex/
next: /orca-docs-ko/docs/agents/custom-cli/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Cursor CLI은 Cursor의 명령줄 에이전트입니다. Orca은 콤보박스에서 실행, 전체 OSC 상태 감지, 종료 시 칩 재시작 등 최고 수준의 지원을 통해 이를 실행합니다.

## 설정

1. [Cursor 문서](https://cursor.com/cli)에 따라 Cursor CLI을 설치합니다.
2. 한번 로그인해 보세요.
3. Orca는 `PATH`에서 CLI를 자동 감지합니다.

## 출시

콤보 상자에서 **Cursor**을 선택합니다. Orca는 작업 트리로 범위가 지정된 CLI를 시작합니다. Cursor의 TUI는 에이전트 상태 점에 대해 Orca에 필요한 상태 이벤트를 내보냅니다.

## 모델 선택

모델 선택은 Cursor의 자체 설정에 따라 결정됩니다. Orca는 이를 재정의하지 않으며 CLI 내부에서 구성합니다.
