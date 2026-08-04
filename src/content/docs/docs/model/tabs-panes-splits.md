---
title: "탭, 창 및 분할 레이아웃"
sourceUrl: https://www.onorca.dev/docs/model/tabs-panes-splits
checkedAt: "2026-08-04T03:02:33.909Z"
editUrl: false
prev: /orca-docs-ko/docs/model/worktrees/
next: /orca-docs-ko/docs/model/agents-sessions/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

드래그하여 분할 창, 탭 그룹 및 고정된 경계.

Orca의 창 시스템은 컨텍스트를 잃지 않고 여러 에이전트의 작업을 감시하도록 설계되었습니다. 탭은 창으로 그룹화됩니다. 창은 레이아웃으로 분할됩니다.

![탭을 창 가장자리로 드래그하여 분할 - 터미널, 차이점 및 브라우저 탭을 나란히 표시](/orca-docs-ko/assets/mirror/77c1f38da823432da0064cc893f915efeb449310a3dec0e7bdc196b38e313dea.jpg)

탭을 창 가장자리로 드래그하여 분할 - 터미널, 차이점 및 브라우저 탭을 나란히 배치

## 탭

각 탭에는 터미널, 편집기 버퍼, 브라우저, diff, PR 등 한 가지 항목이 포함됩니다. 탭은 `tab group`(탭 그룹) 내에 있습니다.

- 그룹 내에서 탭을 위아래로 드래그하여 순서를 바꾸세요.
- 탭을 다른 그룹으로 드래그하여 이동하세요.
- macOS에서는 `Cmd+Option+W`, Windows/Linux에서는 `Ctrl+Alt+W`를 사용하여 활성 작업 트리의 모든 편집기 파일 탭을 닫습니다.
- 활성 탭 색상 막대는 어느 창에 초점이 맞춰져 있는지 표시합니다.

### 탭 전환

**새로 설치한 환경**의 기본 키 조합은 다음과 같습니다.

| 작업 | macOS | Linux/Windows |
| --- | --- | --- |
| 다음/이전 탭(모든 유형) | `Cmd+Shift+]` / `Cmd+Shift+[` | `Ctrl+Shift+]` / `Ctrl+Shift+[` |
| 다음/이전 탭(동일한 유형) | `Cmd+Option+]` / `Cmd+Option+[` | `Ctrl+Alt+]` / `Ctrl+Alt+[` |
| 최근 사용한 이전 탭 | `Ctrl+Tab` | `Ctrl+Tab` |

[`Settings`(설정) → `Shortcuts`(바로 가기)](/orca-docs-ko/docs/settings/)에서 다시 매핑할 수 있습니다. 기존 설치는 사용자 지정 재정의를 `~/.orca/keybindings.json`에 유지합니다.

## 분할 창

분할을 생성하려면 탭을 창 가장자리로 드래그하세요.

- `Right edge`(오른쪽 가장자리) — left/right을 분할합니다(수평 분할).
- `Bottom edge`(하단 가장자리) — top/bottom를 분할합니다(수직 분할).

둥지를 나눕니다. 왼쪽에는 에이전트 터미널, 오른쪽 상단에는 차이점 보기, 오른쪽 하단에는 브라우저 탭이 모두 한 번에 있을 수 있습니다.

![모든 탭 유형은 다른 모든 탭 유형과 함께 분할할 수 있으며 에이전트 터미널, diff, 브라우저, 편집기, PR 보기가 하나의 창 트리에 함께 표시됩니다.](/orca-docs-ko/assets/mirror/10dd46b44c9e2bdf4975660d982218e4c0f629c0fbdaf73bacefebaf55612e04.webp)

모든 탭 유형은 다른 모든 탭 유형과 함께 분할할 수 있으며 에이전트 터미널, diff, 브라우저, 편집기, PR 보기가 하나의 창 트리에 함께 표시됩니다.

터미널 탭은 탭 내부에서 분할될 수도 있습니다. `Split terminal right`(터미널을 오른쪽으로 분할) 또는 `Split terminal down`(터미널을 아래로 분할)하려면 터미널 탭 메뉴를 사용하거나 오른쪽으로 분할하려면 활성 터미널 창 헤더에 있는 분할 버튼을 사용하세요.

## 고정된 경계

창 경계는 사용자가 배치한 위치에 유지됩니다. 창 크기를 조정해도 레이아웃이 섞이지 않습니다. 경계 위치는 작업 트리별로 저장됩니다.

## 작업 트리 전체의 탭 그룹

각 작업 트리는 자체 탭 레이아웃을 소유합니다. 작업 트리를 전환하면 전체 창 트리가 교체됩니다. 즉, 브라우저 탭, 터미널 및 차이점이 떠난 그대로 다시 나타납니다.
