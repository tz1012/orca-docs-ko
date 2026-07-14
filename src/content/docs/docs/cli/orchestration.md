---
title: "오케스트레이션"
sourceUrl: https://www.onorca.dev/docs/cli/orchestration
checkedAt: "2026-07-14T04:54:05.418Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/reference/
next: /orca-docs-ko/docs/cli/automations/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

메시지, 작업, 디스패치 및 결정 게이트를 사용하여 여러 Orca 에이전트 터미널을 조정합니다.

오케스트레이션은 다중 에이전트 작업을 위한 Orca의 구조화된 조정 계층입니다. 상담원에게 공유된 받은 편지함, 작업 기록, 파견 상태, 작업자 완료 메시지 및 결정 게이트를 제공하므로 코디네이터는 작업을 진행하고 완료된 내용을 알 수 있습니다.

조정 상태가 중요한 경우 오케스트레이션을 사용하세요. 일회용 터미널 입력의 경우 `orca terminal send`을 사용하세요. 소유권, 종속성 또는 작업자 완료로 추적된 작업의 경우 `orca orchestration`를 사용하세요.

실험적

이 명령을 사용하기 전에 설정 -> 실험에서 오케스트레이션을 활성화하세요. CLI는 실행 중인 Orca 런타임과 통신하므로 `orca status --json`가 먼저 성공해야 합니다.

## 핵심 모델

- `Message`(메시지): `status`, `dispatch`, `worker_done`, `escalation`, `decision_gate` 또는 `heartbeat`과 같은 유형의 영구 터미널 간 메모입니다.
- `Task`(작업): 사양, 종속성 및 상태가 포함된 작업 항목: `pending`, `ready`, `dispatched`, `completed`, `failed` 또는 `blocked`.
- `Dispatch`(디스패치): 터미널에 작업을 할당합니다. 새로운 디스패치 컨텍스트를 사용하여 작업을 재시도할 수 있습니다.
- `Decision gate`(결정 게이트): 해결될 때까지 작업을 차단하는 코디네이터 소유의 질문입니다.

완료 권한은 활성 디스패치 컨텍스트에서 발생합니다. 작업자 완료 및 하트비트 메시지에는 `taskId` 및 `dispatchId`가 모두 포함되어야 합니다.

`task_...`과 같이 터미널에 인쇄된 작업 ID는 클릭 가능한 링크입니다. 하나를 클릭하면 Orca 런타임에 작업의 현재 디스패치를 ​​요청하고 작업이 원격 또는 SSH 런타임에 있는 경우를 포함하여 할당된 터미널에 초점을 맞춥니다.

## 누가 일할 수 있는지 확인하세요

````
orca status --json
orca worktree ps --json
orca terminal list --json
orca orchestration task-list --json
orca orchestration inbox --limit 20 --json
````

터미널 핸들은 직접 오케스트레이션 메시지의 주소입니다. 그룹 주소도 지원됩니다.

```
orca orchestration send --to @all --subject "Heads up" --body "Pausing dispatches for a review." --json
orca orchestration send --to @idle --subject "Anyone free?" --json
orca orchestration send --to @codex --subject "Codex agents only" --json
orca orchestration send --to @cursor --subject "Cursor agents only" --json
orca orchestration send --to @grok --subject "Grok agents only" --json
orca orchestration send --to @droid --subject "Droid agents only" --json
orca orchestration send --to @worktree:<worktreeId> --subject "Worktree update" --json
```

PowerShell에서는 `--to "@all"`과 같은 그룹 주소를 인용하세요.

## 메시지 보내기 및 읽기

````
orca orchestration send \
  --to <terminalHandle> \
  --subject "Please review API shape" \
  --body "Focus on backwards compatibility." \
  --type status \
  --json

orca orchestration check --terminal <terminalHandle> --unread --json
orca orchestration check --terminal <terminalHandle> --all --types worker_done,escalation --json
orca orchestration reply --id <messageId> --body "Approved. Keep going." --json
orca orchestration inbox --limit 50 --full --json
````

`check --unread`이 기본값이며 일치하는 메시지를 읽은 것으로 표시합니다. `check --all`는 메시지를 읽은 것으로 표시하지 않고 메시지를 반환합니다.

오래 기다리려면 중요한 메시지 유형을 차단하세요.

````
orca orchestration check \
  --wait \
  --types worker_done,escalation,decision_gate \
  --timeout-ms 900000 \
  --json
````

대기가 활성화된 동안 CLI는 15초마다 stderr에 작은 JSON 하트비트 라인을 내보냅니다. Stdout은 최종 명령 결과로 유지됩니다.

## 수동 파견 흐름

작업 만들기:

````
orca orchestration task-create \
  --task-title "Billing mobile audit" \
  --display-name "Billing audit worker" \
  --spec "Audit the billing settings page for mobile layout bugs. Report files changed and screenshots." \
  --json
````

