---
title: "GitHub 오류 문제 해결"
sourceUrl: https://www.onorca.dev/docs/github-errors
checkedAt: "2026-07-21T05:58:45.755Z"
editUrl: false
prev: /orca-docs-ko/docs/troubleshooting/
next: false
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

Orca의 PR 검사, Tasks 및 `Source Control`(소스 제어)에서 발생하는 속도 제한, 인증 실패 및 기타 GitHub CLI 오류를 진단합니다.

Orca은 사용자의 시스템 또는 원격 Orca 호스트에 설치된 **GitHub CLI(`gh`)**를 통해 GitHub과 통신합니다. PR 상태, 검사, 이슈 또는 Tasks가 갱신되지 않는 원인은 대부분 GitHub 인증, 권한 또는 API 속도 제한이며, PR 패널 자체의 문제인 경우는 드뭅니다.

이 페이지에서는 자주 발생하는 오류와 해결 방법을 설명합니다.

## 빠른 분류

| 표시되는 내용 | 가능한 원인 | 먼저 시도할 작업 |
| --- | --- | --- |
| ‘GitHub is rate-limiting requests’ / ‘rate limit exceeded (core)’ | 사용자에게 할당된 GitHub REST(core) 할당량 소진 | 재설정까지 기다리고 추가 `gh`, 에이전트 및 Orca 사용을 중지한 뒤 [`Settings → Git → GitHub API Budget`(설정 → Git → GitHub API 예산)](/orca-docs-ko/docs/settings/)을 확인합니다. |
| ‘GitHub authentication is unavailable’ / `gh auth` 프롬프트 | `gh`에 로그인하지 않았거나 토큰이 만료됐거나 `GITHUB_TOKEN`이 잘못됨 | `gh auth status`을 실행한 다음 `gh auth login`을 실행합니다. |
| ‘GitHub did not allow access’ / 속도 제한이 아닌 HTTP 403 | 필요한 범위가 없거나 저장소 접근 권한이 없음 | `repo` 범위로 다시 인증하고 필요한 조직 SSO도 승인한 뒤, 브라우저에서 PR을 열 수 있는지 확인합니다. |
| ‘repository is unavailable’ / HTTP 404 | 잘못된 원격 저장소, 비공개 저장소 접근 권한 없음 또는 저장소 이름 변경 | `git remote -v`와 브라우저 접근 권한을 확인합니다. |
| ‘GitHub is unreachable’ / 시간 초과 | 네트워크, 프록시, VPN 또는 GitHub 장애 | [githubstatus.com](https://www.githubstatus.com/)을 확인하고 VPN을 끈 상태에서 다시 시도합니다. |
| ‘GitHub CLI is unavailable’ | Orca이 사용하는 PATH에 `gh`가 없음 | `gh`를 설치하고 Orca을 다시 시작합니다. |

## 속도 제한(가장 흔한 원인)

GitHub은 **인증된 사용자**마다 공유 시간당 할당량을 제공합니다. 해당 계정을 사용하는 **모든 도구가 같은 할당량을 공유합니다**. Orca, 터미널의 `gh`, `gh`를 호출하는 Claude/Codex/Grok 에이전트, CI 스크립트, 브라우저 확장 프로그램 및 기타 앱이 모두 포함됩니다.

### Orca이 사용하는 할당량 버킷

| 버킷 | 적용 대상 | 일반적인 제한(인증된 사용자) |
| --- | --- | --- |
| **REST(core)** | 대부분의 PR/issue/API 호출(`gh pr view`, 검사 메타데이터 및 여러 REST 엔드포인트) | 시간당 5,000회 |
| **GraphQL** | Project/Tasks 및 일부 상세 PR 쿼리 | 시간당 5,000포인트 |
| **Search** | 검색 기반 목록 | 분당 30회 |

주요 버킷이 소진되면 GitHub은 `API rate limit exceeded`과 같은 메시지가 포함된 HTTP **403**을 반환합니다. Orca은 이를 속도 제한으로 분류하고 가능하면 마지막으로 확인된 PR 상태를 유지하며, 한 번의 제한이 대량 실패로 이어지지 않도록 잠시 **추가 `gh` 호출 생성을 중지합니다**.

### PR 패널이 차단됐는데도 설정이 ‘정상’으로 보일 수 있는 이유

**`Settings → Git → GitHub API Budget`(설정 → Git → GitHub API 예산)**은 GitHub의 특수 `rate_limit` 엔드포인트를 읽습니다. 이 확인 요청은 속도 제한 집계에서 **제외**되므로, 같은 사용자의 실제 REST 호출이 이미 `remaining: 0`을 반환하는 상황에서도 남은 할당량이 있다고 표시될 수 있습니다.

두 결과가 다르면 다음 순서로 신뢰합니다.

1. **PR 또는 `Checks`(검사) 패널에 표시된 오류**(실시간 요청 실패)
2. 아래의 실제 CLI 확인
3. 설정의 예산 수치(유용하지만 확인 전용 요청의 결과)

**`GitHub API Budget`(GitHub API 예산)**을 `Accounts`(계정) 아래의 **Claude, Codex 및 Grok 사용량**과 혼동하지 마세요. 계정 아래의 사용량은 AI 공급자 제한이며 GitHub REST 할당량이 아닙니다.

### 터미널에서 속도 제한 확인

```
# Probe (does not consume quota; can look healthier than reality)
gh api rate_limit --jq '.resources | {core, graphql, search}'

# Real REST call — this is what PR refresh depends on
gh api user -i 2>&1 | head -40
```

`gh api user`가 `API rate limit exceeded` 및 `X-Ratelimit-Remaining: 0`과 함께 **403**을 반환하면 `X-Ratelimit-Reset` 시각(Unix epoch 초)까지 해당 계정의 REST 사용이 차단됩니다.

### 일반적인 할당량 소진 원인

- 여러 Orca 창이나 electron-dev 빌드를 동시에 열어 둡니다. 각 인스턴스가 PR 또는 Tasks를 갱신할 수 있습니다.
- 에이전트가 `gh`를 자동화해 PRs/issues 할당, 검사 폴링 또는 대량 GraphQL 작업을 수행합니다.
- PR 패널을 갱신하면서 Tasks 또는 여러 저장소에 대량으로 작업을 분산합니다.
- 다른 앱이 같은 GitHub 사용자 토큰을 사용합니다.

### 해결 방법

1. 오류 또는 `X-Ratelimit-Reset`에 표시된 시간당 재설정 시각까지 **기다립니다**.
2. **동시에 실행되는 GitHub 클라이언트를 줄입니다.** 추가 Orca 인스턴스를 종료하고 대량 `gh` 자동화를 일시 중지합니다.
3. 제한된 동안 PR 패널에서 갱신을 반복하지 않습니다. Orca은 이미 호출 빈도를 낮추고 있습니다.
4. 스크립트에서는 GraphQL 요청을 일괄 처리합니다. 개인 계정으로 대규모 집합의 PR을 하나씩 순회하며 REST를 호출하지 않습니다.
5. 재설정 후에도 PR 갱신이 실패하면 다음 섹션에 따라 인증을 다시 확인합니다.

## 인증 문제

Orca은 해당 호스트에서 `gh`가 사용하는 인증 정보를 그대로 사용합니다.

### 상태 확인

```
gh auth status -h github.com
gh api user --jq '{login, id}'
```

정상적인 출력은 로그인 상태이고 토큰이 유효하며 `gh api user`가 사용자의 로그인 이름을 반환합니다.

### 흔히 놓치는 문제

**셸 프로필의 `GITHUB_TOKEN` 또는 `GH_TOKEN`**  
`~/.bash_profile` 또는 `~/.zshrc`에서 `export GITHUB_TOKEN=$(gh auth token)` 같은 값을 내보내면 `gh`는 키링보다 해당 값을 우선합니다. 오래됐거나 잘못된 환경 변수 토큰은 이해하기 어려운 인증 또는 속도 제한 동작을 유발합니다. 환경 변수를 해제하고 다시 로그인합니다.

```
unset GITHUB_TOKEN GH_TOKEN
gh auth logout -h github.com
gh auth login -h github.com
```

**만료되거나 취소된 토큰**  
`gh auth status`에 토큰이 유효하지 않다고 표시될 수 있습니다. `gh auth login` 또는 `gh auth refresh`을 실행하고 새 자격 증명을 사용하도록 Orca을 다시 시작합니다.

**조직 SAML SSO**  
비공개 조직 저장소는 토큰에 대한 SSO 승인이 필요할 수 있습니다. GitHub 토큰 설정에서 조직의 SSO 승인 링크를 연 다음 다시 시도합니다.

**원격 또는 SSH 작업 트리**  
GitHub 인증은 **호스트별**입니다. 노트북에서 로그인해도 원격 시스템의 `gh`에 로그인되지 않습니다. 호스트에 SSH로 접속해 그곳에서 `gh auth login`을 실행하거나, 해당 환경에 대한 Orca의 원격 서버 GitHub 예산 보기를 사용합니다.

## 권한 및 저장소 오류

| 증상 | 의미 |
| --- | --- |
| ‘rate limit’ 메시지가 없는 HTTP 403 | 토큰에 필요한 범위가 없거나 리소스를 볼 권한이 없습니다. |
| HTTP 404 / ‘could not resolve to a Repository’ | 저장소가 없거나 이름이 바뀌었거나 이 토큰에서 보이지 않습니다. |
| ‘resource not accessible by integration’ | App/token 유형으로 해당 작업을 수행할 수 없습니다. |

해결 방법:

- `gh api user`과 같은 사용자로 로그인한 브라우저에서 PR/repo을 열 수 있는지 확인합니다.
- `repo`를 포함하는 클래식 범위로 다시 인증합니다. 해당 기능을 사용한다면 `read:org` 및 `project`도 포함합니다.
- GitHub Enterprise에서는 `gh`가 해당 호스트 이름에 인증되어 있는지 확인합니다(`gh auth login --hostname …`).

## 네트워크 및 GitHub 장애

시간 초과, ‘could not resolve host’ 또는 ‘GitHub is unreachable’ 메시지는 연결 문제를 의미합니다.

- [GitHub 상태](https://www.githubstatus.com/)를 확인합니다.
- VPN 또는 회사 프록시를 끄고 시도합니다.
- 원격 호스트에서는 `api.github.com`로 나가는 HTTPS 연결이 작동하는지 확인합니다.

## GitHub CLI 누락

Orca에서 GitHub CLI를 사용할 수 없다고 표시하는 경우:

1. [`gh`](https://cli.github.com/)를 설치합니다.
2. 일반 터미널에서 `which gh`가 작동하는지 확인합니다.
3. Orca을 완전히 종료한 뒤 다시 열어 PATH를 일치시킵니다.
4. Windows에서는 Orca이 실행되는 환경과 같은 환경에 설치합니다(WSL 또는 네이티브).

## GitHub 실패 시 Orca의 동작

- **속도 제한 또는 장애:** PR 및 `Checks`(검사) 패널은 UI를 비우는 대신 **마지막으로 확인된 상태**와 짧은 배너를 표시합니다.
- **심각한 인증 또는 권한 실패:** 로그인 또는 접근 권한을 수정하라는 명확한 빈 상태 또는 배너 문구를 표시합니다.
- **회로 차단기:** 주요 속도 제한 403이 발생하면 Orca은 앱의 반응성을 유지하고 상황을 악화시키지 않도록 해당 버킷(`core`, `search` 또는 `graphql`)에 대한 새 `gh` 프로세스 생성을 잠시 거부합니다.

## Orca에서 GitHub API 예산 확인

**[`Settings → Git`(설정 → Git)](/orca-docs-ko/docs/settings/)**을 열고 **`GitHub API Budget`(GitHub API 예산)**을 찾습니다.

- GitHub의 확인 요청에서 반환한 **REST, Search 및 GraphQL** 남은 횟수
- 제한 재설정을 기다린 뒤 새로 고침
- 원격 Orca 서버에서는 **서버 소유** `gh` ID에 대한 원격 고급 예산 보기를 사용합니다. 로컬 설정에는 데스크톱 클라이언트만 표시됩니다.

## 그래도 해결되지 않는 경우

1. Orca이 사용하는 것과 같은 machine/user에서 `gh pr view` 또는 `gh api user`을 실행해 터미널에서 한 번 재현합니다.
2. **`Help → Open Logs`(도움말 → 로그 열기)**에서 로그를 수집합니다.
3. 분류된 오류 문구(비밀 정보 제외), 민감 정보를 가린 `gh auth status` 출력 및 터미널의 `gh`도 같은 방식으로 실패하는지를 포함해 이슈를 등록합니다.

- [GitHub 이슈](https://github.com/stablyai/orca/issues)
- [Discord](https://discord.gg/fzjDKHxv8Q)

## 관련 문서

- [호스팅 검토, 이슈 및 Actions](/orca-docs-ko/docs/review/github/) — GitHub에 의존하는 PR 및 `Checks`(검사) 기능
- [설정 참조](/orca-docs-ko/docs/settings/) — `Integrations`(통합) 및 `Git` 창
- [사용량 및 속도 제한 추적](/orca-docs-ko/docs/agents/usage-tracking/) — GitHub API가 아닌 AI 공급자 제한(Claude/Codex)
- [문제 해결 및 FAQ](/orca-docs-ko/docs/troubleshooting/) — 일반적인 Orca 문제
