---
title: "Orca이란 무엇입니까?"
sourceUrl: https://www.onorca.dev/docs
checkedAt: "2026-08-04T03:02:33.909Z"
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

- 세 명의 에이전트가 같은 버그를 병렬로 해결하게 한 뒤 가장 좋은 결과를 선택하려고 합니다.
- AI가 생성한 diff를 배포하기 전에 꼼꼼하게 검토하려고 합니다.
- 이미 Claude Code, Codex 또는 Cursor CLI을 구독하고 있으며, 이를 한곳에서 오케스트레이션하려고 합니다.
- IDE를 포기하지 않으면서 SSH, 자체 호스팅 Orca 서버 또는 주문형 VM에서 에이전트를 원격으로 실행하려고 합니다.

## 누구를 위한 것인가

Orca은 이미 생활용 코드를 작성하고 AI를 대체 수단이 아닌 활용 수단으로 사용하려는 사람들을 위해 설계되었습니다. 이는 사용자가 diff를 읽고, 커밋에 관심을 갖고, 작업 트리를 깔끔하게 유지한다고 가정합니다. 코드 없는 도구를 찾고 있다면 Orca는 그렇지 않습니다.

## Orca이 아닌 것

-   **모델이 아닙니다.** Orca은 이미 사용 중인 에이전트를 실행합니다. Claude, Codex 또는 OpenCode 구독은 사용자가 준비합니다.
-   **git을 대체하지 않습니다.** 모든 작업 트리는 실제 git 작업 트리입니다. 언제든 해당 디렉터리로 `cd`한 뒤 일반 git을 사용할 수 있습니다.
-   **호스팅형 VPS 제품이 아닙니다.** Orca은 기본적으로 데스크톱에서 실행됩니다. 원격 컴퓨팅에는 사용자가 제어하는 시스템과 클라우드 계정, 즉 [SSH 대상](/orca-docs-ko/docs/ssh/), [자체 호스팅 Orca 서버](/orca-docs-ko/docs/remote-servers/) 또는 [Cloud VM / 작업 공간별 환경](/orca-docs-ko/docs/ways-to-run/#4-cloud-vms-per-workspace-environments)을 사용합니다.

다음 단계

[설치](/orca-docs-ko/docs/install/)로 이동한 다음, 이 문서에서 가장 중요한 단일 페이지인 [첫 3개 에이전트 세션](/orca-docs-ko/docs/first-session/)을 따라 합니다. 노트북 밖에서 에이전트를 실행할 준비가 되면 [Orca 실행 방식](/orca-docs-ko/docs/ways-to-run/)부터 살펴봅니다.
