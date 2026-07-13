---
title: "원격 Orca 서버"
sourceUrl: https://www.onorca.dev/docs/remote-servers
checkedAt: "2026-07-13T09:05:36.078Z"
editUrl: false
prev: /orca-docs-ko/docs/ssh/
next: /orca-docs-ko/docs/cli/overview/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

다른 컴퓨터에서 Orca을 실행하고 데스크톱이나 브라우저 클라이언트에서 연결하세요.

원격 Orca 서버를 사용하면 한 시스템이 Orca 런타임을 실행하는 동안 다른 Orca 클라이언트가 이에 연결할 수 있습니다. 개발 상자, GPU 호스트 또는 Always-On 서버가 프로젝트, 작업 트리, 터미널, 탭, 공급자 확인 및 에이전트 세션을 소유해야 하는 경우 이를 사용합니다.

베타

원격 Orca 서버는 베타 버전입니다. 서버와 클라이언트는 LAN, Tailscale, SSH 전달 또는 터널과 같이 제어하는 ​​네트워크 경로를 통해 서로 연결할 수 있어야 합니다.

## 정신 모델

원격 Orca 서버 설정에는 두 가지 역할이 있습니다.

- `Server machine`(서버 머신): `orca serve`을 실행하고 저장소, 작업 트리, 터미널 및 에이전트 프로세스를 소유합니다.
- `Client machine`(클라이언트 머신): Orca UI를 실행하고 서버 머신에 연결합니다.

예를 들면:

````
Server B
  Runs orca serve
  Runs Codex, Claude Code, OpenCode, or other agent CLIs
  Stores the worktrees and terminal sessions

Laptop
  Runs the Orca desktop app
  Connects to Server B from Settings -> Remote Orca Servers
  Starts, views, and manages sessions through the UI

Optional backend
  Authenticates users or receives product actions
  Asks Server B to create a terminal/worktree when automation is needed
````

세션을 수동으로 시작하려는 경우 페어링 후 Orca UI에서 수행할 수 있습니다. CLI 예제는 대부분 자동화를 위한 것입니다.

## 서버에 Orca을 설치합니다.

작업을 수행해야 하는 머신에 Orca을 설치합니다.

Arch Linux에서는 AUR에서 패키지된 빌드를 설치합니다.

````
yay -S stably-orca-bin
````

또는 소스 빌드 패키지를 사용하십시오.

````
yay -S stably-orca-git
````

다른 Linux 배포판의 경우 최신 릴리스에서 Linux AppImage를 다운로드하세요.

````
https://github.com/stablyai/orca/releases/latest/download/orca-linux.AppImage
````

그런 다음 실행 가능하게 만들고 한 번 실행하십시오.

````
chmod +x orca-linux.AppImage
./orca-linux.AppImage
````

Codex, Claude Code, OpenCode 또는 기타 터미널 에이전트와 같이 동일한 서버에서 사용하려는 에이전트 CLI를 설치합니다. 에이전트 프로세스는 서버에서 실행되므로 해당 CLI와 자격 증명을 서버에서 사용할 수 있어야 합니다.

`orca` 명령이 `PATH`에 없으면 서버에서 Orca을 한 번 열고 `Settings -> General -> Orca CLI`(설정 → 일반 → Orca 명령줄 도구)에서 번들 CLI를 설치합니다. 일부 Linux 설치에서는 등록된 명령이 `orca-ide`일 수 있습니다. 컴퓨터에 설치된 명령을 사용하십시오.

## 헤드리스 서버 시작

서버 시스템에서 다음을 실행합니다.

````
orca serve --pairing-address <server-ip-or-tailscale-hostname>
````

`orca serve`은 데스크톱 창을 열지 않고 Orca 런타임 서버를 시작합니다. 포그라운드에서 실행되고 런타임 엔드포인트와 페어링 URL을 인쇄하며 `Ctrl-C`을 누르면 중지됩니다.

클라이언트가 서버에 연결하는 데 사용해야 하는 주소에는 `--pairing-address`을 사용하세요. 이는 LAN IP, Tailscale 호스트 이름, SSH 전달 호스트 또는 터널 호스트 이름과 같이 노트북이나 백엔드가 실제로 연결할 수 있는 주소여야 합니다. 클라이언트가 동일한 시스템에서 실행되고 있지 않는 한 `127.0.0.1`를 사용하지 마세요.

고정 포트가 필요한 경우 명시적으로 전달하세요.

````
orca serve --port 6768 --pairing-address devbox.tailnet-name.ts.net
````

클라이언트는 해당 호스트와 포트에 연결할 수 있어야 합니다. 브라우저 클라이언트의 경우 `orca serve`은 웹 클라이언트 번들이 사용 가능한 경우 페어링 데이터가 포함된 브라우저 URL도 인쇄합니다. 모바일 페어링의 경우 `--mobile-pairing`를 추가하세요.

