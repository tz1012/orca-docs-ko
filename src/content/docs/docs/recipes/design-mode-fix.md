---
title: "디자인 모드의 UI 버그 수정"
sourceUrl: https://www.onorca.dev/docs/recipes/design-mode-fix
checkedAt: "2026-08-28T01:14:52.497Z"
editUrl: false
prev: /orca-docs-ko/docs/recipes/jump-worktrees/
next: /orca-docs-ko/docs/recipes/remote-worktrees/
translationNotice:
  title: "비공식 한국어 번역"
  message: "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다."
  rights: "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다."
---

디자인 모드에서는 "버튼이 잘못된 것 같습니다." → "고정 커밋" 루프를 1분 미만으로 축소합니다.

## 단계

1. 작업 트리의 브라우저 창을 엽니다. 버그가 있는 페이지로 이동합니다.
2. [디자인 모드](/orca-docs-ko/docs/browser/design-mode/)를 켭니다.
3. 깨진 요소를 클릭하세요. 에이전트 채팅에 풍부한 첨부 파일로 표시됩니다.
4. 수정하고 싶은 내용을 입력하세요. "이 패딩이 너무 빡빡합니다. 위의 카드와 일치하도록 늘리세요."
5. 에이전트가 소스를 편집합니다. 핫 리로드는 브라우저를 새로 고칩니다.
6. 요소를 다시 클릭하여 확인합니다. 여전히 잘못된 경우 반복합니다.
7. 올바른 경우 커밋합니다.

## 빠른 이유

스크린샷도 없고, DOM 헌팅도 없고, 선택기 복사도 없습니다. 에이전트는 HTML, 계산된 CSS 및 사용자가 가리키는 정확한 요소의 잘린 이미지를 가져옵니다. 이는 검토자가 원하는 것과 동일한 컨텍스트입니다.
