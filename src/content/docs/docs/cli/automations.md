---
title: "예약된 자동화"
sourceUrl: https://www.onorca.dev/docs/cli/automations
checkedAt: "2026-07-24T01:03:34.310Z"
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

이름, 프롬프트, 공급자, 대상, 일정 또는 활성화된 상태를 변경하려면 `edit`을 사용하세요. `remove`는 자동화 및 실행 기록을 삭제합니다.

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
