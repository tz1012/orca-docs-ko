---
title: "설치"
sourceUrl: https://www.onorca.dev/docs/install
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: /orca-docs-ko/docs/
next: /orca-docs-ko/docs/first-session/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

macOS, Windows 또는 Linux용 Orca을 다운로드하고 RC 빌드를 선택하세요.

## 다운로드

Orca은 데스크톱 앱입니다. macOS, Windows 또는 Linux에서 열 수 있는 링크를 자신에게 이메일로 보내세요.

- **macOS:** [Apple Silicon](https://github.com/stablyai/orca/releases/latest/download/orca-macos-arm64.dmg) · [Intel](https://github.com/stablyai/orca/releases/latest/download/orca-macos-x64.dmg)

- **Windows:** [설치 프로그램](https://github.com/stablyai/orca/releases/latest/download/orca-windows-setup.exe)

- **Linux:** [앱 이미지](https://github.com/stablyai/orca/releases/latest/download/orca-linux.AppImage) · [.deb](https://github.com/stablyai/orca/releases)

- 이전 버전: [GitHub 릴리스](https://github.com/stablyai/orca/releases).

### 홈브루(macOS)

Orca은 또한 Homebrew 캐스크로 게시되어 모든 안정 릴리스에서 자동 범프됩니다.

````
brew install --cask stablyai/orca/orca
````

`brew upgrade --cask orca`은 새로운 안정적인 빌드를 선택합니다. 캐스크는 안정적인 채널을 추적합니다. RC 빌드의 경우 위의 GitHub 릴리스 링크를 사용하거나 [업데이트](/orca-docs-ko/docs/install/#updates)에 설명된 인앱 `Check for Updates`(업데이트 확인) 흐름을 사용하세요.

## 첫 출시

처음 실행 시 Orca은 다음을 수행합니다.

- 저장소를 추가할 수 있도록 홈 디렉토리에 대한 액세스를 요청하세요.
- `~/.claude`, `~/.codex` 및 Ghostty 터미널 설정(있는 경우)을 가져오도록 제안합니다.
- 첫 번째 저장소를 추가하는 빈 랜딩 화면으로 이동하세요.

## 업데이트

Orca은 기본적으로 자동 업데이트되어 **stable** 채널을 추적합니다. 안정적인 릴리스는 심사를 거칩니다. `RC (release candidate)`(RC(출시 후보)) 빌드는 새로운 기능을 먼저 출시하며 대개 매일 출시됩니다.

RC 채널에는 앱 내 선택 기능이 없습니다. RC 빌드를 가져오려면 다음 중 하나를 수행하세요.

- Shift 키를 누른 채 `Check for Updates`(업데이트 확인)([설정 → 일반 → 업데이트](/orca-docs-ko/docs/settings/) 또는 앱/도움말 메뉴)을 클릭하세요. 해당 단일 확인에는 시험판이 포함됩니다.
- 또는 [GitHub 릴리스 페이지](https://github.com/stablyai/orca/releases)에서 직접 빌드를 다운로드하세요.

현재 업데이트가 마음에 들지 않음

이전 버전은 [GitHub 릴리스 페이지](https://github.com/stablyai/orca/releases)에서 항상 사용할 수 있습니다. Orca는 되돌아가도 작업 트리 데이터를 강제로 다운그레이드하지 않습니다.

## 플랫폼 노트

### 맥OS

서명하고 공증받았습니다. 처음 실행 시 macOS에서 확인 메시지가 계속 표시될 수 있습니다. 이는 Electron 기반 앱의 경우 일반적인 현상입니다.

### 윈도우

기본 셸은 [설정 → 터미널](/orca-docs-ko/docs/settings/)에서 PowerShell 또는 CMD로 설정할 수 있습니다. 대부분의 사용자는 PowerShell을 원합니다.

### 리눅스

AppImage 및 '.deb' 빌드를 사용할 수 있습니다. 자세한 내용은 릴리스 페이지를 참조하세요.
