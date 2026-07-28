---
title: "Orca CLI 참조"
sourceUrl: https://www.onorca.dev/docs/cli/reference
checkedAt: "2026-07-28T07:12:33.480Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/overview/
next: /orca-docs-ko/docs/cli/orchestration/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

셸에서 Orca을 구동하기 위한 명령, 선택기 및 에이전트 친화적인 패턴입니다.

`orca` CLI는 실행 중인 Orca 런타임과 통신합니다. 셸 스크립트나 에이전트가 작업 트리를 검사하고, 터미널을 실행하고, 파일을 열고, 내장 브라우저를 자동화하거나 진행 상황을 Orca에 다시 보고해야 할 때 이 기능을 사용하세요.

## 런타임 확인

[설정 -> 실험 -> CLI](/orca-docs-ko/docs/settings/)에서 CLI를 등록한 후 Orca에 도달할 수 있는지 확인하세요.

````
command -v orca
orca status --json
````

Orca이 아직 실행되고 있지 않은 경우:

````
orca open --json
orca status --json
````

다른 도구가 결과를 구문 분석할 때 `--json`을 사용하세요. 사람이 읽을 수 있는 출력은 빠른 터미널 점검을 위한 것입니다.

## 선택자

대부분의 명령은 긴 ID를 요구하는 대신 선택기를 허용합니다.

````
orca repo show --repo id:<repoId> --json
orca worktree show --worktree active --json
orca worktree show --worktree path:/abs/path/to/worktree --json
orca worktree show --worktree branch:feature-name --json
orca worktree show --worktree issue:123 --json
````

`active` 및 `current`는 셸의 현재 디렉터리나 터미널 컨텍스트를 기준으로 이를 포함하는 Orca 관리 작업 트리로 해석됩니다. 대상 작업 트리 외부에서 실행될 수 있는 스크립트에서는 명시적 선택기를 사용합니다. 원격 런타임에서는 로컬 셸의 현재 디렉터리가 런타임 호스트에 존재하지 않을 수 있으므로 `id:<repoId>::<absolute-worktree-path>` 또는 `path:<absolute-server-path>`와 같은 전체 서버 측 선택기를 사용하는 것이 좋습니다.

## 런타임 명령

````
orca open --json
orca status --json
orca serve --port 6768 --pairing-address 100.64.1.20 --json
````

`orca serve`은 데스크톱 창을 열지 않고 포그라운드에서 런타임 서버를 시작합니다. [원격 Orca 서버](/orca-docs-ko/docs/remote-servers/) 또는 헤드리스 환경에 사용하고 `Ctrl-C`로 중지합니다.

## 저장소

````
orca repo list --json
orca repo add --path /abs/path/to/repo --json
orca repo show --repo id:<repoId> --json
orca repo set-base-ref --repo id:<repoId> --ref origin/main --json
orca repo search-refs --repo id:<repoId> --query main --limit 10 --json
````

많은 작업 트리를 생성하기 전에 저장소 기본 참조를 설정하여 기본적으로 새 작업이 올바른 위치에서 분기되도록 합니다.

## 작업 트리

````
orca worktree list --repo id:<repoId> --json
orca worktree ps --json
orca worktree current --json
orca worktree show --worktree active --json
orca worktree create --repo id:<repoId> --name fix-login --json
orca worktree create --name child-task --agent codex --prompt "Investigate the flaky login test" --json
orca worktree set --worktree active --comment "reproduced failure; testing token refresh fix" --json
orca worktree rm --worktree id:<worktreeId> --force --json
````

`worktree create`이 Orca 관리 작업 트리 내부에서 실행되면 Orca은 관계를 유추할 수 있을 때 새 작업 트리를 하위 작업 트리로 기록합니다. 명시적으로 하려면 `--parent-worktree active`를 전달하고 새 작업이 독립적인 경우에는 `--no-parent`를 전달합니다.

에이전트 시작 플래그:

````
orca worktree create --name review-api --agent claude --setup run --json
orca worktree create --name quick-check --agent codex --prompt "Summarize the diff" --setup skip --json
orca worktree create --name hidden-setup --setup inherit --json
````

