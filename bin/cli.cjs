#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STANDARD_ROOT = path.resolve(__dirname, '..');
const TARGET = process.cwd();

// 색상 헬퍼
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function log(msg) { console.log(msg); }
function success(msg) { console.log(c.green(`✓ ${msg}`)); }
function warn(msg) { console.log(c.yellow(`⚠ ${msg}`)); }
function error(msg) { console.error(c.red(`✗ ${msg}`)); }

// ─────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────

function getLatestVersion() {
  const changelog = fs.readFileSync(path.join(STANDARD_ROOT, 'CHANGELOG.md'), 'utf8');
  const match = changelog.match(/^## \[(\d+\.\d+(?:\.\d+)?)\]/m);
  return match ? match[1] : null;
}

function getCurrentVersion() {
  const claudeMd = path.join(TARGET, 'CLAUDE.md');
  if (!fs.existsSync(claudeMd)) return null;
  const content = fs.readFileSync(claudeMd, 'utf8');
  const match = content.match(/jinhak_standard_version:\s*(\d+\.\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function ensureGitignoreEntries(entries) {
  const gitignorePath = path.join(TARGET, '.gitignore');
  let content = '';
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf8');
  }
  const lines = content.split('\n');
  const added = [];
  for (const entry of entries) {
    if (!lines.some((l) => l.trim() === entry)) {
      added.push(entry);
    }
  }
  if (added.length > 0) {
    const append = (content.endsWith('\n') ? '' : '\n') + added.join('\n') + '\n';
    fs.writeFileSync(gitignorePath, content + append, 'utf8');
  }
  return added;
}

// ─────────────────────────────────────────
// 메인 커맨드: apply
// ─────────────────────────────────────────

function apply() {
  const version = getLatestVersion();
  const current = getCurrentVersion();

  log('');
  log(c.bold('JINHAK AI 개발 표준 적용 도구'));
  log(`표준 버전: ${c.cyan('v' + version)}`);
  log(`대상 경로: ${c.cyan(TARGET)}`);
  log('');

  if (current) {
    if (current === version) {
      log(`이미 최신 버전 (v${current})이 적용되어 있습니다.`);
      log('파일 무결성만 검증합니다...');
    } else {
      log(`현재 버전: v${current} → 최신: v${version}`);
      log('업데이트를 진행합니다...');
    }
    log('');
  }

  const created = [];

  // 1. .claude/settings.json
  const settingsSrc = path.join(STANDARD_ROOT, '.claude', 'settings.json');
  const settingsDest = path.join(TARGET, '.claude', 'settings.json');
  if (!fs.existsSync(settingsDest)) {
    copyFile(settingsSrc, settingsDest);
    created.push('.claude/settings.json');
  }

  // 2. .claude/scripts/
  const scriptsSrc = path.join(STANDARD_ROOT, '.claude', 'scripts');
  const scriptsDest = path.join(TARGET, '.claude', 'scripts');
  const scriptCount = copyDir(scriptsSrc, scriptsDest);
  if (scriptCount > 0) created.push(`.claude/scripts/ (${scriptCount}개 파일)`);

  // 3. .claude/skills/
  const skillsSrc = path.join(STANDARD_ROOT, '.claude', 'skills');
  const skillsDest = path.join(TARGET, '.claude', 'skills');
  const skillCount = copyDir(skillsSrc, skillsDest);
  if (skillCount > 0) created.push(`.claude/skills/ (${skillCount}개 파일)`);

  // 4. security/
  const secSrc = path.join(STANDARD_ROOT, 'security');
  const secDest = path.join(TARGET, 'security');
  const secCount = copyDir(secSrc, secDest);
  if (secCount > 0) created.push(`security/ (${secCount}개 파일)`);

  // 5. scripts/security-check-hook.cjs
  const hookSrc = path.join(STANDARD_ROOT, 'scripts', 'security-check-hook.cjs');
  const hookDest = path.join(TARGET, 'scripts', 'security-check-hook.cjs');
  if (fs.existsSync(hookSrc) && !fs.existsSync(hookDest)) {
    copyFile(hookSrc, hookDest);
    created.push('scripts/security-check-hook.cjs');
  }

  // 6. .ai/ 폴더
  const aiFiles = [
    'SESSION_LOG.md',
    'CURRENT_SPRINT.md',
    'DECISIONS.md',
    'ARCHITECTURE.md',
    'CONVENTIONS.md',
  ];
  const aiDir = path.join(TARGET, '.ai');
  fs.mkdirSync(aiDir, { recursive: true });
  for (const f of aiFiles) {
    const dest = path.join(aiDir, f);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, `# ${f.replace('.md', '').replace(/_/g, ' ')}\n\n> 마지막 업데이트: ${new Date().toISOString().split('T')[0]}\n\n---\n`, 'utf8');
      created.push(`.ai/${f}`);
    }
  }

  // 7. .gitignore
  const gitignoreAdded = ensureGitignoreEntries([
    'CLAUDE.local.md',
    '.claude/settings.local.json',
    '.env',
    '.env.local',
    '.env.*.local',
    '*vibecoding-ref/',
  ]);
  if (gitignoreAdded.length > 0) {
    created.push(`.gitignore (+${gitignoreAdded.length}개 항목)`);
  }

  // 8. CLAUDE.md
  const claudeMdDest = path.join(TARGET, 'CLAUDE.md');
  const claudeTemplateSrc = path.join(STANDARD_ROOT, 'templates', 'project-claude.md');
  if (!fs.existsSync(claudeMdDest)) {
    // 신규 프로젝트: 템플릿에서 생성
    if (fs.existsSync(claudeTemplateSrc)) {
      let template = fs.readFileSync(claudeTemplateSrc, 'utf8');
      const today = new Date().toISOString().split('T')[0];

      // 템플릿 헤더(사용법 안내) 제거
      const metaStart = template.indexOf('<!-- JINHAK Standard Metadata');
      if (metaStart > 0) template = template.substring(metaStart);

      // 메타데이터 치환
      template = template.replace(/jinhak_standard_version:\s*[\d.]+/, 'jinhak_standard_version: ' + version);
      template = template.replace('[YYYY-MM-DD]', today);
      template = template.replace(
        /\[표준 저장소 URL[^\]]*\]/,
        'https://github.com/JinhakStandard/ai-vibecoding'
      );

      // package.json에서 프로젝트명 감지
      const pkgPath = path.join(TARGET, 'package.json');
      let projectName = path.basename(TARGET);
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.name) projectName = pkg.name;
        } catch (e) { /* ignore */ }
      }
      template = template.replace(/\[프로젝트명\]/g, projectName);

      fs.writeFileSync(claudeMdDest, template, 'utf8');
      created.push('CLAUDE.md (템플릿에서 생성 — [대괄호] 내용 수정 필요)');
    }
  } else if (current && current !== version) {
    // 기존 프로젝트: 버전 메타데이터만 업데이트
    let claudeContent = fs.readFileSync(claudeMdDest, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    claudeContent = claudeContent.replace(
      /jinhak_standard_version:\s*[\d.]+/,
      'jinhak_standard_version: ' + version
    );
    claudeContent = claudeContent.replace(
      /applied_date:\s*[\d-]+/,
      'applied_date: ' + today
    );
    fs.writeFileSync(claudeMdDest, claudeContent, 'utf8');
    created.push('CLAUDE.md (버전 ' + current + ' → ' + version + ' 업데이트)');
  }

  // 9. prompts/
  const promptsSrc = path.join(STANDARD_ROOT, 'prompts');
  const promptsDest = path.join(TARGET, 'prompts');
  if (fs.existsSync(promptsSrc)) {
    const promptCount = copyDir(promptsSrc, promptsDest);
    if (promptCount > 0) created.push('prompts/ (' + promptCount + '개 파일)');
  }

  // 결과 출력
  log('');
  if (created.length > 0) {
    success(`${created.length}개 항목 생성/업데이트:`);
    for (const f of created) {
      log(`  ${c.green('+')} ${f}`);
    }
  } else {
    success('모든 파일이 최신 상태입니다.');
  }

  log('');
  log(c.bold('다음 단계:'));
  log('  1. CLAUDE.md의 [대괄호] 내용을 프로젝트 정보로 수정');
  log('  2. Claude Code 세션 재시작 (settings.json 반영)');
  log('  3. /session-start 로 세션 시작');
  log('');
  log(c.cyan('사용 가능한 명령어:'));
  log('  /session-start    세션 시작');
  log('  /commit           커밋 생성');
  log('  /review-pr        PR 리뷰');
  log('  /security-check   보안 점검');
  log('  /deep-plan        심층 계획');
  log('  /debug            체계적 디버깅');
  log('');
}

