---
title: "지원되는 에이전트"
sourceUrl: https://www.onorca.dev/docs/agents/supported
checkedAt: "2026-07-13T08:43:49.755Z"
editUrl: false
prev: /orca-docs-ko/docs/model/quick-open/
next: /orca-docs-ko/docs/agents/claude-code/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

모든 에이전트 Orca은 기본적으로 제공되며 직접 추가하는 방법도 있습니다.

Orca은 `any CLI agent`(모든 CLI 에이전트)와 함께 작동합니다. 에이전트 콤보 상자는 터미널에서 프로세스를 시작하기만 합니다. 다음은 원클릭 launch/setup를 통해 내장 에이전트 선택기에 사전 구성되어 제공됩니다. 지원되는 경우 더 깊은 후크, 상태, 사용 추적 및 계정 전환이 표시됩니다.

## 권한 기본값

Orca은 새로운 출시에 대해 지원되는 각 CLI의 권한 우회 플래그를 미리 채웁니다. — Claude의 경우 '--dangerously-skip-permissions', Codex의 경우 '--dangerously-bypass-approvals-and-sandbox', Gemini / Cursor / Crush / Kimi / Rovo Dev / Hermes / GitHub Copilot의 경우 '--yolo' / 명령 코드 및 이를 노출하는 다른 모든 에이전트에 대한 동등한 플래그입니다. 그 이유는 작업 트리가 일회용이기 때문입니다. 자체 체크아웃에서 실행 중인 에이전트는 모든 셸 명령을 다시 확인하지 않고도 실험할 수 있으며 병합하기 전에 여전히 diff를 선별하거나 삭제할 수 있습니다.

**Yolo**와 `Yolo`(수동) 실행 사이에서 사용자 지정되지 않은 모든 에이전트를 전환하려면 `Manual`(설정 → 에이전트 → 에이전트 권한)을 사용하세요. 특정 에이전트의 시작 인수 또는 환경을 이미 재정의한 경우 Orca은 해당 에이전트를 그대로 두므로 전역 스위치가 사용자 정의 명령을 지우지 않습니다.

한 에이전트에 대한 프롬프트만 복원하려면 설정에서 해당 에이전트의 기본 인수 또는 환경을 편집하세요. Orca은 비어 있지 않은 사용자 정의 값을 명시적 재정의로 처리하고 해당 에이전트를 향후 권한 모드 마이그레이션에서 제외합니다.

| 에이전트 | 메모 | 문서 |
| --- | --- | --- |
| Claude Code | 심층 통합: 사용법, 핫스왑, 후크 | [인류](https://docs.anthropic.com/claude/docs/claude-code) |
| 클로드 에이전트 팀 | 기본적으로 비활성화됨 — 설정 → 에이전트에서 각 팀원의 기본 창을 사용하여 `orca claude-teams`을 통해 실행하도록 활성화 | [인류](https://code.claude.com/docs/agent-teams) |
| Codex | 심층 통합: 사용량, 핫스왑 | [OpenAI](https://github.com/openai/codex) |
| 그록 | 자동 설정 | [xAI](https://x.ai/cli) |
| GitHub Copilot CLI | 자동 설정 | [GitHub](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) |
| OpenCode | 자동 설정, 상태 | [OpenCode](https://opencode.ai/docs/cli/) |
| 파이 | 자동 설정, 후크, 상태 | [파이](https://pi.dev/) |
| OMP | 자동 설정, 후크, 상태 | [OMP](https://omp.sh/) |
| 쌍둥이자리 | 자동 설정 | [구글](https://github.com/google-gemini/gemini-cli) |
| 반중력 | 자동 설정, 후크, 상태 | [구글](https://antigravity.google/docs/cli-overview) |
| 앤티 | 자동 설정, 상태 | [앤티](https://github.com/AntigmaLabs/ante-preview) |
| 에이더 | 자동 설정 | [에이더](https://aider.chat/docs/) |
| 거위 | 자동 설정 | [차단](https://block.github.io/goose/docs/quickstart/) |
| 앰프 | 자동 설정 | [앰프](https://ampcode.com/manual#install) |
| 킬로코드 | 자동 설정 | [킬로](https://kilo.ai/docs/cli) |
| 키로 | 자동 설정 | [키로](https://kiro.dev/docs/cli/) |
| 매력 크러쉬 | 자동 설정 | [참](https://github.com/charmbracelet/crush) |
| 오기 | 자동 설정 | [보강](https://docs.augmentcode.com/cli/overview) |
| 자동손 | 자동 설정 | [오토핸드](https://github.com/autohandai/code-cli) |
| 클라인 | 자동 설정 | [클라인](https://docs.cline.bot/cline-cli/overview) |
| 코드버프 | 자동 설정 | [코드버프](https://www.codebuff.com/docs/help/quick-start) |
| 명령 코드 | 자동 설정, 상태 | [명령코드](https://commandcode.ai/docs/quickstart) |
| 계속 | 자동 설정 | [계속](https://docs.continue.dev/guides/cli) |
| Cursor CLI | 심층 통합 | [커서](https://cursor.com/cli) |
| 데빈 | 자동 설정 | [데빈](https://devin.ai/cli) |
| 드로이드(공장) | 자동 설정, 후크, 상태 | [공장](https://docs.factory.ai/cli/getting-started/quickstart) |
| 키미 | 자동 설정 | [문샷](https://www.kimi.com/code/docs/en/kimi-code-cli/getting-started.html) |
| 미스트랄 바이브 | 자동 설정 | [미스트랄](https://github.com/mistralai/mistral-vibe) |
| 미니맥스 | 자동 설정, 사용량 추적, 속도 제한 추적 | [미니맥스](https://www.minimax.chat/) |
| 퀀 코드 | 설치된 `qwen` 실행 파일을 통한 자동 설정 | [큐웬](https://github.com/QwenLM/qwen-code) |
| 로보 데브 | 자동 설정 | [아틀라시안](https://support.atlassian.com/rovo/docs/install-and-run-rovo-dev-cli-on-your-device/) |
| 헤르메스 | 자동 설정 | [노우스](https://hermes-agent.nousresearch.com/docs/) |
| 오픈클로 | 자동 설정 | [오픈클로](https://github.com/openclaw/openclaw) |

이 목록에 없는 내용은 [사용자 지정 CLI 에이전트 추가](/orca-docs-ko/docs/agents/custom-cli/)를 참조하세요.
