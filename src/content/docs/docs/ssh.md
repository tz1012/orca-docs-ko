---
title: "SSH 작업 트리"
sourceUrl: https://www.onorca.dev/docs/ssh
checkedAt: "2026-08-03T07:35:41.401Z"
editUrl: false
prev: /orca-docs-ko/docs/ways-to-run/
next: /orca-docs-ko/docs/remote-servers/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca은 SSH를 통해 원격 시스템에서 에이전트를 구동할 수 있습니다. 이는 장기 실행 빌드, GPU 상자 또는 노트북이 작업을 실행하기에 적합하지 않은 모든 환경에 유용합니다.

네 가지 실행 모드 중 하나

SSH는 원격 컴퓨팅 환경에서 에이전트를 실행하는 한 가지 방법입니다. 로컬, 자체 호스팅 서버 및 임시 VM 방식은 [Orca 실행 방식](/orca-docs-ko/docs/ways-to-run/)을 참조합니다.

![SSH 원격 작업공간 — 에이전트는 원격 호스트에서 실행되고 편집기 및 차이점은 로컬로 유지됩니다.](/orca-docs-ko/assets/mirror/7927caeb8acdb148029bd23edc29d2f97400d39ef3df292650577242909158f3.jpg)

SSH 원격 작업 공간 — 에이전트는 원격 호스트에서 실행되고 편집기와 차이점은 로컬로 유지됩니다.

## SSH 대상 추가

1. [설정 → SSH](/orca-docs-ko/docs/settings/)를 엽니다.
2. 대상(호스트, 사용자, 포트, 선택적 ID 파일)을 추가합니다. Orca는 또한 `Include` 지시문에서 참조하는 파일을 포함하여 OpenSSH 구성 파일에서 호스트를 가져옵니다.
3. 키가 암호로 보호된 경우 Orca가 처음으로 메시지를 표시합니다.
4. `Test`(테스트)를 클릭하여 연결을 확인합니다.

## 타겟을 사용하세요

작업 트리를 생성할 때 로컬 대신 SSH 대상을 선택합니다. Orca은 다음을 수행합니다.

- 원격 호스트에 git 작업 트리를 만듭니다.
- SSH 연결을 통해 원격으로 에이전트를 실행합니다.
- 편집기, 차이점 및 브라우저가 여전히 로컬처럼 느껴지도록 파일 이벤트를 동기화합니다.

## 고급 연결 옵션

`Settings → SSH`(설정 → SSH)를 열고, 대상을 편집하고, 호스트에 프록시, 점프 호스트 또는 SSH 멀티플렉싱 재정의가 필요한 경우 `Advanced Connection`(고급 연결)을 확장합니다. Orca은 기본적으로 `Reuse SSH connection for faster setup`(더 빠른 설정을 위해 SSH 연결 재사용)을 활성화합니다. 이는 macOS 및 Linux에서 OpenSSH 연결 재사용을 사용하므로 설정 명령이 각각 새로운 SSH 핸드셰이크를 지불하지 않습니다. SSH 정책이 멀티플렉싱 세션을 거부하는 호스트에 대해서만 이 기능을 끄십시오.

## 암호

암호는 Orca 세션이 지속되는 동안 메모리에 보관됩니다. Orca를 닫으면 해당 내용이 지워집니다. SSH 설정에서 더 긴 TTL을 선택할 수 있습니다.

## 상태

원격 작업 트리에는 실시간 SSH 상태(녹색 연결됨, 노란색 재연결 중, 빨간색 연결 끊김)가 포함된 칩이 표시됩니다. 연결 끊김은 실행 중인 에이전트를 종료하지 않습니다. Orca은 다시 연결하고 다시 연결합니다. 에이전트 상태(작업 중/유휴/차단됨)는 로컬에서와 동일한 방식으로 SSH를 통해 전파되므로 사이드바 및 [에이전트 피드](/orca-docs-ko/docs/activity/)에 원격 에이전트가 실시간으로 반영됩니다.

## 앱 종료 시 세션

데스크톱 앱을 닫아도 더 이상 원격 PTY 세션이 종료되지 않습니다. 원격 터미널 세션은 원격 호스트에서 실행되는 릴레이를 통해 임대되므로 랩톱에서 Orca을 종료해도 유지됩니다. 앱을 다시 열고 대상에 다시 연결하면 임대된 PTY가 스크롤백이 그대로 유지된 상태로 `attached`(연결됨) 상태로 해당 탭에 복원됩니다. 짧은 유예 기간(기본적으로 5분, 대상별로 구성 가능)은 분리된 세션을 해제하기 전에 빠른 재연결을 완료할 수 있는 릴레이 시간을 제공합니다.

## 원격 파일 및 폴더 다운로드

SSH 작업 트리 파일 탐색기에서 마우스 오른쪽 버튼을 클릭합니다.

-   **`File`(파일)** → **`Download`(다운로드)** — 네이티브 저장 대화 상자를 열고 파일을 노트북에 복사합니다.
-   **`Folder`(폴더)** → **`Download Folder`(폴더 다운로드)** — 선택한 폴더에 재귀적으로 다운로드합니다(데스크톱만 해당).

