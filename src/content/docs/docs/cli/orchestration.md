---
title: "오케스트레이션"
sourceUrl: https://www.onorca.dev/docs/cli/orchestration
checkedAt: "2026-08-03T07:35:41.401Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/reference/
next: /orca-docs-ko/docs/cli/automations/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

실행, 작업, 감독되는 워커, 메시지 및 결정 게이트를 사용하여 에이전트를 조정합니다.

오케스트레이션은 Orca의 구조화된 다중 에이전트 계층으로, **실행**(네임스페이스 + 코디네이터 받은 편지함), **작업**, **디스패치**, 감독되는 **워커**, 메시지 및 결정 게이트로 구성됩니다.

소유권, 완료 추적 또는 DAG가 필요할 때 사용합니다. 일회성 프롬프트에는 `orca terminal send`을 사용합니다. 감독 없이 소유권 전체를 인계하려면 `orca-cli` 스킬의 worktree/terminal 명령을 사용합니다.

실험적 기능

이 명령을 사용하기 전에 `Settings`(설정) → `Experimental`(실험)에서 오케스트레이션을 활성화합니다. CLI는 실행 중인 Orca 런타임과 통신하므로 먼저 `orca status --json`가 성공해야 합니다.

이전 명령 사용 중단

`orca orchestration run` 및 `run-stop`와 `coordinator-start` / `coordinator-stop`는 **아무런 효과도 수행하지 않습니다**. 이 명령은 `orca skills get orchestration --full`를 안내하는 복구 텍스트를 반환합니다. 아래의 실행 + 워커 시작 흐름을 사용합니다.

## 핵심 모델

-   **실행** — 지속되는 네임스페이스와 기본 받은 편지함입니다. 워커를 예약하거나 배치하지 않습니다.
-   **작업** — 명세, 의존성 및 `pending`, `ready`, `dispatched`, `completed`, `failed`, `blocked` 중 하나의 상태가 있는 작업 항목입니다.
-   **디스패치** — 터미널에서 작업을 한 번 시도하는 단위이며 `worker_done` / 하트비트 수명 주기를 관리합니다.
-   **메시지** — 받은 편지함 메일(`status`, `dispatch`, `worker_done`, `escalation`, `question`, `heartbeat` 등)입니다.
-   **결정 게이트** — 해결될 때까지 작업을 차단하는 코디네이터 소유 질문입니다.

완료 권한은 활성 디스패치 컨텍스트에서 발생합니다. 작업자 완료 및 하트비트 메시지에는 `taskId` 및 `dispatchId`가 모두 포함되어야 합니다.

`task_...`과 같이 터미널에 인쇄된 작업 ID는 클릭 가능한 링크입니다. 하나를 클릭하면 Orca 런타임에 작업의 현재 디스패치를 ​​요청하고 작업이 원격 또는 SSH 런타임에 있는 경우를 포함하여 할당된 터미널에 초점을 맞춥니다.

## 권장 감독 루프

```
orca orchestration run-create --objective "Split checkout QA and summarize blockers" --json
orca orchestration task-create --spec "Audit billing settings for mobile layout" --task-title "Billing audit" --json
orca orchestration worker-start --task <taskId> --worktree current --agent codex --json
# or new worktree:
orca orchestration worker-start --task <taskId> --worktree new-child --name billing-audit --agent codex --setup run --json
```

완료를 기다립니다. Delivery의 모든 메시지를 처리한 다음 확인합니다.

```
orca orchestration check --wait --types worker_done,escalation,question --timeout-ms 900000 --json
orca orchestration check --ack <deliveryId> --wait --types worker_done,escalation,question --timeout-ms 900000 --json
```

워커 완료 시 워커 창에서 주입된 ID를 포함하여 다음을 실행합니다.

```
orca orchestration send \
  --type worker_done \
  --subject "Completed mobile audit" \
  --body "Fixed footer overlap; no follow-ups." \
  --task-id <taskId> \
  --dispatch-id <dispatchId> \
  --outcome succeeded \
  --files-modified "src/app/settings/Billing.tsx" \
  --json
```

`worker_done`에는 `--outcome succeeded|failed`가 필요합니다.

검사/복구 명령은 다음과 같습니다.

```
orca orchestration worker-show --dispatch <dispatchId> --json
orca orchestration worker-read --dispatch <dispatchId> --limit 50 --json
orca orchestration worker-stop --dispatch <dispatchId> --json
# retry placement is explicit — --retry-of does not inherit --on/worktree:
orca orchestration worker-start --task <taskId> --retry-of <dispatchId> --worktree current --agent codex --json
```

## 연합 워커(선택 사항)

