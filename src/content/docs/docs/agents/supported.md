---
title: "지원되는 에이전트"
sourceUrl: https://www.onorca.dev/docs/agents/supported
checkedAt: "2026-07-16T01:03:39.973Z"
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

Orca은 새로운 실행에 대해 지원되는 각 CLI의 권한 우회 플래그를 미리 채웁니다. — Claude의 경우 `--dangerously-skip-permissions`, Codex의 경우 `--dangerously-bypass-approvals-and-sandbox`, Gemini의 경우 `--yolo` Cursor / Crush / Kimi / Rovo Dev / Hermes / GitHub Copilot / Command Code 및 이를 노출하는 다른 모든 에이전트에 대한 동등한 플래그. 그 이유는 작업 트리가 일회용이기 때문입니다. 자체 체크아웃에서 실행 중인 에이전트는 모든 셸 명령을 다시 확인하지 않고도 실험할 수 있으며 병합하기 전에 여전히 diff를 선별하거나 삭제할 수 있습니다.

사용자 지정하지 않은 모든 에이전트의 실행 방식을 `Yolo`(자동 승인)와 `Manual`(수동 승인) 사이에서 전환하려면 `Settings → Agents → Agent Permissions`(설정 → 에이전트 → 에이전트 권한)을 사용하세요. 특정 에이전트의 시작 인수 또는 환경을 이미 재정의한 경우 Orca은 해당 에이전트를 그대로 두므로 전역 전환이 사용자 지정 명령을 지우지 않습니다.

한 에이전트에 대한 프롬프트만 복원하려면 설정에서 해당 에이전트의 기본 인수 또는 환경을 편집하세요. Orca은 비어 있지 않은 사용자 정의 값을 명시적 재정의로 처리하고 해당 에이전트를 향후 권한 모드 마이그레이션에서 제외합니다.

| 에이전트 | 메모 | 문서 |
| --- | --- | --- |
| Claude Code | 심층 통합: 사용법, 핫스왑, 후크 | [Anthropic](https://docs.anthropic.com/claude/docs/claude-code) |
| Claude Agent Teams | 기본적으로 비활성화됨 — 설정 → 에이전트에서 각 팀원의 기본 창을 사용하여 `orca claude-teams`를 통해 실행하도록 활성화 | [Anthropic](https://code.claude.com/docs/agent-teams) |
| Codex | 심층 통합: 사용량, 핫스왑 | [OpenAI](https://github.com/openai/codex) |
| Grok | 자동 설정 | [xAI](https://x.ai/cli) |
| GitHub Copilot CLI | 자동 설정 | [GitHub](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) |
| OpenCode | 자동 설정, 상태 | [OpenCode](https://opencode.ai/docs/cli/) |
| Pi | 자동 설정, 후크, 상태 | [Pi](https://pi.dev/) |
| OMP | 자동 설정, 후크, 상태 | [OMP](https://omp.sh/) |
| Gemini | 자동 설정 | [Google](https://github.com/google-gemini/gemini-cli) |
| Antigravity | 자동 설정, 후크, 상태 | [Google](https://antigravity.google/docs/cli-overview) |
| Ante | 자동 설정, 상태 | [Ante](https://github.com/AntigmaLabs/ante-preview) |
| Aider | 자동 설정 | [Aider](https://aider.chat/docs/) |
| Goose | 자동 설정 | [Block](https://block.github.io/goose/docs/quickstart/) |
| Amp | 자동 설정 | [Amp](https://ampcode.com/manual#install) |
| Kilocode | 자동 설정 | [Kilo](https://kilo.ai/docs/cli) |
| Kiro | 자동 설정 | [Kiro](https://kiro.dev/docs/cli/) |
| Charm Crush | 자동 설정 | [Charm](https://github.com/charmbracelet/crush) |
| Auggie | 자동 설정 | [Augment](https://docs.augmentcode.com/cli/overview) |
| Autohand | 자동 설정 | [Autohand](https://github.com/autohandai/code-cli) |
| Cline | 자동 설정 | [Cline](https://docs.cline.bot/cline-cli/overview) |
| Codebuff | 자동 설정 | [Codebuff](https://www.codebuff.com/docs/help/quick-start) |
| Command Code | 자동 설정, 상태 | [Command Code](https://commandcode.ai/docs/quickstart) |
| Continue | 자동 설정 | [Continue](https://docs.continue.dev/guides/cli) |
| Cursor CLI | 심층 통합 | [Cursor](https://cursor.com/cli) |
| Devin | 자동 설정 | [Devin](https://devin.ai/cli) |
| Droid(Factory) | 자동 설정, 후크, 상태 | [Factory](https://docs.factory.ai/cli/getting-started/quickstart) |
| Kimi | 자동 설정 | [Moonshot](https://www.kimi.com/code/docs/en/kimi-code-cli/getting-started.html) |
| Mistral Vibe | 자동 설정 | [Mistral](https://github.com/mistralai/mistral-vibe) |
| MiniMax | 자동 설정, 사용량 추적, 속도 제한 추적 | [MiniMax](https://www.minimax.chat/) |
| Qwen Code | 설치된 `qwen` 실행 파일을 통한 자동 설정 | [Qwen](https://github.com/QwenLM/qwen-code) |
| Rovo Dev | 자동 설정 | [Atlassian](https://support.atlassian.com/rovo/docs/install-and-run-rovo-dev-cli-on-your-device/) |
| Hermes | 자동 설정 | [Nous](https://hermes-agent.nousresearch.com/docs/) |
| OpenClaw | 자동 설정 | [OpenClaw](https://github.com/openclaw/openclaw) |

이 목록에 없는 내용은 [사용자 지정 CLI 에이전트 추가](/orca-docs-ko/docs/agents/custom-cli/)를 참조하세요.
