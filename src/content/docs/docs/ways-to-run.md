---
title: "Orca 실행 방식"
sourceUrl: https://www.onorca.dev/docs/ways-to-run
checkedAt: "2026-08-21T01:11:26.454Z"
editUrl: false
prev: /orca-docs-ko/docs/terminal/
next: /orca-docs-ko/docs/ssh/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

로컬 데스크톱, SSH 호스트, 자체 호스팅 Orca 서버 및 주문형 작업 공간별 VM 중에서 각 작업에 적합한 컴퓨팅 환경을 선택합니다.

Orca은 노트북에만 제한되지 않습니다. 모든 작업 트리는 현재 사용하는 시스템, 이미 소유한 시스템, 공유 상시 실행 서버 또는 해당 작업 공간만을 위해 새로 시작한 클라우드 VM 중 한 곳에서 실행됩니다.

이 페이지는 전체 지도를 제공합니다. 자세한 내용은 연결된 각 페이지에서 설명합니다.

## 한눈에 보기

| 모드 | 파일 및 에이전트 위치 | 시스템 소유자 | 적합한 용도 |
| --- | --- | --- | --- |
| **로컬** | 사용자의 데스크톱 | 사용자 | 일상적인 코딩, 빠른 반복 작업 |
| **SSH 대상** | SSH로 연결하는 원격 호스트 | 사용자 또는 팀 | 개발 시스템, GPU 호스트, 상시 실행 VPS |
| **원격 Orca 서버** | Orca 데스크톱 또는 `orca serve`을 실행하는 시스템 | 사용자 또는 팀 | 영구 공유 런타임, 모바일, 자동화 |
| **Cloud VM / 작업 공간별 환경** | 작업 공간마다 생성되는 일회용 VM/sandbox | 사용자의 클라우드 계정(공급자 직접 준비) | 격리된 임시 에이전트 컴퓨팅 |

Orca은 관리형 VPS 호스팅을 **판매하지 않습니다**. 원격 모드는 항상 사용자가 제어하는 시스템과 클라우드 계정을 사용합니다.

## 1\. 로컬 데스크톱

Orca을 설치하고 프로젝트를 연 뒤 작업 트리를 만듭니다. 에이전트, 터미널 및 브라우저는 UI와 같은 시스템에서 실행됩니다.

![로컬 Mac의 사이드바 작업 트리 — 각 카드는 자체 에이전트와 브랜치가 있는 작업 트리입니다.](/orca-docs-ko/assets/mirror/e29f0273b7cbeacc0bb1a3ffc3f9048091a04b30fe851adcd92ffd75cc148231.png)

로컬 Mac의 사이드바 작업 트리 — 각 카드는 자체 에이전트와 브랜치가 있는 작업 트리입니다.

대부분의 사용자에게 기본 방식입니다. [첫 3개 에이전트 세션](/orca-docs-ko/docs/first-session/)과 [작업 트리](/orca-docs-ko/docs/model/worktrees/)를 참조합니다.

## 2\. SSH 대상

Orca을 더 강력한 Mac mini, Linux VPS, GPU 시스템, SSH를 지원하는 클라우드 샌드박스 등 원하는 SSH 호스트에 연결합니다. 작업 트리를 만들 때 **`Run on`(실행 위치)**에서 해당 호스트를 선택합니다. 에이전트와 `git worktree`는 원격에서 실행되고 편집기, diff 및 UI는 노트북에 유지됩니다.

![`Create worktree`(작업 트리 만들기) → `Run on`(실행 위치) — Local 또는 구성된 원격 호스트(여기서는 SSH를 통한 openclaw)를 선택합니다.](/orca-docs-ko/assets/mirror/4ece53bdc83cdf53e34dab028f7e12c0f3c25aa399542d3f56c6b1b8148ee64d.png)

`Create worktree`(작업 트리 만들기) → `Run on`(실행 위치) — Local 또는 구성된 원격 호스트(여기서는 SSH를 통한 openclaw)를 선택합니다.

**적합한 경우:** 원격 환경에 저장소, 도구 및 자격 증명이 이미 있으며, 노트북 한 대의 Orca으로 여러 시스템을 제어하려는 경우입니다.

**설정 개요:**

