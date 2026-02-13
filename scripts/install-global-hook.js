#!/usr/bin/env node

/**
 * JINHAK AI 개발 표준 - 글로벌 Hook 설치 스크립트
 *
 * 이 스크립트는 ~/.claude/settings.json에 JINHAK 표준 자동 감지 Hook을 설치합니다.
 * 설치 후 모든 프로젝트에서 Claude Code 세션 시작 시 표준 적용 여부가 자동 감지됩니다.
 *
 * 사용법:
 *   node install-global-hook.js           # 설치
 *   node install-global-hook.js --remove  # 제거
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');

// Hook이 실행할 체크 명령어 (Git Bash 호환)
const CHECK_COMMAND = [
  'v=$(sed -n \'s/.*jinhak_standard_version: *//p\' CLAUDE.md 2>/dev/null | tr -d \' \\r\\n\');',
  'if [ -n "$v" ]; then',
  '  node .claude/scripts/session-briefing.js 2>/dev/null || echo "[JINHAK 표준 v${v} 감지] /session-start 를 실행하세요.";',
  'elif [ -f CLAUDE.md ]; then',
  '  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";',
  '  echo "!!  [JINHAK 표준 미적용]                        !!";',
  '  echo "!!  CLAUDE.md는 있으나 표준 메타정보가 없음     !!";',
  '  echo "!!                                              !!";',
  '  echo "!!  반드시 /apply-standard 를 실행하여          !!";',
  '  echo "!!  JINHAK AI 개발 표준을 적용하세요!           !!";',
  '  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";',
  'else',
  '  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";',
  '  echo "!!  [JINHAK 표준 미적용]                        !!";',
  '  echo "!!                                              !!";',
  '  echo "!!  반드시 /apply-standard 를 실행하여          !!";',
  '  echo "!!  JINHAK AI 개발 표준을 적용하세요!           !!";',
  '  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";',
  'fi',
].join(' ');

const JINHAK_HOOK_ENTRY = {
  matcher: '',
  hooks: [
    {
      type: 'command',
      command: CHECK_COMMAND,
      once: true,
    },
  ],
};

// JINHAK Hook 식별자 (이 문자열이 command에 포함되면 JINHAK Hook으로 간주)
const JINHAK_IDENTIFIER = 'jinhak_standard_version';

function readSettings() {
  if (fs.existsSync(SETTINGS_PATH)) {
    const content = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(content);
  }
  return {};
}

function writeSettings(settings) {
  if (!fs.existsSync(CLAUDE_DIR)) {
    fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
}

function createBackup() {
  if (fs.existsSync(SETTINGS_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = SETTINGS_PATH + '.backup-' + timestamp;
    fs.copyFileSync(SETTINGS_PATH, backupPath);
    console.log(`  백업 생성: ${backupPath}`);
    return backupPath;
  }
  return null;
}

function hasJinhakHook(settings) {
  const hooks = settings.hooks?.UserPromptSubmit;
  if (!Array.isArray(hooks)) return false;
  return hooks.some((entry) =>
    entry.hooks?.some((h) => h.command?.includes(JINHAK_IDENTIFIER))
  );
}

function install() {
  console.log('\n=== JINHAK AI 개발 표준 - 글로벌 Hook 설치 ===\n');

  const settings = readSettings();

  if (hasJinhakHook(settings)) {
    console.log('  이미 설치되어 있습니다. 재설치하려면 --remove 후 다시 실행하세요.');
    console.log(`  설정 파일: ${SETTINGS_PATH}\n`);
    return;
  }

  createBackup();

  // hooks 구조 확보
  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks.UserPromptSubmit)) {
    settings.hooks.UserPromptSubmit = [];
  }

  // JINHAK Hook 추가
  settings.hooks.UserPromptSubmit.push(JINHAK_HOOK_ENTRY);

  writeSettings(settings);

  console.log('  설치 완료!\n');
  console.log(`  설정 파일: ${SETTINGS_PATH}`);
  console.log('');
  console.log('  동작 방식:');
  console.log('  - 모든 프로젝트에서 Claude Code 세션 시작 시 자동 실행 (1회)');
  console.log('  - CLAUDE.md의 jinhak_standard_version 메타정보를 확인');
  console.log('  - 표준 미적용 시 /apply-standard 안내');
  console.log('  - 표준 적용됨 시 /session-start 안내');
  console.log('');
}

function remove() {
  console.log('\n=== JINHAK AI 개발 표준 - 글로벌 Hook 제거 ===\n');

  const settings = readSettings();

  if (!hasJinhakHook(settings)) {
    console.log('  JINHAK Hook이 설치되어 있지 않습니다.\n');
    return;
  }

  createBackup();

  // JINHAK Hook만 제거
  settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
    (entry) => !entry.hooks?.some((h) => h.command?.includes(JINHAK_IDENTIFIER))
  );

  // 빈 배열이면 정리
  if (settings.hooks.UserPromptSubmit.length === 0) {
    delete settings.hooks.UserPromptSubmit;
  }
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  writeSettings(settings);

  console.log('  제거 완료!\n');
  console.log(`  설정 파일: ${SETTINGS_PATH}\n`);
}

// 실행
const args = process.argv.slice(2);
if (args.includes('--remove') || args.includes('-r')) {
  remove();
} else {
  install();
}
