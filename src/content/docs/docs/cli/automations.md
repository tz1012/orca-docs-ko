---
title: "예약된 자동화"
sourceUrl: https://www.onorca.dev/docs/cli/automations
checkedAt: "2026-09-01T01:03:52.289Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/orchestration/
next: /orca-docs-ko/docs/cli/computer-use/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca 자동화는 CLI의 일정에 따라 프롬프트를 실행하므로 작업 트리를 직접 열지 않고도 반복 분류, 검토 및 유지 관리 작업을 시작할 수 있습니다. 이 페이지가 끝나면 비활성화된 자동화를 생성하고 검사한 후 준비가 되면 실행하게 됩니다.

## 안전한 첫 번째 자동화 만들기

프롬프트와 대상을 조정하는 동안 `--disabled`로 시작하세요.

````
orca automations create \
  --name "Weekday triage" \
  --trigger weekdays \
  --time 09:00 \
  --prompt "Triage new issues and summarize blockers" \
  --provider codex \
  --repo my-repo \
  --disabled \
  --json
````

`--trigger`은 `hourly`, `daily`, `weekdays`, `weekly`와 같은 사전 설정과 크론 표현식 또는 RRULE 문자열을 허용합니다. 일정이 런타임 기본값 대신 특정 IANA 시간대를 따라야 하는 경우 `--timezone <tz>`을 사용하세요.

## 실행이 발생하는 위치 선택

각 실행이 저장소에서 작업을 생성하거나 선택해야 하는 경우 `--repo <selector>`을 사용하세요. 대신 기존 Orca 작업 트리 내에서 자동화를 실행해야 하는 경우 `--workspace <selector>`를 사용하세요.

````
orca automations create \
  --name "Nightly status" \
  --trigger "0 18 * * 1-5" \
  --prompt "Summarize today's changes" \
  --provider claude \
  --workspace active \
  --disabled
````

두 대상 플래그를 모두 생략하면 Orca은 가능한 경우 현재 셸 디렉터리에서 바깥쪽 작업 트리를 확인합니다.

## 실행 전 사전 검사

비용이 적은 셸 탐색이 실패하면 예약된 작업을 건너뜁니다. 0이 아닌 종료 코드는 건너뛴 실행으로 기록됩니다.

```
orca automations create \
  --name "PR review" \
  --trigger hourly \
  --precheck "gh pr list --json number -q .[0].number" \
  --prompt "Review requested PRs" \
  --provider codex \
  --repo my-repo \
  --disabled \
  --json
```

## 프로젝트 호스트/설정 대상

자동화를 `--repo` / `--workspace`에서만 실행하지 않고 특정 프로젝트 호스트 설정에서 실행해야 하는 경우 다음을 사용합니다.

```
orca automations create \
  --name "Remote triage" \
  --trigger daily \
  --time 09:00 \
  --prompt "Triage open issues" \
  --provider claude \
  --project <projectId> \
  --host <hostId> \
  --disabled \
  --json
```

설정 ID가 이미 있으면 `--project-host-setup <id>`을 사용합니다. 선택적 `--source-context '<json>'`는 task/provider 데이터를 host/account에 고정합니다. 지우려면 편집 시 `null`를 전달합니다.

## 여러 호스트의 자동화 관리

데스크톱 **`Automations`(자동화)** 페이지는 이 컴퓨터와 지원되는 연결 Orca 호스트의 일정을 하나의 표로 불러옵니다. **`Host`(호스트)** 열에는 각 자동화가 저장되고 예약된 위치가 표시됩니다. 하나 이상의 호스트를 표시하려면 **`Filters → Host`(필터 → 호스트)**를 사용하고, 전체를 표시하려면 **`All hosts`(모든 호스트)**로 돌아갑니다.

데스크톱 UI에서 자동화를 만들 때는 프로젝트를 선택하기 전에 **`Create on`(생성 위치)**에서 호스트를 선택합니다. 그러면 프로젝트 선택기에 해당 대상에서 사용할 수 있는 프로젝트가 표시됩니다. 최신 Orca 서버가 필요한 연결 호스트는 선택기에서 사라지지 않고 **`Update server`(서버 업데이트)** 메시지와 함께 비활성화된 상태로 계속 표시됩니다.

