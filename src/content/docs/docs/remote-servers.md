---
title: "원격 Orca 서버"
sourceUrl: https://www.onorca.dev/docs/remote-servers
checkedAt: "2026-09-01T01:03:52.289Z"
editUrl: false
prev: /orca-docs-ko/docs/ssh/
next: /orca-docs-ko/docs/cli/overview/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

다른 컴퓨터에서 Orca을 계속 실행하고 노트북에서 연결합니다.

원격 Orca 서버를 사용하면 한 컴퓨터가 작업을 수행하고 다른 컴퓨터가 UI를 제공합니다. 서버에는 프로젝트, 작업 트리, 터미널, 탭, 공급자 계정 및 에이전트 세션이 유지됩니다. 노트북은 실행 중인 해당 Orca 인스턴스에 연결됩니다.

가장 간단한 설정은 두 컴퓨터에 Orca 데스크톱 앱을 설치하고 [Tailscale](https://tailscale.com/)을 통해 연결하는 것입니다. 이 방식에서는 `orca serve`을 실행할 필요가 없습니다.

베타

원격 Orca 서버는 베타 기능입니다. 서버와 클라이언트는 동일한 Tailscale tailnet이나 LAN처럼 사용자가 제어하는 비공개 네트워크 경로에 두어야 합니다.

## 구성 요소별 실행 위치

```
Client computer · Orca client
  Shows the UI and sends your input
                 │
                 │ private network route
                 ▼
Server computer · Orca server
  Stores repos and worktrees
  Runs terminals and agents
```

**서버 컴퓨터**에 Codex, Claude Code, OpenCode, `git` 및 사용할 공급자 CLI를 설치하고 인증합니다. 노트북의 로그인 정보가 서버로 자동 이전되지는 않습니다.

헤드리스 `orca serve` 호스트에서는 서버 셸에서 관리형 Claude/Codex 계정을 등록합니다. 원격 클라이언트에서는 **`Add account`(계정 추가)**가 비활성화됩니다.

```
orca account add --agent claude
orca account add --agent codex
orca account list
```

`Settings`(설정) UI 없이 에이전트 스킬을 설치하거나 새로 고칩니다.

```
orca skills install --skill orca-cli --skill orchestration
orca skills update --all
```

## 권장 방식: 데스크톱 앱 + Tailscale

다음 항목이 필요합니다.

-   두 컴퓨터 모두에 Orca이 설치되어 있고 최신 상태여야 합니다.
-   두 컴퓨터 모두에 Tailscale이 설치되어 있어야 합니다.
-   두 컴퓨터 모두 동일한 tailnet에 로그인되어 있어야 합니다.
-   서버 컴퓨터가 절전 상태가 아니고 온라인이며 Orca을 실행 중이어야 합니다.

Tailscale은 일반적으로 `100.`으로 시작하는 비공개 주소를 서버에 할당합니다. Orca은 연결 주소 선택기에 이 주소를 가장 먼저 표시합니다.

### 1\. 서버에서 액세스 링크 만들기

세션을 계속 실행할 컴퓨터에서 다음을 수행합니다.

1.  Orca 데스크톱 앱을 엽니다.
2.  **`Settings → Remote Orca Servers`(설정 → 원격 Orca 서버)**를 엽니다.
3.  **`Advertise this app as a server`(이 앱을 서버로 알리기)** 아래에서 **`New Link`(새 링크)**를 클릭합니다.
4.  **`Connection address`(연결 주소)**에서 Tailscale 주소를 선택합니다. 일반적으로 `100.x.y.z`과 같은 형식입니다.
5.  **`Generate Access Link`(액세스 링크 생성)**를 클릭합니다.
6.  **`Pair another Orca client`(다른 Orca 클라이언트 페어링)** 아래의 링크를 복사합니다.

Tailscale 주소가 없으면 Tailscale이 연결되어 있는지 확인하고 **`Connection address`(연결 주소)** 옆의 새로 고침 버튼을 클릭합니다.

![서버에서 Tailscale 주소를 선택하고 액세스 링크를 생성한 다음 일부가 가려진 페어링 URL을 복사합니다. 나중에 권한을 취소할 수 있습니다.](/orca-docs-ko/assets/mirror/4446ed634dea153f641c1ea09bafa43e16a60e280fa7182749571c3cd9be8158.png)

서버에서 Tailscale 주소를 선택하고 액세스 링크를 생성한 다음 일부가 가려진 페어링 URL을 복사합니다. 나중에 권한을 취소할 수 있습니다.

액세스 링크를 비공개로 유지합니다

페어링 URL은 이 Orca 런타임에 대한 액세스 권한을 부여합니다. 비밀번호처럼 취급하고 페어링하려는 클라이언트에만 전송합니다.

### 2\. 노트북에 서버 추가하기

클라이언트로 사용할 컴퓨터에서 다음을 수행합니다.

1.  **`Settings → Remote Orca Servers`(설정 → 원격 Orca 서버)**를 엽니다.
2.  **`Add Server`(서버 추가)**를 클릭합니다.
3.  `Remote Server`처럼 알아보기 쉬운 이름을 입력합니다.
4.  서버에서 받은 액세스 링크를 붙여 넣습니다.
5.  **`Add Server`(서버 추가)**를 클릭합니다.
6.  저장된 서버에 **`Disconnected`(연결 끊김)**가 표시되면 **`Connect`(연결)**를 클릭합니다.

![클라이언트에서 서버 이름을 지정하고 액세스 링크를 붙여 넣은 다음 서버를 추가합니다. 이 예시에서는 페어링 코드 일부가 가려져 있습니다.](/orca-docs-ko/assets/mirror/cb14b13e90d8568d51468843b777629655a6c17f6e0fe62c07c1f7c07581fb70.png)

클라이언트에서 서버 이름을 지정하고 액세스 링크를 붙여 넣은 다음 서버를 추가합니다. 이 예시에서는 페어링 코드 일부가 가려져 있습니다.

서버를 추가해도 모든 새 프로젝트가 강제로 해당 서버를 사용하지는 않으며 서버 정보만 저장됩니다. 서버를 통해 라우팅되는 프로젝트, 터미널, 공급자 확인 및 브라우저나 모바일 인계에서 해당 서버를 기본값으로 사용하려는 경우에만 **`Advanced → Active Server`(고급 → 활성 서버)**를 엽니다.

## 원격 서버 사용하기

서버에 **`Connected`(연결됨)**가 표시되면 서버 또는 서버의 프로젝트 중 하나를 선택하고 평소처럼 Orca을 사용합니다. 터미널, 에이전트 프로세스, 파일, 작업 트리 및 세션 상태는 서버 컴퓨터에 있습니다.

여러 페어링 클라이언트가 해당 서버를 공유하면 사이드바 필터에서 **`Hide other-client workspaces`(다른 클라이언트의 작업 공간 숨기기)**를 제공하여 이 기기가 직접 만든 작업 공간만 표시할 수 있습니다. [Worktrees → Sidebar layout(작업 트리 → 사이드바 레이아웃)](/orca-docs-ko/docs/model/worktrees/#sidebar-layout)을 참조합니다.

즉, 다음과 같이 동작합니다.

-   클라이언트 노트북이 절전 상태가 되거나 연결이 끊겨도 에이전트는 계속 실행됩니다.
-   서버에는 해당 에이전트가 사용하는 저장소, 도구 및 자격 증명이 필요합니다.
-   서버는 절전 상태가 아니어야 하며 tailnet에 계속 연결되어 있어야 합니다.
-   클라이언트를 다시 연결하거나 Orca를 다시 열면 페어링된 탭을 중복 생성하지 않고 서버가 소유한 작업 공간, 탭 및 표시 창 상태로 돌아갑니다.
-   서버에서 삭제한 프로젝트는 페어링된 모든 클라이언트의 사이드바에서도 사라지며 영구적인 유령 행이 남지 않습니다.

## 액세스 및 보안

Orca은 페어링된 클라이언트마다 별도로 취소할 수 있는 토큰을 만듭니다. 서버에서는 **`Shared Server Access`(공유 서버 액세스)** 아래에 이러한 토큰이 표시됩니다.

-   권한 옆의 휴지통 버튼을 클릭하면 권한이 취소됩니다. 해당 권한을 사용하는 활성 클라이언트의 연결은 즉시 끊깁니다.
-   새 링크를 생성하면 이전의 **사용하지 않은** 링크가 대체됩니다. 이미 페어링된 클라이언트의 권한은 직접 취소할 때까지 유지됩니다.
-   Tailscale ACL 또는 권한의 범위를 설정에서 허용하는 만큼 좁게 유지합니다.
-   Orca 포트를 공용 인터넷으로 직접 전달하지 않습니다. Tailscale, WireGuard, 신뢰할 수 있는 LAN, SSH 전달 또는 인증된 터널을 사용합니다.
-   다른 컴퓨터에서는 `127.0.0.1`를 선택하지 않습니다. 이 주소는 서버 자체에서만 작동합니다.

## 대안: `orca serve`

헤드리스 Linux 서버나 서비스에서 관리하는 VM처럼 호스트를 데스크톱 창 없이 실행해야 할 때는 `orca serve`을 사용합니다. 로그인 상태로 둘 수 있는 MacBook이나 데스크톱에서는 위의 앱 내 설정이 더 간단합니다.

서버에 Orca과 번들 CLI를 설치한 후 다음 명령을 실행합니다.

```
orca serve --pairing-address <server-tailscale-ip-or-hostname>
```

예를 들면 다음과 같습니다.

```
orca serve --pairing-address 100.64.1.20
```

이 명령은 다음 작업을 수행합니다.

-   데스크톱 창을 열지 않고 Orca 런타임을 시작합니다.
-   `Ctrl-C`을 누를 때까지 포그라운드에서 실행됩니다.
-   바인딩된 엔드포인트와 런타임 페어링 URL을 출력합니다.
-   `--pairing-address`은 클라이언트가 연결할 주소를 지정하는 용도로만 사용합니다.

출력된 페어링 URL을 클라이언트의 **`Settings → Remote Orca Servers → Add Server`(설정 → 원격 Orca 서버 → 서버 추가)**에 붙여 넣습니다.

방화벽, 터널 또는 서비스 정의에 고정 포트가 필요하면 `--port 6768`을 추가합니다.

```
orca serve --port 6768 --pairing-address 100.64.1.20
```

한 번에 하나의 호스트 모드만 사용합니다. Orca 데스크톱 앱이 이미 해당 컴퓨터를 공유하고 있다면 같은 설정에 두 번째 `orca serve` 프로세스를 시작하지 않습니다.

### 헤드리스 서버에서 모바일 연결하기

Orca 모바일 앱에서는 모바일 범위로 제한된 QR 코드와 링크를 요청합니다.

```
orca serve --pairing-address 100.64.1.20 --mobile-pairing
```

휴대전화를 동일한 tailnet에 연결한 상태에서 Orca Mobile을 열고 **`Pair`(페어링)**를 선택한 다음 터미널의 QR 코드를 스캔하거나 출력된 링크를 붙여 넣습니다.

## 데스크톱 앱과 `orca serve` 중 선택하기

|  | 서버의 데스크톱 앱 | `orca serve` |
| --- | --- | --- |
| 적합한 용도 | 이전에 사용하던 노트북, Mac mini 또는 데스크톱 | 헤드리스 Linux 시스템, VM 또는 관리형 서비스 |
| 설정 | 설정 화면과 버튼 | 터미널 명령 및 서비스 구성 |
| 서버 창 | 열림 | 없음 |
| 액세스 링크 | **`New Link`(새 링크) → `Generate Access Link`(액세스 링크 생성)** | 터미널에 출력됨 |
| 실행 기간 | 데스크톱 앱이 실행되는 동안 | 포그라운드 프로세스 또는 서비스가 실행되는 동안 |

## 원격 Orca 서버와 SSH 중 선택하기

[SSH 작업 트리](/orca-docs-ko/docs/ssh/)는 노트북의 Orca이 런타임을 소유하고 다른 컴퓨터는 선택한 작업 트리와 터미널을 실행하는 용도로만 사용해야 할 때 사용합니다.

원격 Orca 서버는 다른 컴퓨터가 전체 Orca 런타임을 소유하고 데스크톱, 브라우저, 모바일 또는 자동화 클라이언트가 공유할 세션을 유지해야 할 때 사용합니다.

전체 비교는 [Orca 실행 방식](/orca-docs-ko/docs/ways-to-run/)을 참조합니다.

## 문제 해결

### Tailscale 주소가 목록에 없습니다

서버에서 Tailscale이 연결되어 있는지 확인한 다음 **`Connection address`(연결 주소)** 옆의 새로 고침 버튼을 클릭합니다. 두 컴퓨터 모두 동일한 tailnet에 로그인되어 있어야 합니다. Tailscale IPv4 주소는 일반적으로 `100.`으로 시작합니다.

### 서버 연결이 끊겼습니다

서버 컴퓨터가 절전 상태가 아니고 Orca이 계속 실행 중이며 Tailscale에서 두 장치가 모두 온라인으로 표시되는지 확인합니다. 한 장치에서 다른 장치에 연결할 수 없다면 tailnet ACL 또는 권한을 확인합니다.

서버 행에 호환되지 않는 프로토콜 버전이 표시되면 두 컴퓨터의 Orca을 모두 업데이트합니다.

### 액세스 링크를 잘못된 사람과 공유했습니다

서버에서 **`Settings → Remote Orca Servers → Shared Server Access`(설정 → 원격 Orca 서버 → 공유 서버 액세스)**를 열고 해당 권한을 취소합니다. 올바른 클라이언트용 새 링크를 생성합니다.

### 서버에서 에이전트 CLI를 찾을 수 없습니다

서버 컴퓨터에 해당 CLI를 설치하고 인증합니다. 원격 세션은 클라이언트가 아니라 서버의 `PATH`, 홈 디렉터리 및 자격 증명을 사용합니다.

### `orca serve`이 잘못된 주소를 알립니다

명령을 중지한 후 클라이언트가 연결할 수 있는 주소로 다시 시작합니다.

```
orca serve --pairing-address <reachable-tailscale-ip-or-hostname>
```

원격 클라이언트에는 와일드카드 주소나 `127.0.0.1`을 사용하지 않습니다.

## 다음 단계

-   [Orca 실행 방식](/orca-docs-ko/docs/ways-to-run/)에서 모든 실행 모드를 비교합니다.
-   [SSH 작업 트리](/orca-docs-ko/docs/ssh/)는 노트북이 Orca 런타임을 소유해야 할 때 사용합니다.
-   [Orca CLI 참조](/orca-docs-ko/docs/cli/reference/)에서 `orca serve` 플래그와 자동화 명령을 확인합니다.
