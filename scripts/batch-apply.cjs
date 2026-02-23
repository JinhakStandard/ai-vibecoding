#!/usr/bin/env node

/**
 * JINHAK 표준 v2.0.1 일괄 적용 스크립트
 *
 * 대상 프로젝트들의 CLAUDE.md 메타 버전, Hook, session-briefing.cjs,
 * settings.json, .gitignore를 표준에 맞게 업데이트합니다.
 *
 * 사용법:
 *   node scripts/batch-apply.cjs           # 실제 적용
 *   node scripts/batch-apply.cjs --dry-run # 변경 사항만 미리보기
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const STANDARD_VERSION = '2.0.1';
const TODAY = new Date().toISOString().split('T')[0];

// 표준 스크립트 소스 경로
const STANDARD_ROOT = path.resolve(__dirname, '..');
const SESSION_BRIEFING_SRC = path.join(STANDARD_ROOT, '.claude', 'scripts', 'session-briefing.cjs');
const SESSION_END_REMINDER_SRC = path.join(STANDARD_ROOT, 'scripts', 'session-end-reminder.cjs');

// ============================================================
// 대상 프로젝트 정의
// ============================================================
const TARGET_PROJECTS = [
  {
    name: 'JabisTemplate',
    root: 'D:/AI/JabisTemplate',
    fixAllow: false,
    createAiFolder: false,
    fixGitignore: false
  },
  {
    name: 'jabis-api-gateway',
    root: 'D:/AI/jabis.workspace/jabis-api-gateway',
    fixAllow: false,
    createAiFolder: false,
    fixGitignore: false
  },
  {
    name: 'jabis-lab',
    root: 'D:/AI/jabis.workspace/jabis-lab',
    fixAllow: false,
    createAiFolder: false,
    fixGitignore: false
  },
  {
    name: 'JabisCert',
    root: 'D:/AI/JabisCert',
    fixAllow: true,
    createAiFolder: true,
    fixGitignore: true
  }
];

// ============================================================
// 표준 settings.json Hook 정의
// ============================================================
function getStandardHooks(project) {
  const hooks = {
    UserPromptSubmit: [
      {
        matcher: '',
        hooks: [
          {
            type: 'command',
            command: 'node .claude/scripts/session-briefing.cjs',
            once: true
          }
        ]
      }
    ],
    PreToolUse: [
      {
        matcher: 'Edit|Write',
        hooks: [
          {
            type: 'command',
            command: 'node -e "console.log(\'[SECURITY] 파일 수정 감지: \' + (process.env.file || \'unknown\'))"'
          }
        ]
      }
    ],
    SubagentStart: [
      {
        matcher: '',
        hooks: [
          {
            type: 'command',
            command: 'node -e "console.log(\'[SECURITY] 서브에이전트 시작 - deny 규칙이 상속됩니다\')"'
          }
        ]
      }
    ],
    Stop: [
      {
        matcher: '',
        hooks: [
          {
            type: 'command',
            command: 'node .claude/scripts/session-end-reminder.cjs'
          }
        ]
      }
    ]
  };

  return hooks;
}

// ai-orchestra hook 항목인지 확인
function isOrchestraHook(hookEntry) {
  if (!hookEntry || !hookEntry.hooks) return false;
  return hookEntry.hooks.some(h =>
    h.command && h.command.includes('ai-orchestra')
  );
}

// JINHAK 표준 Hook인지 식별하는 함수
const JINHAK_HOOK_IDENTIFIERS = [
  'session-briefing.cjs',
  'session-end-reminder.cjs',
  'security-check-hook.cjs',
  '[SECURITY]',
  '[SESSION]'
];

function isJinhakHook(hookEntry) {
  if (!hookEntry || !hookEntry.hooks) return false;
  return hookEntry.hooks.some(h =>
    h.command && JINHAK_HOOK_IDENTIFIERS.some(id => h.command.includes(id))
  );
}

// 비파괴 병합: 기존 Hook에서 JINHAK/orchestra Hook만 제거 후 표준 Hook 추가
function mergeHooksNonDestructive(existingHooks, standardHooks) {
  const merged = {};
  const allEvents = new Set([
    ...Object.keys(existingHooks || {}),
    ...Object.keys(standardHooks)
  ]);

  for (const event of allEvents) {
    const existing = existingHooks?.[event] || [];
    const standard = standardHooks[event] || [];

    // 기존에서 JINHAK/orchestra Hook 제거 -> 프로젝트 고유만 남음
    const projectOnly = existing.filter(e => !isJinhakHook(e) && !isOrchestraHook(e));

    // 표준 Hook + 프로젝트 고유 Hook 합침
    merged[event] = [...standard, ...projectOnly];

    // 빈 배열이면 제거
    if (merged[event].length === 0) delete merged[event];
  }

  return merged;
}

// ============================================================
// 유틸리티
// ============================================================
const report = [];

function log(project, action, detail) {
  const msg = `[${project}] ${action}: ${detail}`;
  console.log(msg);
  report.push(msg);
}

function readFileSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function writeFileSync(filePath, content) {
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Would write: ${filePath}`);
    return;
  }
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

function copyFileSync(src, dest) {
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Would copy: ${src} → ${dest}`);
    return;
  }
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// ============================================================
// 1. CLAUDE.md 메타 버전 업데이트
// ============================================================
function updateClaudeMdMeta(project) {
  const claudeMdPath = path.join(project.root, 'CLAUDE.md');
  let content = readFileSync(claudeMdPath);
  if (!content) {
    log(project.name, 'SKIP', 'CLAUDE.md not found');
    return;
  }

  let changed = false;

  // 버전 업데이트
  const versionRegex = /<!-- jinhak_standard_version: [\d.]+ -->/;
  if (versionRegex.test(content)) {
    const newVersion = `<!-- jinhak_standard_version: ${STANDARD_VERSION} -->`;
    if (!content.includes(newVersion)) {
      content = content.replace(versionRegex, newVersion);
      changed = true;
      log(project.name, 'UPDATE', `CLAUDE.md 메타 버전 → v${STANDARD_VERSION}`);
    }
  }

  // 날짜 업데이트
  const dateRegex = /<!-- applied_date: \d{4}-\d{2}-\d{2} -->/;
  if (dateRegex.test(content)) {
    const newDate = `<!-- applied_date: ${TODAY} -->`;
    content = content.replace(dateRegex, newDate);
    changed = true;
    log(project.name, 'UPDATE', `CLAUDE.md applied_date → ${TODAY}`);
  }

  // 본문의 "v1.3을 기반으로" 같은 텍스트도 수정
  const oldBaseRef = /JINHAK 전사 AI 개발 표준 v[\d.]+을 기반으로/;
  if (oldBaseRef.test(content)) {
    content = content.replace(oldBaseRef, `JINHAK 전사 AI 개발 표준 v${STANDARD_VERSION}을 기반으로`);
    changed = true;
    log(project.name, 'UPDATE', `CLAUDE.md 본문 표준 버전 참조 업데이트`);
  }

  if (changed) {
    writeFileSync(claudeMdPath, content);
  } else {
    log(project.name, 'OK', 'CLAUDE.md 이미 최신');
  }
}

// ============================================================
// 2. session-briefing.cjs 복사
// ============================================================
function copySessionBriefing(project) {
  const destPath = path.join(project.root, '.claude', 'scripts', 'session-briefing.cjs');

  if (!fs.existsSync(SESSION_BRIEFING_SRC)) {
    log(project.name, 'ERROR', 'session-briefing.cjs 소스를 찾을 수 없음');
    return;
  }

  // 이미 동일한 파일이 있는지 확인
  const existing = readFileSync(destPath);
  const source = readFileSync(SESSION_BRIEFING_SRC);
  if (existing === source) {
    log(project.name, 'OK', 'session-briefing.cjs 이미 최신');
    return;
  }

  copyFileSync(SESSION_BRIEFING_SRC, destPath);
  log(project.name, 'COPY', 'session-briefing.cjs 복사 완료');
}

// ============================================================
// 2-2. session-end-reminder.cjs 복사
// ============================================================
function copySessionEndReminder(project) {
  const destPath = path.join(project.root, '.claude', 'scripts', 'session-end-reminder.cjs');

  if (!fs.existsSync(SESSION_END_REMINDER_SRC)) {
    log(project.name, 'ERROR', 'session-end-reminder.cjs 소스를 찾을 수 없음');
    return;
  }

  const existing = readFileSync(destPath);
  const source = readFileSync(SESSION_END_REMINDER_SRC);
  if (existing === source) {
    log(project.name, 'OK', 'session-end-reminder.cjs 이미 최신');
    return;
  }

  copyFileSync(SESSION_END_REMINDER_SRC, destPath);
  log(project.name, 'COPY', 'session-end-reminder.cjs 복사 완료');
}

// ============================================================
// 3. settings.json Hook 정비
// ============================================================
function fixSettingsJson(project) {
  const settingsPath = path.join(project.root, '.claude', 'settings.json');
  let content = readFileSync(settingsPath);
  if (!content) {
    log(project.name, 'SKIP', 'settings.json not found');
    return;
  }

  let settings;
  try {
    settings = JSON.parse(content);
  } catch (e) {
    log(project.name, 'ERROR', `settings.json 파싱 실패: ${e.message}`);
    return;
  }

  // 비파괴 병합: JINHAK/orchestra Hook만 교체, 프로젝트 고유 Hook 보존
  const standardHooks = getStandardHooks(project);
  settings.hooks = mergeHooksNonDestructive(settings.hooks, standardHooks);

  // allow 규칙 보완 (JabisCert 전용)
  if (project.fixAllow && settings.permissions && settings.permissions.allow) {
    const requiredAllow = [
      'Bash(git * commit *)',
      'Bash(git * push *)',
      'Bash(git fetch *)'
    ];
    requiredAllow.forEach(rule => {
      if (!settings.permissions.allow.includes(rule)) {
        settings.permissions.allow.push(rule);
        log(project.name, 'ADD', `allow 규칙 추가: ${rule}`);
      }
    });
  }

  // env 설정 보존/추가
  if (!settings.env) {
    settings.env = {};
  }
  settings.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1';

  const newContent = JSON.stringify(settings, null, 2) + '\n';
  writeFileSync(settingsPath, newContent);
  log(project.name, 'UPDATE', 'settings.json Hook Node.js 기반으로 정비 완료');
}

// ============================================================
// 4. .gitignore 누락 항목 추가
// ============================================================
function fixGitignore(project) {
  if (!project.fixGitignore) return;

  const gitignorePath = path.join(project.root, '.gitignore');
  let content = readFileSync(gitignorePath);
  if (!content) {
    log(project.name, 'SKIP', '.gitignore not found');
    return;
  }

  let changed = false;
  const requiredEntries = [
    { entry: '.claude/settings.local.json', section: '# Claude Code' },
    { entry: '*vibecoding-ref/', section: '# Claude Code' }
  ];

  requiredEntries.forEach(({ entry }) => {
    if (!content.includes(entry)) {
      content = content.trimEnd() + '\n' + entry + '\n';
      changed = true;
      log(project.name, 'ADD', `.gitignore에 ${entry} 추가`);
    }
  });

  if (changed) {
    writeFileSync(gitignorePath, content);
  }
}

// ============================================================
// 5. .ai/ 폴더 생성 (JabisCert 전용)
// ============================================================
function createAiFolder(project) {
  if (!project.createAiFolder) return;

  const aiDir = path.join(project.root, '.ai');
  if (fs.existsSync(aiDir) && !DRY_RUN) {
    const files = fs.readdirSync(aiDir);
    if (files.length > 0) {
      log(project.name, 'OK', '.ai/ 폴더 이미 존재');
      return;
    }
  }

  const files = {
    'SESSION_LOG.md': `# 세션 작업 기록

> 이 문서는 각 세션에서 수행한 작업 요약을 기록합니다.
> 상세 컨텍스트는 Agent Memory가 자동 관리하므로, 이 문서는 요약 수준으로 유지합니다.
> 세션 종료 시 반드시 업데이트하세요.

---

## YYYY-MM-DD

### 세션 요약
-

### 주요 변경
-

### 커밋
-

---
`,
    'CURRENT_SPRINT.md': `# 현재 진행 중인 작업

> 마지막 업데이트: YYYY-MM-DD

---

## 진행 중 (In Progress)

없음

---

## 대기 중 (Pending)

없음

---

## 최근 완료

없음

---

## 다음 세션 시작 시

1. 이 파일 확인하여 진행 중인 작업 파악
2. 우선순위에 따라 작업 선택
3. 완료 후 이 파일 업데이트
`,
    'DECISIONS.md': `# 아키텍처 의사결정 기록 (ADR)

이 문서는 프로젝트의 주요 기술 의사결정을 ADR(Architecture Decision Record) 형식으로 기록합니다.

---

## 의사결정 변경 이력

| 날짜 | ADR | 변경 내용 |
|------|-----|----------|
`,
    'ARCHITECTURE.md': `# 프로젝트 시스템 아키텍처

> 프로젝트 아키텍처 문서 (작성 필요)

---
`,
    'CONVENTIONS.md': `# 프로젝트 코딩 컨벤션

이 문서는 프로젝트의 코딩 규칙과 네이밍 규칙을 정의합니다.
JINHAK 전사 표준을 기반으로 프로젝트 특화 규칙을 추가합니다.

---
`
  };

  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.join(aiDir, filename);
    writeFileSync(filePath, content);
    log(project.name, 'CREATE', `.ai/${filename}`);
  });
}

// ============================================================
// 메인 실행
// ============================================================
console.log('================================================');
console.log(`  JINHAK 표준 v${STANDARD_VERSION} 일괄 적용 스크립트`);
console.log(`  날짜: ${TODAY}`);
console.log(`  모드: ${DRY_RUN ? 'DRY-RUN (미리보기)' : '실제 적용'}`);
console.log('================================================');
console.log('');

TARGET_PROJECTS.forEach(project => {
  console.log(`--- ${project.name} (${project.root}) ---`);

  if (!fs.existsSync(project.root)) {
    log(project.name, 'SKIP', '프로젝트 경로 없음');
    console.log('');
    return;
  }

  updateClaudeMdMeta(project);
  copySessionBriefing(project);
  copySessionEndReminder(project);
  fixSettingsJson(project);
  fixGitignore(project);
  createAiFolder(project);

  console.log('');
});

// 결과 리포트
console.log('================================================');
console.log('  결과 리포트');
console.log('================================================');
report.forEach(r => console.log(`  ${r}`));
console.log('');
console.log(`총 ${TARGET_PROJECTS.length}개 프로젝트 처리 완료`);
if (DRY_RUN) {
  console.log('');
  console.log('⚠ DRY-RUN 모드였습니다. 실제 적용하려면 --dry-run 없이 실행하세요.');
}