## 누락된 실행의 유예 시간

```
orca automations edit <automationId> --missed-run-grace-minutes 30 --json
```

## 기존 자동화 세션 재사용

기존 작업 트리를 대상으로 하는 자동화의 경우 매번 빈 터미널에서 시작하는 대신 나중에 실행이 이전 라이브 자동화 터미널에서 계속되어야 하는 경우 `--reuse-session`을 추가하세요.

````
orca automations create \
  --name "Inbox digest" \
  --trigger hourly \
  --prompt "Summarize unread mail" \
  --provider codex \
  --workspace active \
  --reuse-session \
  --disabled
````

실행할 때마다 자동화를 새로운 터미널로 다시 전환하려면 `orca automations edit <automationId> --fresh-session --json`을 사용하세요.

## 검토 및 활성화

활성화하기 전에 자동화를 나열하고 검사하십시오.

````
orca automations list --json
orca automations show <automationId> --json
orca automations edit <automationId> --enabled --json
````

데스크톱 자동화 목록에 일정이 많으면 검색 필드를 사용하여 **`name`(이름)**, **`project`(프로젝트)** 또는 **`prompt`(프롬프트)** 텍스트로 필터링합니다. SSH 호스트에 저장된 외부 자동화는 해당 호스트의 연결이 끊겨도 삭제를 포함하여 관리할 수 있는 작업으로 계속 표시됩니다. 일정을 제거하기 위해 활성 SSH 세션을 유지할 필요가 없습니다.

**`Filters`(필터)**를 사용하여 **`Host`(호스트)**, **`Enabled`(활성화됨)** 또는 **`Paused`(일시 중지됨)** 상태, 마지막 실행 결과인 **`Failed`(실패)**, **`Succeeded`(성공)** 또는 **`Never ran`(실행 기록 없음)**, 하나 이상의 **`Agents`(에이전트)**를 기준으로 목록을 좁힙니다. 목록이 길면 에이전트 하위 메뉴에서 검색합니다. 활성 필터는 표 위에 개별적으로 제거할 수 있는 필로 표시됩니다. 표에는 각 자동화의 호스트, 마지막 실행 결과 및 상대 시간이 표시됩니다. **`Name`(이름)** 또는 **`Last run`(마지막 실행)** 열을 클릭하여 정렬합니다. 이름은 사전순으로 정렬되며, 마지막 실행은 기본적으로 최신순으로 정렬됩니다.

자동화 목록이 열려 있을 때 검색 필드에 입력하고 **`ArrowUp`(위쪽 화살표)** 또는 **`ArrowDown`(아래쪽 화살표)**을 눌러 표시된 일치 행 사이에서 선택 항목을 이동합니다. 목록은 선택된 행이 보이도록 유지합니다. 보조 키와 함께 입력하거나 IME 조합 중일 때에는 일반적인 커서 동작을 유지합니다.

이름, 프롬프트, 공급자, 대상, 일정 또는 활성화 상태를 변경하려면 `edit`을 사용합니다. `remove`는 자동화와 실행 기록을 삭제합니다.

## 요청 시 실행

자동화를 생성한 후 다음 예약 시간을 기다리기 전에 수동으로 트리거하여 프롬프트와 대상을 확인하세요.

````
orca automations run <automationId> --json
orca automations runs --id <automationId> --json
````

작업 영역을 열거나 대상에 다시 연결하기 전에 실행이 실패하면 Orca에서 해당 실행을 열고 `Rerun`(재실행)을 클릭하여 동일한 자동화에 대한 새로운 수동 실행을 대기열에 추가하세요.

## 다음 단계

- [Orca CLI 개요](/orca-docs-ko/docs/cli/overview/) - 작업 트리, 터미널 및 브라우저 제어에 대한 나머지 CLI 화면을 확인하세요.
- [기술 레지스트리 및 MCP](/orca-docs-ko/docs/cli/skills/) — 에이전트가 동일한 명령을 호출할 수 있도록 Orca CLI 기술을 설치합니다.