## 모바일과 페어링

클라이언트가 Orca 모바일 앱인 경우 `--mobile-pairing`을 사용하세요. 플래그는 기본 런타임 환경 페어링 링크 대신 모바일 범위 페어링 QR/link을 인쇄합니다.

서버 시스템에서 휴대전화가 연결할 수 있는 주소를 선택하세요. Tailscale IP 또는 호스트 이름은 일반적으로 가장 쉬운 옵션입니다.

````
orca serve --pairing-address 100.64.1.20 --mobile-pairing
````

그런 다음 휴대폰에서 페어링하세요.

1. `orca serve`을 서버에서 계속 실행하세요.
2. Orca 모바일 앱을 열고 `Pair`(페어링)을 선택합니다.
3. 단말기에 표시된 `Mobile pairing QR`(모바일 페어링 QR)을 스캔하거나 인쇄된 페어링 URL을 붙여넣습니다.
4. 모바일이 다시 연결되기를 원할 때마다 동일한 주소와 포트로 서버에 연결할 수 있도록 남겨두세요.

페어링 후 휴대폰을 연결할 수 없는 경우 휴대폰이 현재 네트워크에서 `--pairing-address` 및 포트에 연결할 수 있는지 확인하세요. Tailscale의 경우 전화기는 동일한 tailnet에 연결되어야 하며 모든 ACL에서 허용되어야 합니다.

페어링 URL을 비공개로 유지하세요

페어링 URL은 서버 런타임에 대한 액세스 권한을 부여합니다. 비밀처럼 다루세요. 포트를 공용 인터넷에 직접 노출하는 대신 Tailscale, WireGuard, LAN, SSH 전달 또는 인증된 터널과 같은 개인 네트워킹을 선호합니다.

## 실행 중인 데스크톱 앱을 서버로 공유

서버 시스템에 이미 Orca 앱이 열려 있는 경우 대신 인앱 공유 흐름을 사용하십시오.

1. `Settings -> Remote Orca Servers`(설정 → 원격 Orca 서버)를 엽니다.
2. `Advertise this app as a server`(이 앱을 서버로 광고)에서 `New Link`(새 링크)를 클릭합니다.
3. 생성된 접속링크를 복사하세요.

이는 실행 중인 데스크톱 앱을 서버로 알리기 때문에 별도의 `orca serve` 프로세스가 필요하지 않습니다.

## 노트북에서 연결

클라이언트 컴퓨터에서:

1. `Settings -> Remote Orca Servers`(설정 → 원격 Orca 서버)를 엽니다.
2. `Add Server`(서버 추가)를 클릭합니다.
3. 서버에 이름을 지정합니다.
4. `orca serve`로 출력된 페어링 URL 또는 `New Link`(새 링크)로 생성된 액세스 링크를 붙여넣습니다.
5. `Add Server`(서버 추가)를 클릭한 다음 동일한 창에서 서버에 연결합니다.

페어링 후 Orca은 연결 상태와 함께 `Remote Orca Servers`(원격 Orca 서버)에 서버를 나열합니다. 새 서버 라우팅 프로젝트, 터미널 및 공급자 확인을 해당 원격 서버로 기본값으로 설정하려는 경우에만 `Advanced -> Default runtime`(고급 -> 기본 런타임)을 사용하세요.

## UI에서 세션 시작

연결 후 노트북에서 정상적으로 Orca을 사용하세요. 원격 서버 또는 해당 작업 트리 중 하나를 선택한 다음 UI에서 터미널을 생성하거나 에이전트를 시작합니다.

중요한 부분은 세션이 서버에서 실행된다는 것입니다.

- 터미널 PTY가 서버에 있습니다.
- 에이전트 CLI 프로세스가 서버에 있습니다.
- 작업 트리 파일이 서버에 있습니다.
- 노트북은 해당 상태를 보고 제어하기 위한 UI입니다.

원격 서버로 전환한 다음 해당 서버 컨텍스트에서 프로젝트를 열거나 만듭니다. 이제 서버 시스템은 프로젝트의 터미널, 에이전트 세션, 공급자 확인 및 런타임 상태를 소유합니다. 클라이언트는 클라이언트를 제어하는 ​​데 사용하는 UI입니다.

## 자동화에서 세션 시작

백엔드 또는 웹 앱이 프로그래밍 방식으로 세션을 시작해야 하는 경우 Orca의 원격 CLI/API를 사용하거나 Orca CLI를 로컬로 호출하는 서버에서 소규모 인증 서비스를 실행하세요.

먼저 CLI를 호출할 머신에 서버 페어링을 저장하세요.

````
orca environment add --name server-b --pairing-code '<orca://pair?...>'
````

그런 다음 `--environment`을 사용하여 해당 서버를 타겟팅합니다.

````
orca terminal create \
  --environment server-b \
  --worktree path:/srv/my-app \
  --command "codex"