```
orca orchestration worker-start \
  --task <taskId> \
  --on windows \
  --worktree new-top-level \
  --repo <exact_remote_repo_selector> \
  --name remote-worker \
  --agent codex \
  --setup run \
  --json
orca orchestration send --to dispatch:<dispatchId> --subject "Follow-up" --body "…" --json
```

이후 명령은 디스패치 ID로 라우팅되므로 `--on`을 반복하지 않습니다.

## 저수준 디스패치(사용자 지정 토폴로지)

```
orca worktree create --name billing-audit --agent codex --json
orca terminal wait --terminal <workerHandle> --for tui-idle --timeout-ms 60000 --json
orca orchestration dispatch --task <taskId> --to <workerHandle> --inject --json
```

## 메시징 참고 사항

-   기본 `check`은 바인딩된 실행에서 확인되지 않은 가장 오래된 Delivery(FIFO)입니다. `--ack`가 될 때까지 재생합니다.
-   `--peek` / `--all`는 메일을 소비하지 않습니다.
-   그룹 주소: `@all`, `@idle`, `@claude`, `@codex`, `@opencode`, `@gemini`, `@droid`, `@grok`, `@cursor`, `@worktree:<id>`이며 `worker_done` / 하트비트에는 절대 사용하지 않습니다.
-   PowerShell 그룹 주소는 `--to "@all"`처럼 따옴표로 묶습니다.

```
orca orchestration send --to @all --subject "Heads up" --body "Pausing dispatches for a review." --json
orca orchestration send --to @idle --subject "Anyone free?" --json
orca orchestration send --to @codex --subject "Codex agents only" --json
```

대기가 활성화된 동안 CLI는 15초마다 작은 JSON 하트비트 줄을 stderr에 내보냅니다. stdout에는 최종 명령 결과만 유지됩니다.

## 근로자 계약

디스패치된 워커는 코디네이터와 통신하는 방법을 안내하는 서문을 받습니다.

-   실패한 경우에도 `--outcome`와 함께 `worker_done`을 정확히 한 번 보냅니다.
-   수행한 내용, 발견한 내용 및 남은 내용을 담은 짧은 `--body` 요약을 포함합니다.
-   오래된 재시도가 잘못된 디스패치를 완료하지 않도록 작업 ID와 디스패치 ID를 모두 포함합니다.
-   활성 작업이 오래 걸리면 `heartbeat` 메시지를 보냅니다.
-   차단 질문에는 로컬 TUI 프롬프트 대신 `orca orchestration ask`를 사용합니다.

```
orca orchestration ask \
  --to <coordinatorHandle> \
  --question "Should I update the shared component or only this page?" \
  --options "shared,page-only" \
  --timeout-ms 600000 \
  --json
```

`--json`을 사용하면 `ask`가 단일 JSON 객체를 출력하므로 워커가 이를 `jq -r .answer`으로 파이프할 수 있습니다.

## 결정 게이트

작업자와 코디네이터 간의 질문에는 `ask`을 사용하세요. 코디네이터가 작업 DAG를 생성했고 결정이 기록될 때까지 작업을 차단하려는 경우 명시적 게이트를 사용합니다.

````
orca orchestration gate-create \
  --task <taskId> \
  --question "Merge the shared button change into the task branch?" \
  --options '["yes","no"]' \
  --json

orca orchestration gate-resolve --id <gateId> --resolution "yes" --json
````

## 복구

```
orca orchestration dispatch-show --task <taskId> --json
orca orchestration dispatch-show --task <taskId> --preamble --json
orca orchestration task-list --json
orca orchestration task-update --id <taskId> --status blocked --result '{"reason":"waiting on credentials"}' --json
```

오케스트레이션 상태를 의도적으로 포기할 때만 초기화합니다.

```
orca orchestration reset --tasks --json
orca orchestration reset --messages --json
orca orchestration reset --all --json
```

`reset`은 런타임 전역 오케스트레이션 상태에 영향을 줍니다. 의도한 정리 작업이 아니라면 다른 코디네이터가 활성 상태일 때 실행하지 않습니다.

## 올바른 명령 선택

감시 중인 에이전트에게 간단한 프롬프트를 표시하려면 `orca terminal send`을 사용하세요.

워커가 `worker_done`을 보고하고 코디네이터를 통해 질문하며 작업 ID로 추적되어야 하면 `orca orchestration worker-start` 또는 `dispatch --inject`를 사용합니다.

지속되는 실행 네임스페이스와 감독되는 다중 에이전트 루프가 필요하면 사용 중단된 `orchestration run` 명령이 아니라 `orca orchestration run-create` + 작업 + 워커를 사용합니다.

## 전체 가이드

명령 플래그는 앱과 함께 변경됩니다. 설치 후 에이전트는 다음을 실행해야 합니다.

```
orca skills get orchestration --full
```
