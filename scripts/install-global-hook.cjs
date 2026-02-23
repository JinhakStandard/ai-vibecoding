#!/usr/bin/env node

/**
 * JINHAK AI 개발 표준 - 글로벌 Hook 설치 스크립트
 *
 * 이 스크립트는 ~/.claude/settings.json에 JINHAK 표준 자동 감지 Hook을 설치합니다.
 * 설치 후 모든 프로젝트에서 Claude Code 세션 시작 시 표준 적용 여부가 자동 감지됩니다.
 *
 * 사용법:
 *   node install-global-hook.cjs           # 설치
 *   node install-global-hook.cjs --remove  # 제거
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SCRIPTS_DIR = path.join(CLAUDE_DIR, 'scripts');
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');
const CHECK_SCRIPT_DEST = path.join(SCRIPTS_DIR, 'check-standard.cjs');

// Hook이 실행할 체크 명령어 (Node.js 기반 크로스 플랫폼)
// os.homedir()로 런타임에 홈 경로를 결정하여 어떤 환경에서든 동작
const CHECK_COMMAND = "node -e \"require(require('path').join(require('os').homedir(),'.claude','scripts','check-standard.cjs'))\"";


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
const JINHAK_IDENTIFIER = 'check-standard.cjs';
// 레거시 식별자 (이전 bash 버전 Hook 감지용)
const LEGACY_IDENTIFIER = 'jinhak_standard_version';

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

function isJinhakHook(entry) {
  return entry.hooks?.some(
    (h) => h.command?.includes(JINHAK_IDENTIFIER) || h.command?.includes('check-standard.js') || h.command?.includes(LEGACY_IDENTIFIER)
  );
}

function hasJinhakHook(settings) {
  const hooks = settings.hooks?.UserPromptSubmit;
  if (!Array.isArray(hooks)) return false;
  return hooks.some(isJinhakHook);
}

function copyCheckScript() {
  // scripts 디렉토리 생성
  if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
  }

  // check-standard.cjs를 ~/.claude/scripts/에 복사
  const srcPath = path.join(__dirname, 'check-standard.cjs');
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, CHECK_SCRIPT_DEST);
    console.log(`  스크립트 복사: ${CHECK_SCRIPT_DEST}`);
  } else {
    console.error(`  경고: ${srcPath} 파일을 찾을 수 없습니다.`);
    console.error('  check-standard.cjs가 install-global-hook.cjs와 같은 폴더에 있어야 합니다.');
    process.exit(1);
  }
}

function removeCheckScript() {
  if (fs.existsSync(CHECK_SCRIPT_DEST)) {
    fs.unlinkSync(CHECK_SCRIPT_DEST);
    console.log(`  스크립트 삭제: ${CHECK_SCRIPT_DEST}`);
  }

  // scripts 디렉토리가 비었으면 삭제
  if (fs.existsSync(SCRIPTS_DIR)) {
    const remaining = fs.readdirSync(SCRIPTS_DIR);
    if (remaining.length === 0) {
      fs.rmdirSync(SCRIPTS_DIR);
      console.log(`  빈 디렉토리 삭제: ${SCRIPTS_DIR}`);
    }
  }
}

function isLegacyHook(entry) {
  return entry.hooks?.some(
    (h) => h.command?.includes(LEGACY_IDENTIFIER) || h.command?.includes('check-standard.js')
  );
}

function hasLegacyHook(settings) {
  const hooks = settings.hooks?.UserPromptSubmit;
  if (!Array.isArray(hooks)) return false;
  return hooks.some(isLegacyHook);
}

function install() {
  console.log('\n=== JINHAK AI 개발 표준 - 글로벌 Hook 설치 ===\n');

  const settings = readSettings();

  // 레거시(bash/절대경로) Hook이 있으면 자동 업그레이드
  if (hasLegacyHook(settings)) {
    console.log('  레거시 Hook 감지 → Node.js 기반으로 업그레이드합니다.');
    createBackup();

    settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
      (entry) => !isJinhakHook(entry)
    );
  } else if (hasJinhakHook(settings)) {
    console.log('  이미 최신 버전으로 설치되어 있습니다.');
    // check-standard.cjs만 최신으로 갱신
    copyCheckScript();
    console.log(`  감지 스크립트 갱신 완료: ${CHECK_SCRIPT_DEST}\n`);
    return;
  }

  createBackup();

  // check-standard.cjs 복사
  copyCheckScript();

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
  console.log(`  감지 스크립트: ${CHECK_SCRIPT_DEST}`);
  console.log('');
  console.log('  동작 방식:');
  console.log('  - 모든 프로젝트에서 Claude Code 세션 시작 시 자동 실행 (1회)');
  console.log('  - CLAUDE.md의 jinhak_standard_version 메타정보를 확인');
  console.log('  - 표준 미적용 시 /apply-standard 안내');
  console.log('  - 표준 적용됨 시 session-briefing.cjs 자동 실행 또는 /session-start 안내');
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

  // JINHAK Hook만 제거 (신규 + 레거시 모두)
  settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
    (entry) => !isJinhakHook(entry)
  );

  // 빈 배열이면 정리
  if (settings.hooks.UserPromptSubmit.length === 0) {
    delete settings.hooks.UserPromptSubmit;
  }
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  writeSettings(settings);

  // check-standard.cjs 삭제
  removeCheckScript();

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