1.  [`Settings`(설정) → `SSH`](/orca-docs-ko/docs/settings/)에서 호스트를 추가합니다.
2.  연결을 테스트합니다. 저장소 작업 트리를 사용하려면 호스트에 Git이 설치되어 있어야 합니다.
3.  작업 트리를 만들고 **`Run on`(실행 위치)**에서 SSH 대상을 선택합니다. 자동 완성 목록에는 준비된 호스트가 표시되며, 연결되었지만 이 프로젝트에 아직 설정되지 않은 호스트는 선택할 수 없는 **`setup-needed`(설정 필요)** 행으로 표시됩니다.

SSH 작업 트리는 VS Code Remote-SSH에서 열 수 있고, SFTP가 허용하면 원격 폴더를 다운로드할 수 있으며, 원격에서 터미널 네이티브를 컴파일할 수 없는 경우에도 files/git에서 계속 사용할 수 있습니다(셸을 사용하려면 빌드 도구를 설치합니다). 자세한 내용은 [SSH 작업 트리](/orca-docs-ko/docs/ssh/) 및 [SSH를 통해 원격 머신에서 작업](/orca-docs-ko/docs/recipes/remote-worktrees/) 레시피를 참조합니다.

## 3\. 원격 Orca 서버

이전에 사용하던 노트북, Mac mini, 홈 서버, 클라우드 VPS 또는 팀 시스템처럼 사용자가 제어하는 시스템에서 Orca을 계속 실행합니다. 노트북, 브라우저 클라이언트 또는 휴대전화를 해당 런타임과 페어링합니다. **서버**가 프로젝트, 작업 트리, 터미널 및 에이전트 프로세스를 소유하며 클라이언트는 UI 역할을 합니다.

**적합한 경우:**

-   노트북이 절전 상태가 된 뒤에도 에이전트를 계속 실행하려는 경우
-   모바일에서 동일한 세션에 다시 연결해야 하는 경우
-   자동화 또는 백엔드가 안정적인 호스트에서 세션을 시작해야 하는 경우

**가장 간단한 설정:** 두 컴퓨터 모두에 Orca과 Tailscale을 설치합니다. 서버에서 **`Settings → Remote Orca Servers → Advertise this app as a server → New Link`(설정 → 원격 Orca 서버 → 이 앱을 서버로 알리기 → 새 링크)**를 열고 Tailscale 주소를 선택한 다음 액세스 링크를 생성합니다. 클라이언트에서 **`Add Server`(서버 추가)**를 선택하고 해당 링크를 붙여 넣습니다.

헤드리스 Linux 서버나 서비스에서 관리하는 VM에서는 대안으로 `orca serve`을 사용합니다.

```
orca serve --pairing-address <reachable-tailscale-ip-or-hostname>
```

자세한 내용은 [원격 Orca 서버](/orca-docs-ko/docs/remote-servers/)를 참조합니다.

### SSH와 원격 Orca 서버 비교

|  | SSH 작업 트리 | 원격 Orca 서버 |
| --- | --- | --- |
| 런타임 소유자 | 노트북의 Orca | 원격 시스템(Orca 데스크톱 또는 `orca serve`) |
| 연결 해제 | 에이전트는 호스트에서 계속 실행되며 노트북이 다시 연결됩니다. | 전체 세션 상태가 서버에 유지됩니다. |
| 다중 클라이언트 | 노트북 한 대가 호스트를 제어합니다. | 노트북, 웹, 모바일 및 자동화가 동일한 런타임을 공유할 수 있습니다. |
| 일반적인 설정 | SSH 구성을 가져오고 **`Run on`(실행 위치)**을 선택합니다. | 서버 앱을 공유하거나 `orca serve`을 실행한 다음 URL로 페어링합니다. |

## 4\. Cloud VM(작업 공간별 환경)

각 작업 트리는 저장소에 체크인된 **레시피**(`orca.yaml`과 수명 주기 스크립트)를 사용해 클라우드 샌드박스, VM 또는 로컬 Docker 컨테이너 같은 자체 주문형 환경을 시작할 수 있습니다. 생성할 때 환경을 시작하고 suspend/resume/destroy 작업으로 종료합니다. Orca은 얇은 래퍼일 뿐이며 공급자 계정, 이미지 및 요금 청구는 사용자가 계속 소유합니다.

제품 UI에서는 [**`Settings → Experimental`(설정 → 실험 기능)**](/orca-docs-ko/docs/settings/) 아래에 이 기능이 **`Cloud VM`(클라우드 VM)**으로 표시됩니다. 레시피는 계속 작업 공간별 환경을 생성합니다.

