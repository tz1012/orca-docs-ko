---
title: "Orca이란 무엇입니까?"
sourceUrl: https://www.onorca.dev/docs
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: false
next: /orca-docs-ko/docs/install/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

60초 피치: Orca이 누구를 위한 것인지, 언제 도달해야 하는지.

Orca은 여러 AI 코딩 에이전트를 나란히 실행하기 위한 데스크톱 IDE입니다. 모든 작업에는 자체 git 작업 트리, 자체 에이전트 터미널 및 자체 브라우저 탭이 있으므로 숨김, 분기 저글링 또는 흐름 손실 없이 Claude Code, Codex, Cursor CLI 및 친구들 간에 작업을 팬아웃할 수 있습니다.

![Orca 기본 창: 작업 트리의 사이드바, 에이전트 터미널이 있는 분할 창 및 차이점 보기](/orca-docs-ko/assets/mirror/c177fb4f4f6361af771e73e0910c26941167d76b2de3b6afe62e0b472136b3d3.jpg)

Orca 기본 창: 작업 트리의 사이드바, 에이전트 터미널이 있는 분할 창 및 차이점 보기

## Orca을 사용해야 하는 경우

- 세 명의 에이전트가 동일한 버그를 동시에 시도하고 승자를 선택하기를 원합니다.
- AI가 생성한 차이점을 배송하기 전에 진지하게 검토하고 싶습니다.
- Claude Code, Codex 또는 Cursor CLI에 대해 이미 비용을 지불했으며 이를 한 곳에서 관리하기를 원합니다.
- IDE를 포기하지 않고 SSH를 통해 에이전트가 원격으로 실행되기를 원합니다.

## 누구를 위한 것인가

Orca은 이미 생활용 코드를 작성하고 AI를 대체 수단이 아닌 활용 수단으로 사용하려는 사람들을 위해 설계되었습니다. 이는 사용자가 diff를 읽고, 커밋에 관심을 갖고, 작업 트리를 깔끔하게 유지한다고 가정합니다. 코드 없는 도구를 찾고 있다면 Orca는 그렇지 않습니다.

## Orca이 아닌 것

- **모델이 아닙니다.** Orca은 이미 사용 중인 에이전트를 실행합니다. 자체 Claude, Codex 또는 OpenCode 구독을 가져오세요.
- **git 대체가 아닙니다.** 모든 작업 트리는 실제 git 작업 트리입니다. 원할 때마다 'cd'를 사용하여 일반 git을 사용할 수 있습니다.
- **클라우드 전용이 아닙니다.** Orca는 로컬에서 실행됩니다. 원격 에이전트는 SSH를 통해 귀하가 소유한 컴퓨터로 이동합니다.

다음 단계

[설치](/orca-docs-ko/docs/install/)로 이동한 다음 이 문서에서 가장 중요한 단일 페이지인 [첫 번째 3개 에이전트 세션](/orca-docs-ko/docs/first-session/)을 살펴보세요.
