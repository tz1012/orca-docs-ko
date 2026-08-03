---
title: "에이전트 후크 및 메모리"
sourceUrl: https://www.onorca.dev/docs/agents/hooks-memory
checkedAt: "2026-08-03T07:35:41.401Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/usage-tracking/
next: /orca-docs-ko/docs/review/diff-viewer/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca은 Claude Code 및 Codex이 이미 사용하고 있는 에이전트 후크 및 메모리 규칙과 잘 작동합니다. 이를 읽고 존중하며 IDE 컨텍스트에 적합한 UI를 제공합니다.

## 저장소별 후크

Orca은 각 저장소의 `.claude/` 및 `.codex/` 구성을 읽습니다. Orca가 해당 저장소의 작업 트리에서 에이전트를 시작할 때 이미 가지고 있는 후크가 실행됩니다.

## 작업 트리 설정 후크

작업 트리가 생성된 후 자동으로 실행되도록 명령을 구성합니다. 예: `pnpm install`, `direnv allow` 또는 `.env` 파일을 복원하는 스크립트. [설정 → 리포지토리 → 후크](/orca-docs-ko/docs/settings/)에서 설정합니다.

## 메모리 파일

Claude의 `CLAUDE.md` 및 Codex의 `AGENTS.md`(repo 루트 또는 중첩)는 단독으로 남겨지며 에이전트에 속합니다. Orca는 다른 파일과 마찬가지로 파일 탐색기에 해당 파일을 표시하므로 인라인으로 편집할 수 있습니다.

## 재시작에서 살아남기

후크 엔드포인트는 디스크(POSIX의 경우 `{userData}/agent-hooks/endpoint.env`, Windows의 경우 `endpoint.cmd`)에 기록되고 모든 후크 호출 시 리소스가 제공되므로 앱을 다시 시작한 후에도 수명이 긴 에이전트 세션이 라이브 Orca 서버에 계속 도달합니다. 이전 세션보다 오래 지속된 PTY의 데드 포트 POST가 더 이상 발생하지 않습니다.

Orca CLI는 현장 에이전트가 스스로 업데이트할 수 있는 주석 처리된 작업 트리 상태를 표시합니다. [작업 트리 체크포인트](/orca-docs-ko/docs/cli/worktree-checkpoints/)를 참조하세요.