현재 연결할 수 있는 공급자로는 Vercel Sandbox, Fly, Modal, 일반 SSH 호스트 및 로컬 Docker 등이 있습니다. 연결 방식은 **Orca 서버**(레시피가 `orca serve`를 시작하고 페어링 URL을 반환) 또는 **SSH**(레시피가 Orca이 연결할 세부 정보를 반환)입니다.

![`Settings → Experimental → Cloud VM`(설정 → 실험 기능 → 클라우드 VM) — 스킬을 활성화한 다음 에이전트가 저장소용 레시피를 설정하게 합니다.](/orca-docs-ko/assets/mirror/61bcfdee2072d9b58c7235717e9f8ac55dd41cef98ffa9fb94bcfcda3f3801ca.png)

`Settings → Experimental → Cloud VM`(설정 → 실험 기능 → 클라우드 VM) — 스킬을 활성화한 다음 에이전트가 저장소용 레시피를 설정하게 합니다.

**적합한 경우:** 작업별로 깔끔하게 격리된 환경, 일회용 컴퓨팅 또는 모든 에이전트가 시작할 때 사용하는 표준 환경이 필요한 경우입니다.

**설정 개요:**

1.  [`Settings → Experimental`(설정 → 실험 기능)](/orca-docs-ko/docs/settings/)에서 **`Cloud VM`(클라우드 VM)**을 활성화합니다. 이 창에는 간단한 **`Create a Cloud VM`(Cloud VM 생성)** 가이드와 recipe/runtime 컨트롤이 있습니다.
    
2.  필요한 경우 Cloud VM / 작업 공간별 환경 스킬을 Install/update합니다.
    
3.  원하는 작업 공간에서 에이전트에게 다음과 같이 요청합니다.
    
    ```
    Use the orca-per-workspace-env skill to set up a per-workspace environment for this repo.
    ```
    
4.  스킬이 사전 요구 사항 → 기본 스냅샷 → 에이전트 인증 → `orca.yaml` 레시피 → doctor 검증 순서로 안내합니다.
    
5.  **`Recipes`(레시피)** 아래에 레시피가 표시되면 작업 트리를 만들고 **`Run on`(실행 위치)**에서 해당 레시피를 선택합니다.

`environmentRecipes` 항목이 프로젝트의 **기본** `orca.yaml` 체크아웃에 있어야 작업 공간 생성 시 레시피가 표시됩니다. 기능 브랜치에만 있으면 표시되지 않습니다. 스크립트를 반복 개발하는 동안에는 어느 브랜치에서든 doctor와 실제 프로비저닝을 실행할 수 있습니다.

클라우드 직접 준비 — Orca VPS가 아닙니다

Cloud VM은 Orca이 호스팅하는 VPS를 제공하지 않습니다. 공급자를 직접 준비하고 해당 공급자에게 비용을 지불합니다. Orca은 사용자의 create/suspend/resume/destroy 스크립트를 실행하고 스크립트가 출력하는 페어링 URL 또는 SSH 세부 정보로 연결합니다.

## 선택 방법

-   노트북 성능이 충분하고 에이전트 실행 시간이 짧다면 **로컬**을 사용합니다.
-   이미 VPS나 개발 시스템이 있고 두 번째 Orca 런타임을 설치하지 않은 채 그곳에서 에이전트를 실행하려면 **SSH**를 사용합니다.
-   **원격 Orca 서버**는 모바일, 브라우저 및 자동화에서 사용할 상시 실행 Orca 런타임 하나가 필요할 때 사용합니다.
-   각 작업에 작업 트리와 함께 폐기되는 새로운 레시피 기반 샌드박스가 필요하면 **Cloud VM / 작업 공간별 환경**을 사용합니다.

한 설치에서 여러 모드를 혼합할 수 있습니다. 빠른 편집에는 로컬 작업 트리를, GPU 시스템에는 SSH를, CI와 유사한 격리에는 레시피를 사용할 수 있습니다.

## 관련 문서

- [SSH 작업 트리](/orca-docs-ko/docs/ssh/)
- [원격 Orca 서버](/orca-docs-ko/docs/remote-servers/)
- [작업 트리](/orca-docs-ko/docs/model/worktrees/)
- [모바일](/orca-docs-ko/docs/mobile/)
- [설정 참조](/orca-docs-ko/docs/settings/)
