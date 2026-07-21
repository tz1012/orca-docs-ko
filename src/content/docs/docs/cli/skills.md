---
title: "Orca 기술 레지스트리 및 MCP"
sourceUrl: https://www.onorca.dev/docs/cli/skills
checkedAt: "2026-07-21T05:58:45.755Z"
editUrl: false
prev: /orca-docs-ko/docs/cli/worktree-checkpoints/
next: /orca-docs-ko/docs/mobile/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

orca-cli, 오케스트레이션, 컴퓨터 사용, orca-linear 및 orca-emulator을 포함하여 npx 기술 추가를 사용하여 Orca 에이전트 기술을 설치합니다.

Orca CLI 명령은 `skills`(스킬)(에이전트가 자체 스킬 디렉터리에 설치할 수 있는 버전이 지정된 패키지)로 배포됩니다.

## 설치 가능한 Orca 스킬

공개 Orca 저장소 및 스킬 이름과 함께 `npx skills add`을 사용하세요. 기본 에이전트 설정에서는 `orca-cli`, `computer-use` 및 `orchestration`를 사용합니다. 에이전트가 Linear 티켓 컨텍스트가 필요한 경우 `orca-linear`을 설치하고, Orca에서 로컬 iOS 시뮬레이터를 구동해야 하는 경우 `orca-emulator`을 설치하세요.

| 스킬 | 설치 | 다음 용도로 사용 |
| --- | --- | --- |
| [`orca-cli`](/orca-docs-ko/docs/cli/skills/#orca-cli) | `npx skills add https://github.com/stablyai/orca --skill orca-cli` | Orca 관리 작업 트리, 터미널, 파일, 자동화 및 내장 브라우저. |
| [`orchestration`](/orca-docs-ko/docs/cli/skills/#orchestration) | `npx skills add https://github.com/stablyai/orca --skill orchestration` | 메시지, 작업, 파견 및 결정 게이트를 통한 구조화된 다중 에이전트 조정. |
| [`computer-use`](/orca-docs-ko/docs/cli/skills/#computer-use) | `npx skills add https://github.com/stablyai/orca --skill computer-use` | 접근성 트리, 스크린샷, 클릭, 입력, 안전한 UI 작업을 통한 데스크톱 앱 제어. |
| [`orca-linear`](/orca-docs-ko/docs/cli/skills/#orca-linear) | `npx skills add https://github.com/stablyai/orca --skill orca-linear` | 연결된 Linear 문제로 작업하는 에이전트에 대한 Linear 티켓 컨텍스트입니다. |
| [`orca-emulator`](/orca-docs-ko/docs/cli/skills/#orca-emulator) | `npx skills add https://github.com/stablyai/orca --skill orca-emulator` | 탭, 제스처, 입력, 권한, 카메라 삽입 및 접근성을 갖춘 Orca의 iOS 시뮬레이터 제어입니다. |

## orca-cli

````
npx skills add https://github.com/stablyai/orca --skill orca-cli
````

설치 후 에이전트에는 작업 트리, 터미널 및 브라우저 등 모든 Orca CLI 명령을 설명하는 `SKILL.md`이 있습니다.

## Orca CLI에서 가이드 읽기

Orca CLI를 사용할 수 있다면 번들 가이드 명령을 사용하여 해당 Orca 버전에 맞는 스킬 텍스트를 읽습니다:

```
orca skills list
orca skills get orca-cli
orca skills get orchestration --full
```

에이전트가 자동화를 위해 결정적인 출력이 필요한 경우 두 명령 중 하나에 `--json`을 추가합니다. `skills show`는 `skills get`의 별칭으로도 사용할 수 있습니다.

## 오케스트레이션

````
npx skills add https://github.com/stablyai/orca --skill orchestration
````

에이전트가 `orca orchestration` 메시지, 작업, 디스패치 및 작업자 완료 추적을 통해 다른 에이전트를 조정해야 하는 경우 이 기능을 사용하세요. 워크플로는 [조정](/orca-docs-ko/docs/cli/orchestration/)을 참조하세요.

## 컴퓨터 사용

````
npx skills add https://github.com/stablyai/orca --skill computer-use
````

에이전트가 Orca의 컴퓨터 사용 표면을 통해 로컬 데스크톱 앱 창을 검사하고 작동해야 하는 경우 이 기능을 사용하세요. 작업 흐름은 [컴퓨터 사용](/orca-docs-ko/docs/cli/computer-use/)을 참조하세요.

## orca-linear 스킬

````
npx skills add https://github.com/stablyai/orca --skill orca-linear
````

에이전트가 Orca의 Linear 티켓 컨텍스트가 필요한 경우 이를 사용하세요. 기존 `linear-tickets` 설치는 계속 작동하며 Orca는 설치된 Linear 기술에 업데이트 작업을 라우팅합니다.

## orca-emulator 스킬

````
npx skills add https://github.com/stablyai/orca --skill orca-emulator
````

에이전트가 `orca emulator` 명령을 통해 Orca 내부에서 iOS 시뮬레이터를 제어해야 하는 경우 이 기능을 사용하세요.

## 나만의 스킬 추가

`skills/<name>/SKILL.md` 파일이 있는 모든 저장소는 `npx skills add`를 통해 설치할 수 있습니다. 에이전트에게 내부 저장소를 지정하여 회사별 권한을 부여하세요.

## MCP 서버

MCP(모델 컨텍스트 프로토콜) 서버는 외부 도구를 호환 가능한 에이전트에 노출합니다. [설정 → 통합 → MCP](/orca-docs-ko/docs/settings/)에서 MCP 엔드포인트를 등록합니다. 이러한 도구는 MCP를 지원하는 에이전트 CLI 내부에 나타납니다.