`--agent`은 첫 번째 터미널에서 선택한 에이전트를 시작합니다. `--prompt`는 해당 에이전트에 초기 작업을 보냅니다. `--setup run|skip|inherit`은 저장소 설정 후크를 제어합니다. `inherit`는 저장소 정책을 따릅니다.

## 터미널

````
orca terminal list --worktree active --json
orca terminal show --terminal <handle> --json
orca terminal read --terminal <handle> --json
orca terminal read --terminal <handle> --cursor <cursor> --limit 1000 --json
orca terminal send --terminal <handle> --text "continue" --enter --json
orca terminal wait --terminal <handle> --for tui-idle --timeout-ms 300000 --json
orca terminal create --worktree active --title "tests" --command "npm test" --json
orca terminal split --terminal <handle> --direction horizontal --command "npm run dev" --json
orca terminal rename --terminal <handle> --title "runner" --json
orca terminal switch --terminal <handle> --json
orca terminal close --terminal <handle> --json
````

현재 작업 트리의 활성 터미널을 대상으로 하려면 `--terminal`을 생략하세요. 단말기가 무엇을 기다리고 있는지 확실하지 않은 경우 보내기 전에 읽어보십시오.

터미널 핸들

터미널 핸들은 런타임 범위입니다. Orca이 다시 시작되거나 명령이 오래된 터미널 핸들을 보고하는 경우 `orca terminal list --json`를 실행하고 핸들을 다시 획득하세요.

긴 출력의 경우 커서 읽기를 사용하십시오. 한 번의 읽기에서 `nextCursor`을 저장한 다음 `--cursor`와 함께 다시 전달하여 새 출력만 가져옵니다.

## 파일

````
orca file open src/App.tsx --worktree active --json
orca file diff src/App.tsx --staged --worktree active --json
orca file open-changed --mode both --worktree active --json
````

경로는 선택한 작업 트리를 기준으로 합니다. `open-changed`은 git 상태를 읽고 편집, 비교 또는 두 모드 모두에서 변경된 파일을 엽니다.

## 내장 브라우저

브라우저 명령은 선택한 작업 트리에 대한 Orca의 내장 브라우저 탭을 제어합니다. Chrome, Safari 또는 Orca 데스크톱 UI를 제어하지 않습니다.

스냅샷 -> 작업 -> 스냅샷 루프를 사용하세요.

````
orca goto --url http://localhost:3000 --worktree active --json
orca snapshot --worktree active --json
orca click --element @e3 --worktree active --json
orca fill --element @e1 --value "user@example.com" --worktree active --json
orca wait --text "Welcome" --worktree active --json
orca screenshot --worktree active --json
````

`@e3`과 같은 참조는 `snapshot`에서 나옵니다. 탐색, 탭 전환, 페이지를 변경하는 클릭 및 오래된 참조 오류 후에 다시 스냅샷을 찍습니다.

탭 및 캡처 명령:

````
orca tab list --worktree active --json
orca tab create --url http://localhost:3000 --worktree active --json
orca tab switch --index 1 --worktree active --json
orca capture start --worktree active --json
orca console --limit 50 --worktree active --json
orca network --limit 50 --worktree active --json
orca full-screenshot --worktree active --json
orca pdf --worktree active --json
````

아직 입력된 Orca 명령이 없는 브라우저 작업에만 `orca exec --command "<agent-browser command>" --json`을 사용하세요.

브라우저 장치 에뮬레이션:

````
orca set device --name "iPhone 12" --worktree active --json
orca screenshot --worktree active --json
````

## 데스크탑 컴퓨터 사용

내장 브라우저 외부의 기본 데스크톱 앱에는 `orca computer`을 사용하세요.

````
orca computer permissions --json
orca computer list-apps --json
orca computer get-app-state --app com.apple.Safari --json
orca computer click --app com.apple.Safari --element-index 12 --json
orca computer paste-text --app com.apple.Safari --text "hello" --json
````

전체 작업 흐름 및 권한 설정은 [컴퓨터 사용](/orca-docs-ko/docs/cli/computer-use/)을 참조하세요.

## 모바일 에뮬레이터

