---
title: "SSH를 통해 원격 컴퓨터에서 작업"
sourceUrl: https://www.onorca.dev/docs/recipes/remote-worktrees
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: /orca-docs-ko/docs/recipes/design-mode-fix/
next: /orca-docs-ko/docs/settings/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

더 강력한 개발 상자, GPU 호스트, 클라우드 샌드박스 등 SSH 대상에 Orca을 지정하면 로컬 작업 트리처럼 느껴집니다. 동일한 편집기, 동일한 차이점 보기, 동일한 에이전트, 다른 컴퓨팅. 원격 저장소 *또는* 임의의 폴더만 열 수 있습니다.

## 설정

1. [설정 → SSH](/orca-docs-ko/docs/settings/)에서 호스트를 추가합니다.
2. 연결을 테스트합니다. 저장소로 작업하는 경우 호스트에 git이 설치되어 있는지 확인하세요.
3. SSH 대상을 해당 위치로 선택하여 Orca에 저장소를 추가하거나 파일 선택기에서 직접 원격 폴더를 엽니다.

## 실행

1. 작업 트리를 생성합니다. Orca은 원격에서 'git worktree add'를 실행합니다.
2. 에이전트를 시작합니다. 이는 노트북이 아닌 원격 호스트에서 실행됩니다.
3. 파일 인라인 편집 — Orca 스트림은 원격 파일 시스템에 저장됩니다.
4. 평소처럼 노트북에서 차이점을 검토하고 커밋하고 푸시합니다.

## 연결 해제

노트북이 절전 모드로 전환되고 Wi-Fi가 끊깁니다. 에이전트는 계속 원격으로 실행됩니다. Orca은 터미널을 다시 연결하고 다시 연결합니다. 아무것도 잃지 않았습니다.
