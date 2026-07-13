---
title: "문제 해결 및 FAQ"
sourceUrl: https://www.onorca.dev/docs/troubleshooting
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: /orca-docs-ko/docs/telemetry/
next: false
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

## 에이전트가 시작되지 않습니다

- 터미널을 열고 에이전트의 CLI를 수동으로 실행합니다. 여기서 실패하면 Orca이 아닌 CLI 자체의 인증 또는 설치 문제입니다.
- CLI가 Orca이 보는 'PATH'에 있는지 확인하세요([설정 → 에이전트](/orca-docs-ko/docs/settings/) 확인).
- 탭에서 `Restart`(다시 시작) 칩을 사용해 보세요.

## Diff 보기가 잘못되었거나 멈춘 것 같습니다.

- diff 도구 모음에서 새로 고침 아이콘을 클릭합니다. Orca은 작업 트리를 다시 읽습니다.
- 외부 `git` 작업(리베이스, 재설정)은 새로 고침 사이에 시작될 수 있습니다.

## 워크트리 생성 실패

- 시작 참조를 가져오지 못할 수 있습니다. 저장소에서 터미널을 열고 'git fetch origin'을 실행하세요.
- 대상 디렉터리에 이미 해당 분기에 대한 작업 트리가 있을 수 있습니다. 이를 삭제하거나 새 분기 이름을 선택하세요.

## Orca CLI에 "명령을 찾을 수 없습니다"라고 표시됩니다.

[설정 → 실험 → CLI](/orca-docs-ko/docs/settings/)에서 CLI를 등록합니다. macOS에서는 `~/.local/bin`에 shim을 설치합니다. 쉘의 `PATH`에 있는지 확인하세요.

## 브라우저에 'browser_no_tab'이라고 표시됩니다.

현재 작업 트리에 열려 있는 탭이 없습니다. 'orca tab create --url ...'로 열거나 수동으로 브라우저 창을 열고 탐색하세요.

## 성능 및 메모리

- 적극적으로 사용하지 않는 작업 트리를 닫습니다. 각 작업 트리는 파일 감시자를 활성 상태로 유지합니다.
- 많은 브라우저 탭이 있는 분할 레이아웃은 RAM을 가장 많이 사용하므로 필요하지 않은 브라우저를 닫습니다.

## 로그

`Help → Open Logs`(도움말 → 로그 열기)는 Orca의 로그가 있는 디렉터리를 엽니다. 버그를 신고할 때 이를 첨부하세요.

## 문제 보고

- [GitHub 문제](https://github.com/stablyai/orca/issues) — 버그 및 기능 요청.
- [Discord](https://discord.gg/fzjDKHxv8Q) — 실시간 도움을 드립니다.
