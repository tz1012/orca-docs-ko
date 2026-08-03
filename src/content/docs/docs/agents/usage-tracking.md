---
title: "사용량 및 속도 제한 추적"
sourceUrl: https://www.onorca.dev/docs/agents/usage-tracking
checkedAt: "2026-08-03T07:35:41.401Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/hibernation/
next: /orca-docs-ko/docs/agents/hooks-memory/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca은 Claude Code, Codex, Gemini, OpenCode, Kimi 코드 및 MiniMax에 대한 로컬 사용 상태를 읽고 이를 상태 표시줄에 표시하므로 에이전트가 정지되기 전에 속도 제한에 얼마나 근접했는지 알 수 있습니다.

## 표시되는 내용

- 활성 계정의 계획에 대한 현재 사용량입니다.
- 5시간, 매일, 매주 및 Claude Fable 주간 창(해당되는 경우)에 대한 재설정 시간입니다.
- 한도의 80%를 넘으면 경고 칩이 표시됩니다.

## 작동 방식

Orca은 각 에이전트가 디스크(`~/.claude`, `~/.codex` 및 Gemini/OpenCode에 해당하는 항목)에서 유지 관리하는 로컬 사용 상태를 읽습니다. API 호출이나 추가 인증이 없습니다. 이는 판독값이 상담원 자신의 장부만큼만 최신임을 의미합니다. 숫자는 실시간이 아니라 상담원이 쓸 때 업데이트됩니다.

## 다중 계정 회계

상태 표시줄에는 항상 *활성* 계정이 반영됩니다. 구성된 다른 계정은 고유한 사용법과 함께 계정 전환기에 표시됩니다.

## 사용량 목록

상태 표시줄의 사용량 세그먼트를 클릭하여 **`Usage`(사용량)** 팝오버를 엽니다. 추적되는 모든 공급자가 아이콘·이름·요금제·가장 빠른 재설정 시각·기간별 막대와 함께 표시되며, 한도가 가장 촉박한 항목이 먼저 오도록 정렬됩니다. 헤더의 새로 고침 컨트롤을 사용하면 로컬 사용량 상태를 다시 읽습니다.

-   **`Detailed`(자세히)** — 모든 기간의 전체 막대, 레이블 및 백분율을 표시합니다.
-   **`Compact`(간단히)** — 공급자별로 가장 촉박한 기간만 표시합니다.

[`Settings`(설정) → `Appearance`(모양)](/orca-docs-ko/docs/settings/)에서 숫자를 표시할 방법으로 **`% used`(사용한 비율)** 또는 **`% remaining`(남은 비율)**을 선택합니다.

실시간 수치가 없는 행에는 **`Loading usage…`(사용량 불러오는 중)**, **`not signed in`(로그인하지 않음)**, **`Usage unavailable`(사용량 확인 불가)**, **`No usage data`(사용량 데이터 없음)** 또는 공급자별 오류와 같은 짧은 상태가 대신 표시됩니다. Claude 및 Codex 행에서는 계정 전환 화면으로 이동할 수 있으며, **`Manage accounts`(계정 관리)**를 선택하면 `Settings`(설정)가 열립니다.

### 모바일

컴패니언 앱에서 호스트의 **`Accounts`(계정)** 화면을 열면 동일한 switcher/usage 사용량을 확인할 수 있습니다. Codex에 **사용 한도 재설정** 크레딧이 적립되어 있으면 이 화면에서 하나를 사용합니다([모바일 컴패니언](/orca-docs-ko/docs/mobile/) 참조).

## 예상 비용(통계)

통계 상세 내역에는 알려진 모델 제품군(Claude 5 계열 및 Codex GPT-5.6 행 포함)의 **예상 비용**이 표시될 수 있습니다. **`• inferred pricing`(추론된 가격)**으로 표시된 행은 공급자의 실시간 청구 금액이 아니라 Orca의 로컬 가격표를 사용합니다. 정확한 지출액은 공급자 콘솔에서 확인하는 것이 좋습니다.
