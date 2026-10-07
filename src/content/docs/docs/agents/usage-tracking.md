---
title: "사용량 및 속도 제한 추적"
sourceUrl: https://www.onorca.dev/docs/agents/usage-tracking
checkedAt: "2026-10-07T03:54:46.558Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/hibernation/
next: /orca-docs-ko/docs/agents/hooks-memory/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca는 Claude Code, Codex, Muse Code, Gemini, Antigravity, OpenCode, Kimi Code, MiniMax, Cursor, ZCode 및 GLM Coding Plan의 사용량을 추적해 상태 표시줄에 표시합니다. 따라서 에이전트가 멈추기 전에 속도 제한에 얼마나 가까운지 알 수 있습니다.

## 표시되는 내용

- 활성 계정의 계획에 대한 현재 사용량입니다.
- 5시간, 매일, 매주 및 Claude Fable 주간 창(해당되는 경우)에 대한 재설정 시간입니다.
- 한도의 80%를 넘으면 경고 칩이 표시됩니다.

## 작동 방식

데이터 원본은 제공자에 따라 다릅니다. Orca는 사용 가능한 경우 Muse Code의 로컬 세션 로그를 포함한 로컬 에이전트 상태를 읽습니다. Muse 사용량은 로컬 토큰 계산값이며 예상 가격은 포함하지 않습니다. OpenCode Go 사용량은 콘솔 API에서 가져오며 **`Settings → Accounts`(설정 → 계정)**에 `__Host-console_session`를 포함한 전체 `opencode.ai` Cookie 헤더가 필요합니다. `auth` 쿠키만으로는 워크스페이스를 찾을 수 있지만 Go 사용량은 가져올 수 없습니다. 다른 제공자는 설정에서 각자 별도의 계정 구성이 필요할 수 있습니다.

Cursor의 경우 Orca는 컴퓨터의 기존 Cursor 로그인을 읽고 상태 표시줄, `Usage`(사용량) 팝오버 및 **`Settings → Accounts → Cursor`(설정 → 계정 → Cursor)**에 요금제의 월간 사용량을 표시합니다. 로그인 작업을 대신 수행하지 않으므로 저장된 세션이 만료되면 `cursor-agent login`을 실행합니다. 사용량 요청이 거부되면 만료된 로그인이 아니라 사용량 조회 실패로 표시됩니다.

Antigravity의 경우 Orca는 모델 그룹 풀을 포함한 할당량을 Antigravity의 자체 CLI에서 읽습니다. 따라서 로그인된 Gemini CLI가 없어도 되며 확인할 때 할당량을 소비하지 않습니다. ZCode의 경우 **`Coding Plan`(코딩 요금제)** 할당량이 디스크의 대화 기록에서 읽은 세션 기록과 함께 표시됩니다.

**`Settings → Accounts → GLM Coding Plan`(설정 → 계정 → GLM 코딩 요금제)**에서 GLM Coding Plan을 직접 연결할 수도 있습니다. 요금제 사이트(Z.AI 또는 Zhipu BigModel)를 선택하고 요금제 API 키를 저장합니다. ZCode CLI 로그인이 필요하지 않으며, 저장된 키가 ZCode CLI 로그인보다 우선합니다. 이 요금제는 다른 제공자와 마찬가지로 사용량 목록에 표시됩니다.

## 다중 계정 회계

상태 표시줄에는 항상 *활성* 계정이 반영됩니다. 구성된 다른 계정은 고유한 사용법과 함께 계정 전환기에 표시됩니다.

## 사용량 목록

상태 표시줄의 사용량 세그먼트를 클릭하여 **`Usage`(사용량)** 팝오버를 엽니다. 추적되는 모든 공급자가 아이콘·이름·요금제·가장 빠른 재설정 시각·기간별 막대와 함께 표시되며, 한도가 가장 촉박한 항목이 먼저 오도록 정렬됩니다. 헤더의 새로 고침 컨트롤을 사용하면 로컬 사용량 상태를 다시 읽습니다.

창 너비가 좁으면 상태 표시줄은 미니 막대와 레이블을 숨기고 제공자별 백분율 하나만 표시해 한 줄을 유지합니다. 공간이 여전히 부족하면 일부 제공자 칩이 **+N** 칩으로 바뀝니다. 이를 클릭하면 `Usage`(사용량) 팝오버에서 모든 제공자를 볼 수 있습니다. 사용량이 80% 이상인 제공자는 가장 마지막에 접힙니다.

-   **`Detailed`(자세히)** — 모든 기간의 전체 막대, 레이블 및 백분율을 표시합니다.
-   **`Compact`(간단히)** — 공급자별로 가장 촉박한 기간만 표시합니다.

[`Settings → Appearance`(설정 → 모양)](/orca-docs-ko/docs/settings/)에서 숫자 표시 방식을 **`% used`(사용한 비율)** 또는 **`% remaining`(남은 비율)** 중에서 선택합니다.

실시간 수치가 없는 행에는 대신 **`Loading usage…`(사용량 불러오는 중…)**, **`not signed in`(로그인되지 않음)**, **`Usage unavailable`(사용량 확인 불가)**, **`No usage data`(사용량 데이터 없음)** 또는 제공자별 오류 같은 짧은 상태가 표시됩니다. Claude 및 Codex 행에서는 계정 전환 화면으로 들어갈 수 있으며, **`Manage accounts`(계정 관리)**를 선택하면 설정이 열립니다.

### 모바일

컴패니언 앱에서 호스트의 **`Accounts`(계정)** 화면을 열면 동일한 switcher/usage 사용량을 확인할 수 있습니다. Codex에 **사용 한도 재설정** 크레딧이 적립되어 있으면 이 화면에서 하나를 사용합니다([모바일 컴패니언](/orca-docs-ko/docs/mobile/) 참조).

## 예상 비용(통계)

`Stats`(통계) 세부 내역에는 Claude Opus 5.5, Fable 5.1과 Codex GPT-5.6, GPT-6 Astra, Sol, Luna 등 알려진 모델 계열의 **`estimated cost`(예상 비용)**가 표시될 수 있습니다. Orca는 제공자의 실시간 청구서가 아니라 로컬 가격표를 사용합니다. **`• inferred pricing`(• 추론된 가격)**은 Orca가 모델을 추론한 경우의 추정치를 나타냅니다. **`• excludes unpriced models`(• 가격이 없는 모델 제외)**로 표시된 Codex 비용은 해당 모델을 추정치에서 제외하며, `Overview`(개요)에도 부분 합계라는 표시가 나타납니다. 정확한 지출액은 제공자 콘솔에서 확인하는 것이 좋습니다.