작업 목록에 Orca가 표시하는 간결한 작업 항목을 보려면 `--task-title`을 사용하세요. 파견된 작업자 행에 전체 프롬프트보다 짧은 레이블이 필요한 경우 `--display-name`을 사용하세요.

작업자 터미널을 생성하거나 선택합니다.

````
orca worktree create --name billing-mobile-audit --agent codex --json
orca terminal list --worktree id:<newWorktreeId> --json
orca terminal wait --terminal <workerHandle> --for tui-idle --timeout-ms 60000 --json
````

작업을 디스패치하고 작업자 프리앰블을 삽입합니다.

````
orca orchestration dispatch \
  --task <taskId> \
  --to <workerHandle> \
  --inject \
  --json
````

그런 다음 완료, 에스컬레이션 또는 결정 요청을 기다립니다.

````
orca orchestration check \
  --wait \
  --types worker_done,escalation,decision_gate \
  --timeout-ms 900000 \
  --json
````

시간 초과를 실패가 아닌 체크포인트로 처리합니다. 작업 및 터미널 상태를 검사한 후 작업자가 여전히 활성 상태이면 계속 기다립니다.

````
orca orchestration task-list --json
orca terminal read --terminal <workerHandle> --json
````

## 근로자 계약

파견된 근로자는 코디네이터와 통신하는 방법을 알려주는 서문을 받습니다. 중요한 규칙은 다음과 같습니다.

- 실패하더라도 `worker_done`을 정확히 한 번만 보냅니다.
- 간단한 `--body` 요약(수행된 작업, 발견된 작업, 남은 작업)을 포함합니다.
- 오래된 재시도가 잘못된 디스패치를 ​​완료할 수 없도록 작업 ID와 디스패치 ID를 모두 포함합니다.
- 장기간 활성 작업 중에 `heartbeat` 메시지를 보냅니다.
- 질문을 차단하려면 로컬 TUI 프롬프트 대신 `orca orchestration ask`를 사용하세요.

구조화된 페이로드 플래그를 사용하면 PowerShell 및 셸 인용이 더 쉬워집니다.

````
orca orchestration send \
  --to <coordinatorHandle> \
  --type worker_done \
  --subject "Completed mobile audit" \
  --body "Checked the billing settings page at narrow widths. Fixed the footer overlap in src/app/settings/Billing.tsx. No follow-up remains." \
  --task-id <taskId> \
  --dispatch-id <dispatchId> \
  --files-modified "src/app/settings/Billing.tsx" \
  --report-path "artifacts/billing-mobile-audit.md" \
  --json
````

하트비트:

````
orca orchestration send \
  --to <coordinatorHandle> \
  --type heartbeat \
  --subject "alive" \
  --task-id <taskId> \
  --dispatch-id <dispatchId> \
  --phase "implementing" \
  --json
````

차단 질문:

````
orca orchestration ask \
  --to <coordinatorHandle> \
  --question "Should I update the shared component or only this page?" \
  --options "shared,page-only" \
  --timeout-ms 600000 \
  --json
````

`--json`을 사용하면 `ask`는 단일 JSON 개체를 직접 인쇄하므로 작업자는 이를 `jq -r .answer`으로 파이프할 수 있습니다.

## 코디네이터 루프

더 큰 분해를 위해서는 Orca이 코디네이터 루프를 실행하도록 하세요.

````
orca orchestration run \
  --spec "Split the checkout QA work across available agents, collect results, and summarize blockers." \
  --max-concurrent 3 \
  --worktree active \
  --json
````

다음을 통해 진행 상황을 확인하세요.

````
orca orchestration task-list --json
orca orchestration task-list --ready --json
orca orchestration gate-list --status pending --json
````

활성 실행을 중지합니다.

````
orca orchestration run-stop --json
````

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

미리보기 파견 컨텍스트:

````
orca orchestration dispatch-show --task <taskId> --json
orca orchestration dispatch-show --task <taskId> --preamble --json
````

작업을 수동으로 업데이트합니다.

````
orca orchestration task-update --id <taskId> --status blocked --result '{"reason":"waiting on credentials"}' --json
````

의도적으로 오케스트레이션 상태를 포기하는 경우에만 재설정:

````
orca orchestration reset --tasks --json
orca orchestration reset --messages --json
orca orchestration reset --all --json
````

`reset`은 런타임 전역 조정 상태에 영향을 미칩니다. 의도된 정리가 아닌 이상 다른 코디네이터가 활성화되어 있는 동안 실행하지 마십시오.

## 올바른 명령 선택

감시 중인 에이전트에게 간단한 프롬프트를 표시하려면 `orca terminal send`을 사용하세요.

작업자가 `worker_done`를 보고하고, 코디네이터를 통해 질문하고, 작업 ID로 추적해야 하는 경우 `orca orchestration dispatch --inject`을 사용하세요.

Orca가 코디네이터 루프를 관리하고 사용 가능한 작업자 터미널에 준비된 작업을 파견하도록 하려면 `orca orchestration run`을 사용하세요.
