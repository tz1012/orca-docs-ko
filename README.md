# ORCA 한국어 문서 미러

[ORCA 공식 문서](https://www.onorca.dev/docs)를 한국어로 읽을 수 있도록 만드는 정적 미러입니다. 원문 사이트맵에서 문서를 발견하고, 번역이 필요한 부분만 작업 파일로 만든 뒤, 검증된 번역만 Astro Starlight 사이트에 반영합니다.

> 이 프로젝트는 Lovecast Inc. 또는 ORCA가 운영하거나 보증하는 공식 프로젝트가 아닙니다. 번역과 원문이 다르면 공식 문서가 우선합니다. 원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다.

배포 주소: <https://tz1012.github.io/orca-docs-ko/>

## 로컬 명령

Node.js 24 이상과 pnpm 11.7.0 이상이 필요합니다.

```powershell
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm check
pnpm build
```

미러 동기화는 다음 세 단계로 분리되어 있습니다.

```powershell
pnpm mirror:prepare
pnpm exec tsx scripts/mirror/jobs.ts validate-ready
pnpm mirror:apply
pnpm mirror:check
```

- `mirror:prepare`는 robots.txt와 사이트맵을 읽고 페이지·이미지를 안전한 임시 영역에 준비한 뒤 `.mirror/jobs/`에 번역 작업을 만듭니다.
- `validate-ready`는 현재 작업에 대응하는 번역 파일을 검사하며, 아직 작성하지 않은 파일과 잘못 작성한 파일을 구분해 보고합니다.
- `mirror:apply`는 필요한 번역이 모두 유효할 때만 콘텐츠, 사이드바, 번역, 이미지, 매니페스트를 함께 승격합니다.
- `mirror:check`는 현재 사이트맵, 보류 중인 삭제, 보호된 코드와 명령, 내부 링크, 로컬 이미지 해시, robots 예외, 번역 안내, 한국어 포함 여부를 검사하고 사이트 빌드까지 실행합니다.

세 미러 명령은 성공 시 다음 키만 사용하는 JSON 요약을 한 줄로 출력합니다: `discovered`, `added`, `updated`, `unchanged`, `pendingRemoval`, `removed`, `translatedSegments`, `localImages`, `remoteImages`. 성공과 변경 없음은 종료 코드 0, 실패는 종료 코드 1입니다.

## 최초 동기화

1. `pnpm mirror:prepare`를 실행합니다.
2. `.mirror/jobs/`의 각 JSON 작업에 대응하는 파일을 `mirror/translations/`에 작성합니다. 기술 문서의 의미와 Markdown 구조를 유지하고, 모든 `ORCA_PROTECTED_*` 토큰을 정확히 한 번 보존합니다.
3. 한 번에 최대 10개 페이지를 번역한 뒤 `pnpm exec tsx scripts/mirror/jobs.ts validate-ready`로 중간 검증합니다.
4. 남은 작업과 잘못된 번역이 모두 0이면 `pnpm mirror:apply`를 실행합니다.
5. `pnpm mirror:check`, `pnpm test`, `pnpm check`, `pnpm build`를 차례로 실행합니다.
6. 검증된 `mirror/`, `src/content/docs/`, `public/assets/mirror/` 변경만 커밋합니다. `.mirror/`의 원문 스냅샷과 작업 파일은 커밋하지 않습니다.

## 평일 자동 동기화

로컬 Codex 자동화는 Asia/Seoul 기준 월요일부터 금요일까지 오전 10시에 같은 절차를 수행하도록 설계되어 있습니다. 새 작업을 준비하고, 최대 10페이지 단위로 번역과 중간 검증을 진행한 뒤, apply → mirror check → test → type check → build 순서가 모두 성공한 경우에만 변경을 커밋하고 `main`에 반영합니다.

원문 변경이 없으면 커밋하지 않습니다. 번역 누락, 검증 실패, 네트워크 오류, 빌드 실패가 하나라도 있으면 기존 공개 상태를 유지하고 커밋하거나 푸시하지 않습니다. 사이트맵에서 처음 사라진 페이지는 `pending-removal`로 보존하며, 두 번 연속 사라졌을 때만 제거합니다.

## 실패 정책

- 빈 사이트맵은 원문 장애로 간주하여 준비를 중단합니다.
- 페이지 가져오기 실패가 발견한 페이지의 20%를 초과하면 준비 결과를 교체하지 않습니다.
- 20% 이하의 부분 가져오기도 작업을 살펴볼 수 있도록 준비할 수 있지만, 불완전한 스냅샷은 적용할 수 없습니다.
- 번역 파일 하나라도 누락되거나 해시, 보호 토큰, 코드 펜스, 한국어 검사를 통과하지 못하면 어떤 생성 상태도 승격하지 않습니다.
- 적용 중 링크·이미지·안내 메타데이터 검사가 실패하면 기존 콘텐츠, 사이드바, 번역, 이미지, 매니페스트를 유지합니다.
- 원문 HTML, 인증 정보, 토큰은 추적 파일에 저장하지 않습니다. robots.txt가 미러링을 허용하지 않는 이미지는 원격 URL을 유지합니다.

## 문제 해결

- `remaining`이 표시되면 `.mirror/jobs/`와 같은 상대 경로의 JSON 파일을 `mirror/translations/`에 작성합니다.
- `invalid`가 표시되면 해당 작업의 `sourceUrl`, `mirrorPath`, `sourceHash`, 보호 토큰 개수와 코드 펜스 개수를 확인합니다.
- `Source manifest changed after prepare` 오류가 나면 다른 동기화가 상태를 바꾼 것이므로 `pnpm mirror:prepare`부터 다시 실행합니다.
- 깨진 내부 링크나 누락된 로컬 이미지가 보고되면 원문 페이지와 `mirror/source-manifest.json`을 확인하고 다시 준비합니다. robots 정책이 바뀐 원격 이미지는 새 준비 과정에서 상태를 갱신해야 합니다.
- Astro 진단이나 빌드가 실패하면 먼저 `pnpm check`를 실행해 파일과 줄을 확인한 뒤, 수정 후 `pnpm mirror:check`를 다시 실행합니다.
- 네트워크 문제로 페이지 실패율이 높아졌다면 기존 공개 결과를 수정하지 말고 원문 사이트가 정상화된 뒤 다시 시도합니다.
