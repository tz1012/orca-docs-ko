---
title: "Orca 기술 레지스트리 및 MCP"
sourceUrl: https://www.onorca.dev/docs/cli/skills
checkedAt: "2026-07-29T01:03:00.276Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/worktree-checkpoints/
next: /orca-docs-ko/docs/mobile/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

`npx skills add`로 Orca 에이전트 스킬을 설치합니다. 하이브리드 스텁은 간결하게 유지되며 `orca skills get`은 버전에 맞는 가이드를 제공합니다. Orca는 백그라운드에서 스킬을 업데이트할 수 있습니다.

Orca에는 에이전트가 스킬 디렉터리에 설치하는 **스킬**이 포함되어 있습니다. 공개 설치 패키지는 **하이브리드 검색 스텁**입니다. 에이전트가 Orca을 사용해야 하는 *시점*과 실행 중인 CLI에서 전체 가이드를 불러오는 방법을 알려 주는 짧은 `SKILL.md` 파일입니다. 명령 플래그는 바이너리에 있으므로 앱 버전과 달라질 수 없습니다.

## 설치 가능한 Orca 스킬

공개 Orca 저장소 및 스킬 이름과 함께 `npx skills add`을 사용합니다. 기본 에이전트 설정은 일반적으로 `orca-cli`, `computer-use`, `orchestration`를 설치합니다.