// ─────────────────────────────────────────
// 메인 커맨드: info
// ─────────────────────────────────────────

function info() {
  const version = getLatestVersion();
  const current = getCurrentVersion();
  log('');
  log(c.bold('JINHAK AI 개발 표준'));
  log(`  표준 최신 버전: ${c.cyan('v' + version)}`);
  if (current) {
    log(`  프로젝트 버전:  ${current === version ? c.green('v' + current + ' (최신)') : c.yellow('v' + current + ' → v' + version + ' 업데이트 가능')}`);
  } else {
    log(`  프로젝트 버전:  ${c.yellow('미적용')}`);
  }
  log(`  저장소: https://github.com/JinhakStandard/ai-vibecoding`);
  log('');
}

// ─────────────────────────────────────────
// 메인 커맨드: link (심볼릭 대신 /tmp에 복사)
// ─────────────────────────────────────────

function link() {
  const dest = '/tmp/jinhak-standards';
  if (fs.existsSync(dest)) {
    log(`이미 ${dest}가 존재합니다.`);
  } else {
    copyDir(STANDARD_ROOT, dest);
    success(`${dest} 에 표준 파일 복사 완료`);
  }
  log('이제 /apply-standard 스킬이 이 경로를 참조합니다.');
}

// ─────────────────────────────────────────
// CLI 라우팅
// ─────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0] || 'apply';

switch (command) {
  case 'apply':
    apply();
    break;
  case 'info':
    info();
    break;
  case 'link':
    link();
    break;
  case 'help':
  case '--help':
  case '-h':
    log('');
    log(c.bold('jinhak-ai-standard - JINHAK AI 개발 표준 적용 도구'));
    log('');
    log('사용법:');
    log('  npx jinhak-ai-standard [command]');
    log('');
    log('명령어:');
    log('  apply   표준을 현재 프로젝트에 적용 (기본값)');
    log('  info    현재 프로젝트의 표준 적용 상태 확인');
    log('  link    /tmp/jinhak-standards에 표준 파일 복사 (스킬 호환용)');
    log('  help    이 도움말 표시');
    log('');
    break;
  default:
    error(`알 수 없는 명령: ${command}`);
    log('npx jinhak-ai-standard help 로 사용법을 확인하세요.');
    process.exit(1);
}
