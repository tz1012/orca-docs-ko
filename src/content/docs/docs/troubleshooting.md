---
title: "문제 해결 및 FAQ"
sourceUrl: https://www.onorca.dev/docs/troubleshooting
checkedAt: "2026-10-06T01:03:33.118Z"
editUrl: false
prev: /orca-docs-ko/docs/telemetry/
next: /orca-docs-ko/docs/github-errors/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

## 에이전트가 시작되지 않습니다

-   Orca 외부의 일반 터미널에서 에이전트 CLI를 실행합니다. 해당 환경에서도 실패하면 CLI 설치와 로그인을 확인합니다. Orca에서만 실패하면 아래 지침을 확인합니다.
-   Orca에서 확인하는 `PATH`에 CLI가 포함되어 있는지 확인합니다([`Settings → Agents`(설정 → 에이전트)](/orca-docs-ko/docs/settings/) 확인).
-   탭의 **`Restart`(재시작)** 칩을 사용해 봅니다.

## Codex에서 `path must be shorter than SUN_LEN` 오류를 보고함

Orca를 v1.4.212 이상으로 업데이트합니다. Codex 0.157 이상에서는 Orca가 관리하는 계정 홈의 백그라운드 데몬 소켓 경로가 너무 길 때 이 오류가 발생할 수 있습니다. 이제 Orca가 영향을 받는 홈을 자동으로 조정하므로 계정을 이동하거나 시스템 `~/.codex/config.toml`을 편집할 필요가 없습니다. [Orca의 Codex](/orca-docs-ko/docs/agents/codex/)을 참조합니다.

## Orca에서 사용할 프로필 사본을 묻는 경우

프로필의 JSON 및 SQLite 사본을 모두 읽을 수 있지만 내용이 다르면 Orca가 각 사본의 마지막 저장 시각을 표시합니다. 유지할 사본에 따라 **`Use SQLite (Recommended)`(SQLite 사용(권장))** 또는 **`Use JSON`(JSON 사용)**을 선택합니다. Orca가 선택 사항을 적용하고 재시작합니다. 먼저 사본을 확인해야 하면 **`Quit`(종료)**를 선택합니다. 다른 프로필 복구 오류에는 별도의 명령 지침이 계속 표시될 수 있습니다.

## Diff 보기가 잘못되었거나 멈춘 것 같습니다.

- diff 도구 모음에서 새로 고침 아이콘을 클릭합니다. Orca은 작업 트리를 다시 읽습니다.
- 외부 `git` 작업(리베이스, 재설정)은 새로 고침 사이에 시작될 수 있습니다.

## 워크트리 생성 실패

- 시작 참조를 가져오지 못할 수 있습니다. 저장소에서 터미널을 열고 `git fetch origin`을 실행하세요.
- 대상 디렉터리에 이미 해당 분기에 대한 작업 트리가 있을 수 있습니다. 이를 삭제하거나 새 분기 이름을 선택하세요.

## Orca CLI에 "명령을 찾을 수 없습니다"라고 표시됩니다.

[`Settings`(설정) → `General`(일반) → `Orca CLI`](/orca-docs-ko/docs/settings/)에서 CLI를 등록합니다. macOS에서는 `~/.local/bin`에 심을 설치하므로 해당 경로가 셸의 `PATH`에 포함되어 있는지 확인합니다. Windows에서는 `orca`가 설치 프로그램이 `PATH`에 추가하는 네이티브 프로그램입니다.

## SSH는 연결되지만 원격 터미널이 실패하는 경우