| 스킬 | 설치 | 용도 |
| --- | --- | --- |
| [`orca-cli`](/orca-docs-ko/docs/cli/skills/#orca-cli) | `npx skills add https://github.com/stablyai/orca --skill orca-cli --global` | 작업 트리, 터미널, 파일, 자동화, 내장 브라우저 |
| [`orchestration`](/orca-docs-ko/docs/cli/skills/#orchestration) | `npx skills add https://github.com/stablyai/orca --skill orchestration --global` | 다중 에이전트 실행, 작업, 감독되는 워커, 메시지, 게이트 |
| [`computer-use`](/orca-docs-ko/docs/cli/skills/#computer-use) | `npx skills add https://github.com/stablyai/orca --skill computer-use --global` | 접근성 트리와 안전한 UI 작업을 통한 데스크톱 앱 제어 |
| [`orca-linear`](/orca-docs-ko/docs/cli/skills/#orca-linear) | `npx skills add https://github.com/stablyai/orca --skill orca-linear --global` | `orca linear`를 통한 Linear 티켓 read/write |
| [`orca-emulator`](/orca-docs-ko/docs/cli/skills/#orca-emulator) | `npx skills add https://github.com/stablyai/orca --skill orca-emulator --global` | iOS Simulator 제어 |
| [`orca-emulator-android`](/orca-docs-ko/docs/cli/skills/#orca-emulator-android) | `npx skills add https://github.com/stablyai/orca --skill orca-emulator-android --global` | adb를 통한 Android emulator/device |
| [`orca-per-workspace-env`](/orca-docs-ko/docs/cli/skills/#orca-per-workspace-env) | `npx skills add https://github.com/stablyai/orca --skill orca-per-workspace-env --global` | 작업 공간별 환경 레시피(`orca.yaml`) |

## 하이브리드 스텁과 실시간 가이드

`npx skills add`을 실행한 후 에이전트에는 다음 내용을 담은 짧은 스텁이 표시됩니다.

1.  이 세션의 CLI 실행 파일(`ORCA_CLI_COMMAND`, `orca-dev`, Linux의 `orca-ide`, 그 외에는 `orca`)을 확인합니다.
2.  `orca skills get <topic>`로 전체 가이드를 불러옵니다. 긴 가이드에는 `--full`을 사용합니다.
3.  `--json`을 우선 사용하고 기억에 의존하여 플래그를 만들어 내지 않습니다.

```
orca skills list
orca skills get orca-cli
orca skills get orchestration --full
orca skills get orca-linear --json
```

에이전트가 자동화에 사용할 결정적 출력이 필요하면 `--json`을 추가합니다. `skills show`는 `skills get`의 별칭입니다.

## 스킬을 최신 상태로 유지

Orca에 전역 설치 버전보다 최신 스킬 패키지가 포함되어 있으면 앱에서 다음 작업을 수행할 수 있습니다.

-   **`update available`(업데이트 가능)** 알림을 표시합니다.
-   앱 내 대화 상자에서 **`npx skills update <names> --global`**을 실행합니다(터미널 불필요).
-   설치된 스킬의 **`Settings`(설정) → `Agents`(에이전트)**에 최신 상태를 표시합니다(전역 설치 경로).

수동으로 실행하는 동등한 명령은 다음과 같습니다.

```
npx skills update orca-cli orchestration computer-use --global
```

Orca에서 앱 내 업데이트 기능을 제공하면 앱에서 검색한 동일한 전역 설치 위치를 다시 쓸 수 있도록 해당 기능을 우선 사용합니다.

## orca-cli

```
npx skills add https://github.com/stablyai/orca --skill orca-cli --global
```

설치 후 `orca skills get orca-cli`로 버전에 맞는 명령 가이드를 불러옵니다. [Orca CLI](/orca-docs-ko/docs/cli/overview/)를 참조합니다.

## 오케스트레이션

```
npx skills add https://github.com/stablyai/orca --skill orchestration --global
```

에이전트가 실행, 작업, 감독되는 워커 및 결정 게이트를 통해 다른 에이전트를 조정해야 할 때 사용합니다. [오케스트레이션](/orca-docs-ko/docs/cli/orchestration/)을 참조합니다. 오케스트레이션 상태를 변경하기 전에 항상 `orca skills get orchestration --full`를 불러옵니다. 이전 `orchestration run` 명령은 사용 중단되었습니다.

## 컴퓨터 사용

```
npx skills add https://github.com/stablyai/orca --skill computer-use --global
```

에이전트가 로컬 데스크톱 앱 창을 검사하고 조작해야 할 때 사용합니다. [컴퓨터 사용](/orca-docs-ko/docs/cli/computer-use/)을 참조합니다.

## orca-linear 스킬

```
npx skills add https://github.com/stablyai/orca --skill orca-linear --global
```

에이전트는 티켓을 변경하기 전에 `orca skills get orca-linear`을 불러와야 합니다. `issue --full`, `save-issue`, `list-issues`, 관계, 완료 시 첨부+댓글 흐름 및 신뢰할 수 없는 티켓 규칙을 다룹니다. 기존 `linear-tickets` 설치도 계속 확인됩니다. [CLI 참조 → Linear](/orca-docs-ko/docs/cli/reference/#linear)을 참조합니다.

## orca-emulator 스킬

```
npx skills add https://github.com/stablyai/orca --skill orca-emulator --global
```

에이전트가 `orca emulator` 명령을 통해 Orca 내부에서 iOS 시뮬레이터를 제어해야 하는 경우 이 기능을 사용하세요.

## orca-emulator-android 사용

```
npx skills add https://github.com/stablyai/orca --skill orca-emulator-android --global
```

adb로 연결된 Android AVDs/devices에서 list/boot, tap/swipe/type, 하드웨어 버튼, install/launch, 권한, 접근성 트리 및 logcat을 사용할 때 적용합니다. `orca skills get orca-emulator-android`로 세부 정보를 불러옵니다.

## orca-per-workspace-env 사용

```
npx skills add https://github.com/stablyai/orca --skill orca-per-workspace-env --global
```

`orca.yaml`에서 작업 공간별 환경 레시피를 설정하거나 디버깅할 때 사용합니다. [Orca 실행 방법](/orca-docs-ko/docs/ways-to-run/#4-per-workspace-environments-ephemeral-vms)을 참조합니다.

## 나만의 스킬 추가

`skills/<name>/SKILL.md` 파일이 있는 모든 저장소는 `npx skills add`를 통해 설치할 수 있습니다. 에이전트에게 내부 저장소를 지정하여 회사별 권한을 부여하세요.

## MCP 서버

MCP(모델 컨텍스트 프로토콜) 서버는 외부 도구를 호환 가능한 에이전트에 노출합니다. [설정 → 통합 → MCP](/orca-docs-ko/docs/settings/)에서 MCP 엔드포인트를 등록합니다. 이러한 도구는 MCP를 지원하는 에이전트 CLI 내부에 나타납니다.
