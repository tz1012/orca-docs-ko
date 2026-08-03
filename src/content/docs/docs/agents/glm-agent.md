---
title: "Orca ADE에서 GLM-5.2를 사용하는 방법"
sourceUrl: https://www.onorca.dev/docs/agents/glm-agent
checkedAt: "2026-08-03T07:35:41.401Z"
editUrl: false
prev: /orca-docs-ko/docs/agents/claude-code/
next: /orca-docs-ko/docs/agents/codex/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca 작업 트리 내에서 GLM-5.2를 실행하도록 Claude Code 및 기타 CLI 에이전트 하네스를 구성합니다.

GLM-5.2는 이미 사용하고 있는 에이전트 하네스를 통해 Orca에서 작동합니다. Claude Code, OpenCode, Cline, Kilo Code, Roo Code, Droid, OpenClaw 또는 다른 CLI 에이전트에서 GLM-5.2를 구성한 다음 Orca의 선택기에서 해당 에이전트를 시작합니다.

Orca은 격리된 작업 트리, 터미널 창, 브라우저 탭, 검토 흐름 및 세션 관리를 제공합니다. [Z.ai CodePlan 구독](https://z.ai/subscribe) 및 에이전트 구성은 모델 액세스를 제공합니다.

전제 조건

에이전트 하니스에서 GLM-5.2를 구성하기 전에 GLM 코딩 계획 액세스 권한이 있는 활성 [Z.ai CodePlan 구독](https://z.ai/subscribe)이 필요합니다. OpenAI 호환 하네스에도 Z.ai API 키가 필요합니다. Orca은 GLM 액세스를 포함하거나 재판매하지 않습니다.

소스

이러한 설정은 [Z.ai의 최신 모델 가이드](https://docs.z.ai/devpack/latest-model)를 따릅니다. 현재 공급자 측 세부 정보는 해당 페이지를 확인하세요.

## Claude Code 에이전트

Claude Code은 `~/.claude/settings.json`에서 모델 재정의를 읽습니다. Orca에서 GLM-5.2를 사용하려면:

1. `~/.claude/settings.json`을 엽니다.
2. 아래 `env` 블록을 추가하거나 업데이트하세요.
3. Orca에서 Claude Code 세션을 다시 시작하여 새 환경이 로드되도록 합니다.
4. Claude Code 내에서 `/status`를 실행하여 활성 모델을 확인합니다.

````
{
  "env": {
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "1000000",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.2[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.2[1m]"
  }
}
````

GLM-5.2의 1M 컨텍스트 변형을 원할 때 `[1m]` 접미사를 사용하고 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`를 `1000000`으로 설정하여 Claude Code의 압축 창이 해당 컨텍스트 크기와 일치하도록 합니다. Claude Code에 `[1m]` 모델이 존재하지 않는다고 표시되면 Claude Code을 업데이트하고 다시 시도하세요.

코딩 작업의 경우 Z.ai는 `/effort`을 사용하여 Claude Code 노력을 `max`로 설정할 것을 권장합니다. Claude Code의 낮은 노력 설정은 GLM-5.2 높은 노력에 매핑되는 반면 `xhigh`, `max` 및 `ultracode`은 GLM-5.2 최대 노력에 매핑됩니다.

## OpenCode, Cline, Kilo 코드, Roo 코드 및 Droid

OpenAI 호환 공급자를 노출하는 에이전트 하네스의 경우:

1. Orca 외부 또는 내부에서 하네스 설정을 엽니다.
2. OpenAI 호환 제공자 옵션을 선택하거나 하네스에 Z.ai 제공자 옵션이 있는 경우 이를 선택합니다.
3. 기본 URL을 `https://api.z.ai/api/coding/paas/v4`으로 설정합니다.
4. Z.ai API 키를 추가하세요.
5. 커스텀 모델 이름을 `glm-5.2`로 설정합니다.
6. 하네스가 해당 필드를 노출하는 경우 컨텍스트 창 크기를 `1000000`로 설정합니다.
7. 하네스가 이 공급자 경로에 대한 이미지 지원을 구체적으로 문서화하지 않는 한 이미지 지원을 비활성화합니다.

저장한 후 Orca의 에이전트 선택기에서 하네스를 실행합니다. Orca는 선택한 작업 트리에서 동일하게 구성된 CLI를 실행합니다.

## OpenClaw 설정

OpenClaw이 공급자 모델 목록에서 직접 GLM-5.2를 선택할 수 없는 경우 `~/.openclaw/openclaw.json`에 모델을 수동으로 추가하세요.

`models.providers.zai.models`에 `glm-5.2`을 추가합니다.

````
{
  "id": "glm-5.2",
  "name": "GLM-5.2",
  "reasoning": true,
  "input": ["text"],
  "cost": {
    "input": 0,
    "output": 0,
    "cacheRead": 0,
    "cacheWrite": 0
  },
  "contextWindow": 1000000,
  "maxTokens": 131072
}
````

그런 다음 기본 기본 모델을 설정합니다.

````
{
  "model": {
    "primary": "zai/glm-5.2",
    "fallbacks": ["zai/glm-4.7"]
  }
}
````

그리고 `agents.defaults.models` 아래에 모델을 추가합니다.

````
{
  "models": {
    "zai/glm-5.2": { "alias": "GLM" },
    "zai/glm-4.7": {}
  }
}
````

OpenClaw 게이트웨이를 다시 시작합니다.

````
openclaw gateway restart
````

그런 다음 Orca에서 OpenClaw을 실행하거나 Orca 터미널에서 `openclaw tui`을 실행하여 GLM-5.2가 활성화되어 있는지 확인하세요.

## 다른 GLM-5.2 하네스 추가

하네스가 아직 Orca에 내장되지 않은 경우 이를 사용자 정의 CLI 에이전트로 추가합니다.

1. [설정 -> 에이전트](/orca-docs-ko/docs/settings/)를 엽니다.
2. `Add custom agent`(사용자 지정 에이전트 추가)를 클릭합니다.
3. 하네스 바이너리 또는 실행 명령에서 Orca를 지정합니다.
4. 저장한 다음 작업 트리의 에이전트 선택기에서 시작합니다.

핵심 규칙은 간단합니다. 하네스가 provider/model 설정을 저장할 때마다 GLM-5.2를 구성한 다음 Orca가 올바른 작업 트리에서 해당 하네스를 시작하도록 합니다.