Orca는 연결과 동일한 SSH 전송 경로를 사용합니다. 폴더 다운로드는 연결에서 재귀 폴더 전송(일반적으로 전체 SFTP)을 지원한다고 알릴 때만 표시됩니다. 시스템 OpenSSH 전용 전송을 유지하는 연결은 **파일**을 다운로드할 수 있어도 **`Download Folder`(폴더 다운로드)**가 표시되지 않을 수 있습니다.

이 작업은 데스크톱 전용입니다. Electron의 저장 대화 상자를 사용하므로 웹 클라이언트에는 `Download`(다운로드)가 제공되지 않습니다.

## VS Code에서 원격 작업 공간 열기

SSH 작업 트리에서 구성한 앱이 VS Code 또는 VS Code Insiders(`code` / `code-insiders` 또는 해당 실행기의 직접 경로)이면 작업 트리 메뉴의 **`Open in`(다음에서 열기)** 목록에서 원격 경로를 VS Code Remote-SSH에 전달할 수 있습니다.

1.  **`Settings`(설정) → `General`(일반) → `Open in menu`(다음에서 열기 메뉴)**를 구성하여 VS Code가 목록에 표시되게 합니다(사전 설정 또는 사용자 지정 명령).
2.  SSH 작업 트리를 마우스 오른쪽 버튼으로 클릭하거나 작업 트리 더보기 메뉴를 사용하여 **`Open in`(다음에서 열기) → `VS Code`**를 선택합니다.
3.  Orca가 해당 호스트와 작업 트리 경로(`--remote ssh-remote+<host> <path>`)에 대해 Remote-SSH를 사용하여 VS Code를 실행합니다. 메뉴 항목에 **`Remote SSH`** 배지가 표시될 수 있습니다.

**이 원격 경로에서는 지원되지 않음:** Cursor, Zed, 복합 셸 명령 또는 **Remote Orca Server** 활성 런타임을 통한 열기는 지원되지 않으며 **`Local only`(로컬 전용)**로 유지됩니다. Finder/Explorer 항목은 로컬 경로에만 사용합니다.

## Kerberos/GSSAPI

OpenSSH 구성의 호스트에 `GSSAPIAuthentication yes`가 설정되어 있으면 Orca는 해당 대상에 **시스템 OpenSSH** 전송을 우선 사용합니다(내장 ssh2 클라이언트는 GSSAPI를 지원하지 않음). 연결하기 전에 유효한 Kerberos 티켓(`kinit` / 조직의 SSO)을 유지합니다. 수동 대상도 시스템 SSH를 사용하도록 구성하면 GSSAPI를 활성화할 수 있습니다.

구성에서 가져온 호스트에 별도의 `Kerberos mode`(Kerberos 모드) 스위치를 켤 필요는 없습니다. 가져오기/`ssh -G`가 플래그를 전달합니다.

## FIDO2 / 보안 키

하드웨어 기반 OpenSSH ID(`ed25519-sk`, `ecdsa-sk`, 에이전트 기반 보안 키 포함)도 내장 ssh2 클라이언트 대신 **시스템 OpenSSH**를 사용합니다. Orca은 ID 파일에서 키 유형을 감지하고 연결을 OS OpenSSH 바이너리에 넘기므로 터치/PIN 프롬프트가 평소처럼 작동합니다. 일반 Ed25519, ECDSA 및 RSA 키는 내장 전송 방식을 계속 사용합니다. 시스템에서 OpenSSH를 사용할 수 없으면 이를 설치해 `PATH`에 추가하거나 일반적인 Windows/macOS/Linux 위치에 배치할 때까지 해당 FIDO2 대상에서 인증할 수 없습니다.

## C/C++ 도구 체인이 없는 Linux 호스트

처음 연결할 때 Orca는 원격에 작은 릴레이를 설치합니다. 원격 터미널에는 네이티브 `node-pty` 모듈이 필요합니다. Linux 패키지는 호스트에서 컴파일되는 경우가 많고, macOS/Windows 릴레이는 미리 빌드된 바이너리를 사용합니다.

원격에 **make**, **C++ 컴파일러**, **python3**가 없더라도 Orca는 **파일, Git 및 편집기** 연결을 완료하지만, 빌드 도구를 설치할 때까지 **원격 터미널은 작동하지 않습니다**. Orca에 다음과 같은 설치 안내가 표시될 수 있습니다.

-   Debian/Ubuntu 설치: `sudo apt-get install -y build-essential python3`
-   Fedora/RHEL 설치: `sudo dnf install -y make gcc gcc-c++ python3`
-   Alpine 설치: `sudo apk add build-base python3`
-   Arch 설치: `sudo pacman -S --needed base-devel python`

도구를 설치한 다음 릴레이가 네이티브 모듈을 설치할 수 있도록 다시 연결합니다.

## 포트 포워딩

원격 작업 트리의 경우 오른쪽 사이드바에 `Ports`(포트) 탭이 표시됩니다(`Cmd+Shift+I`로 전환). Orca는 원격에서 `/proc/net/tcp`을 검색하고 `Detected`(감지됨) 아래에 수신 대기 포트를 나열합니다. 한 번의 클릭으로 해당 포트를 노트북으로 전달합니다. 수동으로 전달을 추가하거나 편집하거나 제거할 수도 있습니다. 전달은 앱을 다시 시작하고 SSH를 다시 ​​연결해도 지속되며 권한 있는 원격 포트는 로컬에서 자동으로 다시 매핑됩니다(예: 원격 80 → 로컬 10080).