모바일 에뮬레이터 명령은 Orca의 작업 트리 범위 브리지를 통해 iOS 시뮬레이터 장치를 제어합니다. 에이전트가 Orca 내부에서 작동 중일 때 원시 `serve-sim` 또는 `simctl` 대신 이를 사용하면 수명 주기 및 활성 장치 상태가 현재 작업 트리에 계속 연결됩니다.

````
orca emulator list --worktree active --json
orca emulator attach "<device-name-or-udid>" --worktree active --json
orca emulator tap 0.5 0.7 --worktree active --json
orca emulator type "hello" --worktree active --json
orca emulator gesture '[{"type":"begin","x":0.5,"y":0.8},{"type":"move","x":0.5,"y":0.4},{"type":"end","x":0.5,"y":0.2}]' --worktree active --json
orca emulator button home --worktree active --json
orca emulator rotate landscape_left --worktree active --json
orca emulator exec --command "tap 0.5 0.7" --worktree active --json
orca emulator kill --worktree active --json
orca emulator shutdown --worktree active --json
````

좌표는 `0`에서 `1`로 정규화됩니다. 단일 탭에는 `tap`을 선호하고, 드래그 또는 다단계 터치 입력에는 `gesture`를 사용하세요. 스크립트가 작업 트리의 활성 에뮬레이터 대신 특정 시뮬레이터를 대상으로 해야 하는 경우 `--device <udid-or-name>` 또는 `--emulator <id>`을 전달합니다.

## Linear 연동

`orca linear` 하위 명령은 연결된 Linear 작업공간을 스크립트 및 에이전트에 노출합니다. 읽기 명령은 JSON 티켓 컨텍스트를 반환합니다. 쓰기 명령은 상태를 변경합니다. 작업 트리에 연결된 Linear 문제(있는 경우)는 `--current`를 통해 도달할 수 있습니다.

읽기:

````
orca linear issue --current --full --json
orca linear issue ENG-123 --comments --children --json
orca linear search "auth bug" --workspace all --json
orca linear list --json
orca linear team list --json
orca linear team states --team <key|id> --json
orca linear team labels --team <key|id> --json
````

쓰다:

````
orca linear status set --current --to "In Progress" --json
orca linear assignee set --current --me --json
orca linear priority set ENG-123 --to high --json
orca linear estimate set --current --to 3 --json
orca linear due-date set --current --to 2026-08-01 --json
orca linear label add --current --label backend --json
orca linear comment add --current --body "Investigating regression" --json
orca linear attach --current --url https://example.com/repro --title "Repro" --json
orca linear create --title "Flaky login test" --team ENG --priority high --json
````

여러 개의 연결된 작업공간 간 라우팅을 위한 `--workspace <id>`를 포함하여 전체 플래그 목록을 보려면 `orca linear <command> --help`을 실행하세요. 스크립트가 Orca에 연결된 작업 트리 외부에서 실행될 수 있는 경우 명시적인 문제 ID(예: `ENG-123`)를 전달하세요. `--current`는 작업 트리가 Linear 문제에 연결된 경우에만 해결되기 때문입니다.

## 자동화, 환경 및 후크

예약된 프롬프트:

````
orca automations list --json
orca automations create --name "Daily review" --trigger daily --time 09:00 --prompt "Review open changes" --provider codex --repo id:<repoId> --disabled --json
orca automations run <automationId> --json
````

원격 런타임 환경:

````
orca environment add --name work-laptop --pairing-code "orca://pair?code=..." --json
orca environment list --json
orca environment rm --environment <selector> --json
````

에이전트 상태 후크:

````
orca agent hooks status --json
orca agent hooks on --json
orca agent hooks off --json
````

## 상담원 습관

- 자동화 및 에이전트 호출에는 `--json`을 선호합니다.
- UI 레이블을 구문 분석하는 것보다 선택기를 선호합니다.
- 다음 입력이 확실하지 않은 한 입력을 보내기 전에 터미널 상태를 읽습니다.
- 진행 체크포인트에 작업 트리 설명을 사용합니다. [작업 트리 체크포인트](/orca-docs-ko/docs/cli/worktree-checkpoints/)를 참조하세요.
- 추적된 다중 에이전트 파견을 위해 임시 터미널 프롬프트 대신 [오케스트레이션](/orca-docs-ko/docs/cli/orchestration/)을 사용합니다.