````

새로운 작업 트리와 에이전트 프롬프트의 경우:

````
orca worktree create \
  --environment server-b \
  --repo id:<repo-id> \
  --name task-123 \
  --agent codex \
  --prompt "Implement this change"
````

`--environment`을 사용하는 경우 명시적인 서버측 선택기를 전달하세요. 좋은 선택기에는 `path:/absolute/path/on/server`, `id:<id>`, `name:<display-name>`, `branch:<branch>` 또는 `issue:<number>`이 포함됩니다. 다른 머신의 `active` 또는 `current`은 서버의 파일 시스템이 아닌 호출자의 로컬 파일 시스템을 참조하므로 사용하지 마세요.

다중 사용자 제품의 경우 일반적으로 가장 안전한 모양은 다음과 같습니다.

````
Web app or backend
  Authenticates the user
  Checks permissions
  Calls an authenticated service on Server B

Server B service
  Validates the request
  Runs orca terminal create or orca worktree create locally
  Returns the created worktree or terminal metadata
````

이는 페어링 URL과 호스트 자격 증명을 모든 호출자에게 전달하는 대신 서버 측에 유지합니다.

## SSH를 대신 사용해야 하는 경우

차이점은 Orca 런타임 및 상태가 어디에 있는지입니다.

[SSH 작업 트리](/orca-docs-ko/docs/ssh/)를 사용하면 노트북의 Orca가 런타임을 소유하고 SSH를 통해 원격 시스템에 연결하여 개별 터미널이나 작업 트리를 실행합니다. 원격 머신은 주로 실행 대상입니다.

원격 Orca 서버를 사용하면 원격 시스템이 자체 Orca 런타임을 실행합니다. 원격 시스템은 작업 트리, 터미널, 탭 및 에이전트 세션을 소유하고 랩톱은 해당 공유 런타임에 연결됩니다.

노트북 Orca만 원격 시스템에서 작업을 시작하고 관리해야 하는 경우 SSH 작업 트리를 사용하세요. 원격 시스템이 랩탑, 브라우저 클라이언트, 모바일 클라이언트 또는 백엔드 자동화가 모두 상호 작용할 수 있는 공유 Orca 관리 세션을 호스팅해야 하는 경우 원격 Orca 서버를 사용하십시오.

백엔드가 서버에 SSH를 통해 `codex`을 직접 실행하는 경우 Orca는 이에 대해 Orca 관리 세션으로 인식할 필요가 없습니다. 백엔드가 서버에 SSH를 연결하고 `orca terminal create`를 실행하는 경우 어쨌든 서버에는 원격 Orca 서버 모델인 Orca 런타임이 필요합니다.

## 문제 해결

### 클라이언트가 연결할 수 없습니다

클라이언트 컴퓨터에서 서버 주소와 포트에 연결할 수 있는지 확인하세요.

````
nc -vz <server-address> 6768
````

사용자 지정 포트를 사용한 경우 대신 해당 포트를 확인하세요. 또한 방화벽, VPN ACL 및 터널 규칙이 연결을 허용하는지 확인하십시오.

### 페어링 주소가 잘못되었습니다

클라이언트가 사용해야 하는 주소로 `orca serve`을 다시 실행하세요.

````
orca serve --port 6768 --pairing-address <reachable-address>
````

Tailscale의 경우 서버의 Tailscale 호스트 이름 또는 Tailscale IP를 사용합니다. SSH 전달의 경우 클라이언트가 연결할 전달된 호스트와 포트를 사용합니다.

### 서버에서 `orca`을 찾을 수 없습니다.

`Settings -> General -> Orca CLI`(설정 → 일반 → Orca 명령줄 도구)에서 번들 CLI를 설치하거나 패키지에 등록된 명령 이름을 사용하세요. 일부 Linux 설치에서는 `orca-ide`일 수 있습니다.

### 서버에서 `codex`, `claude` 또는 다른 에이전트를 찾을 수 없습니다.

서버 시스템에 에이전트 CLI를 설치하고 인증합니다. 원격 에이전트 세션은 노트북이 아닌 서버의 `PATH`, 홈 디렉터리 및 자격 증명을 사용합니다.

### CLI는 `active` 또는 `current`를 대상으로 지정할 수 없습니다.

CLI 명령이 원격 환경을 대상으로 하는 경우 호출자의 현재 디렉터리는 서버의 현재 디렉터리가 아닙니다. `path:/srv/my-app` 또는 `id:<worktree-id>`와 같은 명시적인 서버측 선택기를 사용하세요.

## 다음 단계

- 런타임 명령 예는 [Orca CLI 참조](/orca-docs-ko/docs/cli/reference/)를 읽어보세요.
- 로컬 데스크톱 런타임에 연결된 SSH 작업 트리에는 [SSH 작업 트리](/orca-docs-ko/docs/ssh/)를 사용합니다.
