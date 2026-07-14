---
title: "파일 탐색기 및 외부 드래그-드롭"
sourceUrl: https://www.onorca.dev/docs/editing/file-explorer
checkedAt: "2026-07-14T04:54:05.418Z"
editUrl: false
prev: /orca-docs-ko/docs/editing/viewers/
next: /orca-docs-ko/docs/browser/overview/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

파일 탐색기는 각 작업 트리의 왼쪽에 있습니다. 디스크에 있는 파일을 실시간으로 추적합니다. 모든 맵을 파일 시스템 작업으로 생성, 이름 변경, 삭제 및 이동하므로 외부 변경 사항(예: 에이전트의 변경 사항)이 즉시 표시됩니다.

## 외부 드래그-드롭

- Finder/Explorer의 파일을 파일 트리에 끌어서 복사하세요.
- 이미지를 마크다운 편집기에 놓아 커서에 삽입합니다.
- 프롬프트에 경로를 붙여넣으려면 에이전트 터미널에 파일을 놓습니다.
- [SSH 작업 트리](/orca-docs-ko/docs/ssh/)의 경우 드래그 앤 드롭도 작동합니다. Orca은 드롭을 완료하기 전에 파일을 원격 호스트에 업로드하므로 에이전트는 파일을 실제 디스크상의 경로로 봅니다.

## Git 상태

파일은 git 상태(추적되지 않음, 수정됨, 준비됨, 무시됨)에 따라 색상이 지정됩니다. 일반적인 작업(폐기, 스테이지, 이름 바꾸기)을 마우스 오른쪽 버튼으로 클릭합니다.

단일 파일을 마우스 오른쪽 버튼으로 클릭하고 `Copy`(복사)를 선택하여 파일 자체를 OS 클립보드에 배치합니다. SSH 작업 트리의 경우 Orca은 먼저 원격 파일을 로컬로 준비한 다음 해당 준비된 파일 참조를 클립보드에 씁니다. 원격 폴더는 제외됩니다.

## 폴더 검색

폴더를 마우스 오른쪽 버튼으로 클릭하고 `Find in Folder`(폴더에서 찾기)를 선택하면 해당 폴더의 범위가 이미 지정된 검색이 열립니다. 파일 탐색기에서 폴더를 선택하고 macOS에서는 `Cmd-Shift-F`을, Windows 및 Linux에서는 `Ctrl-Shift-F`를 누를 수도 있습니다.

## 다음 단계

- [모나코 편집기 및 자동 저장](/orca-docs-ko/docs/editing/monaco/) — 필요한 일치 항목을 찾은 후 파일을 편집하세요.
- [Diff 뷰어](/orca-docs-ko/docs/review/diff-viewer/) - 에이전트나 편집자가 변경한 내용을 검토하세요.
