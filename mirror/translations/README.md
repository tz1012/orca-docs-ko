# 번역 파일

이 디렉터리의 JSON 파일은 ORCA 문서의 커밋되는 한국어 번역 결과입니다. `.mirror/jobs`의 파일은 번역 작업을 위한 무시된 스테이징 입력이며, 같은 상대 경로의 번역 파일을 이 디렉터리에 작성합니다.

문서 경로 `/docs/install/`의 번역은 `mirror/translations/install/index.json`에 다음 형태로 저장합니다.

```json
{
  "sourceUrl": "https://www.onorca.dev/docs/install",
  "mirrorPath": "/docs/install/",
  "entries": {
    "/docs/install/:heading:install:0": {
      "sourceHash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "translated": "# ORCA 설치"
    }
  }
}
```

- `sourceUrl`과 `mirrorPath`는 작업 파일의 값과 정확히 일치해야 합니다.
- `entries`의 키는 세그먼트 ID입니다. 각 항목에는 원문의 SHA-256인 `sourceHash`와 비어 있지 않은 `translated` Markdown을 기록합니다.
- `sourceHash`가 바뀌면 기존 번역은 오래된 번역으로 무효화됩니다. 새 작업의 해시와 번역 파일의 해시가 일치할 때만 사용할 수 있습니다.
- 모든 `ORCA_PROTECTED_*` 토큰은 정확히 한 번씩 그대로 유지하고 코드 펜스 수를 보존합니다.
- 기술 문서의 산문은 `~합니다` 문체의 한국어로 번역하며, 코드와 이미지 전용 세그먼트는 변경하지 않습니다.

현재 작업과 완료된 번역을 확인하려면 저장소 루트에서 다음 명령을 실행합니다.

```powershell
pnpm exec tsx scripts/mirror/jobs.ts validate-ready
```

출력의 `remaining`은 아직 번역 파일이 없는 작업이며 오류가 아닙니다. `invalid`는 존재하지만 검증에 실패한 번역이므로 명령이 종료 코드 1을 반환합니다.