-   Orca는 처음 연결할 때 호스트에 런타임을 설치합니다. 기본 **`Auto`(자동)** 런타임에서는 Orca의 관리형 Node 또는 호스트의 Node를 사용하므로 일반적으로 컴파일러가 필요하지 않습니다. [SSH 작업 트리 → 호스트의 원격 런타임](/orca-docs-ko/docs/ssh/#remote-runtime-on-the-host)을 참조합니다.
-   호스트에서 실행을 차단하면(예: `noexec` 홈 디렉터리) Orca는 일반 SSH 터미널 및 SFTP 파일 탐색으로 대체하고 이유를 표시합니다. 전체 런타임을 복원하려면 홈 디렉터리의 실행을 허용합니다.
-   레거시 npm 경로만 실행할 수 있는 호스트에서 터미널이 생성되지 않으면 C/C++ 도구 체인(make, g++/clang++, python3)을 설치한 다음 다시 연결합니다.

## SSH 파일은 작동하지만 `Download Folder`(폴더 다운로드)는 작동하지 않는 경우

폴더 다운로드에는 재귀 SFTP 전송이 필요합니다. 시스템 SSH 전용 연결에서는 파일 다운로드만 작동할 수도 있습니다. 대안으로 터미널에서 `tar`/`scp`를 사용합니다.

## `Open in VS Code`(VS Code에서 열기)가 비활성화되었거나 로컬 전용인 경우

-   Remote Orca Server 활성 런타임이 아니라 SSH 작업 트리를 사용합니다.
-   `Open-in`(다음에서 열기) 명령을 Cursor 또는 인수가 여러 개인 셸 명령이 아니라 VS Code/Insiders로 설정합니다.
-   호스트가 제거된 경우 SSH 대상을 새로 고칩니다.

## Kerberos 로그인이 실패하는 경우

-   `klist`에 호스트 영역의 유효한 티켓이 표시되는지 확인합니다.
-   OpenSSH 구성에서 해당 호스트의 `GSSAPIAuthentication yes`를 확인한 다음 `Settings`(설정) → `SSH`에서 대상을 다시 가져오거나 다시 테스트합니다.

## 브라우저에 `browser_no_tab`이라고 표시됩니다.

현재 작업 트리에 열려 있는 탭이 없습니다. `orca tab create --url ...`로 열거나 수동으로 브라우저 창을 열고 탐색하세요.

## 성능 및 메모리

- 적극적으로 사용하지 않는 작업 트리를 닫습니다. 각 작업 트리는 파일 감시자를 활성 상태로 유지합니다.
- 많은 브라우저 탭이 있는 분할 레이아웃은 RAM을 가장 많이 사용하므로 필요하지 않은 브라우저를 닫습니다.

## GitHub PR 패널, 검사 및 Tasks 오류

속도 제한, 잘못된 `gh` 인증, 누락된 범위 및 저장소 접근 문제는 모두 `Source Control`(소스 제어)과 `PR Checks`(PR 검사) 패널에 표시됩니다. 전체 오류 분류표와 설정의 **`GitHub API Budget`(GitHub API 예산)** 수치가 정상인데도 REST가 차단될 수 있는 이유는 **[GitHub 오류 문제 해결](/orca-docs-ko/docs/github-errors/)**을 참조합니다.

빠른 확인:

```
gh auth status -h github.com
gh api user
gh api rate_limit --jq '.resources.core'
```

## 로그

`Help → Open Logs`(도움말 → 로그 열기)는 Orca의 로그가 있는 디렉터리를 엽니다. 버그를 신고할 때 이를 첨부하세요.

## 문제 보고

-   앱 내 **`Help → Send Feedback`(도움말 → 피드백 보내기)** — 대화 상자에 스크린샷을 붙여 넣거나 끌어다 놓고, 이미지 파일을 선택할 수도 있습니다. 제출하기 전에 썸네일이 표시됩니다. 버그를 재현하기 어려우면 [로그](/orca-docs-ko/docs/troubleshooting/#logs)를 첨부합니다.
-   [GitHub Issues](https://github.com/stablyai/orca/issues) — 버그 및 기능 요청을 등록합니다.
-   [Discord](https://discord.gg/fzjDKHxv8Q) — 실시간 도움을 받습니다.
