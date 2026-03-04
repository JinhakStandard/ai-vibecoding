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
// 기술 스택 자동 감지
// ─────────────────────────────────────────

function detectTechStack() {
  const stack = { projectName: path.basename(TARGET), description: '', framework: [], language: 'JavaScript', packageManager: 'npm', stateManagement: '', styling: '', database: '', orm: '', buildTool: '', testTool: '', scripts: {} };
  let pkg = null;
  try { pkg = JSON.parse(fs.readFileSync(path.join(TARGET, 'package.json'), 'utf8')); } catch { /* ignore */ }

  if (pkg) {
    if (pkg.name) stack.projectName = pkg.name;
    if (pkg.description) stack.description = pkg.description;
    if (pkg.scripts) stack.scripts = pkg.scripts;
    const deps = Object.keys(pkg.dependencies || {}), devDeps = Object.keys(pkg.devDependencies || {}), allDeps = [...deps, ...devDeps];

    if (deps.includes('next')) stack.framework.push('Next.js');
    if (deps.includes('react') && !deps.includes('next')) stack.framework.push('React');
    if (deps.includes('@nestjs/core')) stack.framework.push('NestJS');
    if (deps.includes('express')) stack.framework.push('Express');
    if (deps.includes('fastify')) stack.framework.push('Fastify');
    if (deps.includes('nuxt')) stack.framework.push('Nuxt');
    if (deps.includes('vue')) stack.framework.push('Vue');

    if (allDeps.includes('typescript') || fs.existsSync(path.join(TARGET, 'tsconfig.json'))) stack.language = 'TypeScript';

    if (deps.includes('zustand')) stack.stateManagement = 'Zustand';
    else if (deps.includes('@reduxjs/toolkit') || deps.includes('redux')) stack.stateManagement = 'Redux';
    else if (deps.includes('recoil')) stack.stateManagement = 'Recoil';
    else if (deps.includes('jotai')) stack.stateManagement = 'Jotai';

    if (allDeps.includes('tailwindcss')) stack.styling = 'Tailwind CSS';
    else if (allDeps.includes('styled-components')) stack.styling = 'styled-components';
    else if (allDeps.includes('@emotion/react')) stack.styling = 'Emotion';
    else if (allDeps.includes('sass') || allDeps.includes('node-sass')) stack.styling = 'Sass/SCSS';

    if (deps.includes('pg')) stack.database = 'PostgreSQL';
    else if (deps.includes('mssql') || deps.includes('tedious')) stack.database = 'MSSQL';
    else if (deps.includes('mysql2') || deps.includes('mysql')) stack.database = 'MySQL';
    else if (deps.includes('mongodb') || deps.includes('mongoose')) stack.database = 'MongoDB';

    if (deps.includes('@prisma/client') || devDeps.includes('prisma')) stack.orm = 'Prisma';
    else if (deps.includes('drizzle-orm')) stack.orm = 'Drizzle';
    else if (deps.includes('typeorm')) stack.orm = 'TypeORM';

    if (allDeps.includes('vite')) stack.buildTool = 'Vite';
    else if (allDeps.includes('webpack')) stack.buildTool = 'Webpack';
    else if (allDeps.includes('esbuild')) stack.buildTool = 'esbuild';

    if (allDeps.includes('vitest')) stack.testTool = 'Vitest';
    else if (allDeps.includes('jest')) stack.testTool = 'Jest';
    else if (allDeps.includes('mocha')) stack.testTool = 'Mocha';
    else if (allDeps.includes('playwright')) stack.testTool = 'Playwright';
  }

  if (fs.existsSync(path.join(TARGET, 'pnpm-lock.yaml'))) stack.packageManager = 'pnpm';
  else if (fs.existsSync(path.join(TARGET, 'yarn.lock'))) stack.packageManager = 'yarn';
  else if (fs.existsSync(path.join(TARGET, 'bun.lockb')) || fs.existsSync(path.join(TARGET, 'bun.lock'))) stack.packageManager = 'bun';
  if (fs.existsSync(path.join(TARGET, 'tsconfig.json'))) stack.language = 'TypeScript';

  return stack;
}

function generateFolderTree() {
  try {
    const entries = fs.readdirSync(TARGET, { withFileTypes: true })
      .filter(e => !(e.name.startsWith('.') && e.name !== '.ai' && e.name !== '.claude') && e.name !== 'node_modules')
      .sort((a, b) => a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? -1 : 1);
    return entries.map((e, i) => (i === entries.length - 1 ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ') + e.name + (e.isDirectory() ? '/' : '')).join('\n');
  } catch { return '[프로젝트 폴더 구조를 여기에 작성]'; }
}

function applyStackToTemplate(template, stack, version) {
  const today = new Date().toISOString().split('T')[0];
  template = template.replace(/\r\n/g, '\n');
  const metaStart = template.indexOf('<!-- JINHAK Standard Metadata');
  if (metaStart > 0) template = template.substring(metaStart);

  template = template.replace(/jinhak_standard_version:\s*[\d.]+/, 'jinhak_standard_version: ' + version);
  template = template.replace('[YYYY-MM-DD]', today);
  template = template.replace(/\[표준 저장소 URL[^\]]*\]/, 'https://github.com/JinhakStandard/ai-vibecoding');
  template = template.replace(/\[프로젝트명\]/g, stack.projectName);
  template = template.replace(/\[프로젝트 한 줄 설명\]/, stack.description || '<!-- TODO: 프로젝트 설명을 작성하세요 -->');
  template = template.replace(/\[프로젝트 폴더 구조를 여기에 작성\]/, generateFolderTree());

  const fw = stack.framework.length > 0 ? stack.framework.join(' + ') : '-';
  template = template.replace(/\[React \/ Next\.js \/ Express \/ NestJS 등\]/, fw);
  template = template.replace(/\[JavaScript \/ TypeScript\]/, stack.language);
  template = template.replace(/\[pnpm \/ npm \/ yarn\]/, stack.packageManager);
  template = template.replace(/\[Zustand \/ Redux 등\]/, stack.stateManagement || '-');
  template = template.replace(/\[Tailwind CSS \/ CSS Modules 등\]/, stack.styling || '-');
  template = template.replace(/\[PostgreSQL \/ MySQL \/ MongoDB 등\]/, stack.database || '-');
  template = template.replace(/\[Prisma \/ Drizzle \/ TypeORM 등\]/, stack.orm || '-');
  template = template.replace(/\[Vite \/ Webpack \/ Turbopack 등\]/, stack.buildTool || '-');

  const pm = stack.packageManager, s = stack.scripts, run = pm === 'npm' ? 'npm run' : pm;
  template = template.replace(/\[pnpm install\]/g, pm === 'npm' ? 'npm install' : `${pm} install`);
  template = template.replace(/\[pnpm dev\]/, s.dev ? `${run} dev` : `# ${run} dev (스크립트 미정의)`);
  template = template.replace(/\[pnpm build\]/g, s.build ? `${run} build` : `# ${run} build (스크립트 미정의)`);
  template = template.replace(/\[pnpm test\]/, s.test ? `${run} test` : `# ${run} test (스크립트 미정의)`);
  template = template.replace(/\[pnpm typecheck\]/, s.typecheck ? `${run} typecheck` : (stack.language === 'TypeScript' ? 'npx tsc --noEmit' : `# TypeScript 미사용`));
  template = template.replace(/\[pnpm lint\]/, s.lint ? `${run} lint` : `# ${run} lint (스크립트 미정의)`);
  template = template.replace(/### 5\. \[프로젝트 특화 규칙\]\n- \[규칙 1 설명\]\n- \[규칙 2 설명\]\n- \[규칙 3 설명\]/, '### 5. 프로젝트 특화 규칙\n<!-- TODO: 프로젝트에 맞는 규칙을 추가하세요 -->\n- (규칙 추가 필요)');
  template = template.replace(/\[apps\/\*\/node_modules packages\/\*\/node_modules\]/, '');

  return template;
}

function generateAiContent(filename, stack, version) {
  const today = new Date().toISOString().split('T')[0];
  const fw = stack.framework.length > 0 ? stack.framework.join(' + ') : '미감지';

  switch (filename) {
    case 'SESSION_LOG.md':
      return `# 세션 작업 기록\n\n> 세션 종료 시 반드시 업데이트하세요.\n\n---\n\n## ${today}\n\n### 세션 요약\n- JINHAK AI 개발 표준 v${version} 적용\n\n### 주요 변경\n- \`CLAUDE.md\` - AI 협업 설정 파일 생성\n- \`.claude/\` - Claude Code 설정 복사\n- \`.ai/\` - 프로젝트 문서화 폴더 초기화\n\n### 커밋\n- (표준 적용 커밋 필요)\n\n---\n`;
    case 'CURRENT_SPRINT.md':
      return `# 현재 진행 중인 작업\n\n> 마지막 업데이트: ${today}\n\n---\n\n## 진행 중 (In Progress)\n\n없음\n\n---\n\n## 대기 중 (Pending)\n\n### 우선순위 1: CLAUDE.md 프로젝트 특화 내용 보완\n- [ ] 프로젝트 설명 작성\n- [ ] 프로젝트 특화 규칙 추가\n\n---\n\n## 최근 완료\n\n### ${today}\n- [x] JINHAK AI 개발 표준 v${version} 적용\n\n---\n`;
    case 'DECISIONS.md':
      return `# 아키텍처 의사결정 기록 (ADR)\n\n---\n\n## ADR-001: 기술 스택 선정\n\n### 상태\n승인됨 (${today.substring(0, 7)})\n\n### 컨텍스트\n- ${stack.projectName} 프로젝트의 기술 스택 결정\n\n### 결정\n| 항목 | 선택 |\n|------|------|\n| 프레임워크 | ${fw} |\n| 언어 | ${stack.language} |\n| 패키지 매니저 | ${stack.packageManager} |${stack.stateManagement ? '\n| 상태관리 | ' + stack.stateManagement + ' |' : ''}${stack.database ? '\n| DB | ' + stack.database + ' |' : ''}${stack.orm ? '\n| ORM | ' + stack.orm + ' |' : ''}${stack.buildTool ? '\n| 빌드 | ' + stack.buildTool + ' |' : ''}${stack.testTool ? '\n| 테스트 | ' + stack.testTool + ' |' : ''}\n\n---\n\n## 의사결정 변경 이력\n\n| 날짜 | ADR | 변경 내용 |\n|------|-----|----------|\n| ${today} | ADR-001 | 초기 작성 (CLI 자동 감지) |\n`;
    case 'ARCHITECTURE.md': {
      const lines = [`# ${stack.projectName} 시스템 아키텍처\n\n> ${stack.description || '<!-- TODO: 프로젝트 설명 -->'}\n\n## 기술 스택\n`];
      const front = stack.framework.filter(f => ['React', 'Next.js', 'Vue', 'Nuxt', 'Svelte'].includes(f));
      const back = stack.framework.filter(f => ['Express', 'Fastify', 'NestJS'].includes(f));
      if (front.length) lines.push(`### 프론트엔드\n- **프레임워크**: ${front.join(' + ')}${stack.styling ? '\n- **스타일링**: ' + stack.styling : ''}${stack.stateManagement ? '\n- **상태관리**: ' + stack.stateManagement : ''}\n`);
      if (back.length) lines.push(`### 백엔드\n- **런타임**: Node.js\n- **프레임워크**: ${back.join(' + ')}\n`);
      if (stack.database) lines.push(`### 데이터베이스\n- **DBMS**: ${stack.database}${stack.orm ? '\n- **ORM**: ' + stack.orm : ''}\n`);
      lines.push(`### 빌드 & 개발\n- **언어**: ${stack.language}\n- **패키지 매니저**: ${stack.packageManager}${stack.buildTool ? '\n- **빌드 도구**: ' + stack.buildTool : ''}${stack.testTool ? '\n- **테스트**: ' + stack.testTool : ''}\n\n---\n`);
      return lines.join('\n');
    }
    case 'CONVENTIONS.md': {
      const ext = stack.language === 'TypeScript' ? '.tsx' : '.jsx';
      return `# ${stack.projectName} 코딩 컨벤션\n\nJINHAK 전사 표준 기반.\n\n---\n\n## 네이밍 규칙\n\n| 유형 | 규칙 | 예시 |\n|------|------|------|\n| 컴포넌트 | PascalCase | \`MyComponent${ext}\` |\n| 함수/변수 | camelCase | \`handleSubmit\` |\n| 상수 | UPPER_SNAKE_CASE | \`MAX_RETRY\` |${stack.language === 'TypeScript' ? '\n| 타입 | PascalCase | `UserProfile` |' : ''}\n\n---\n\n## 금지 사항\n\n1. ${stack.language === 'TypeScript' ? '`any` 타입 사용 금지' : '불필요한 타입 강제 변환 금지'}\n2. \`console.log\` 프로덕션 코드 사용 금지\n3. 하드코딩된 URL/포트/비밀키 사용 금지\n4. PUT/PATCH/DELETE HTTP 메서드 사용 금지\n\n---\n`;
    }
    default:
      return `# ${filename.replace('.md', '').replace(/_/g, ' ')}\n\n> 마지막 업데이트: ${today}\n\n---\n`;
  }
}

// ─────────────────────────────────────────
// 메인 커맨드: apply
// ─────────────────────────────────────────

function apply() {
  const version = getLatestVersion();
  const current = getCurrentVersion();
  const stack = detectTechStack();

  log('');
  log(c.bold('JINHAK AI 개발 표준 적용 도구'));
  log(`표준 버전: ${c.cyan('v' + version)}`);
  log(`대상 경로: ${c.cyan(TARGET)}`);
  log('');

  log(c.bold('감지된 기술 스택:'));
  log(`  프로젝트: ${c.cyan(stack.projectName)}`);
  if (stack.description) log(`  설명: ${stack.description}`);
  log(`  프레임워크: ${stack.framework.length > 0 ? c.cyan(stack.framework.join(' + ')) : '-'}`);
  log(`  언어: ${c.cyan(stack.language)}  |  패키지 매니저: ${c.cyan(stack.packageManager)}`);
  if (stack.stateManagement) log(`  상태관리: ${stack.stateManagement}`);
  if (stack.styling) log(`  스타일링: ${stack.styling}`);
  if (stack.database) log(`  DB: ${stack.database}${stack.orm ? ' + ' + stack.orm : ''}`);
  if (stack.buildTool) log(`  빌드: ${stack.buildTool}`);
  if (stack.testTool) log(`  테스트: ${stack.testTool}`);
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

  // 6. .ai/ 폴더 (기술 스택 기반 의미있는 초기 내용)
  const aiFiles = ['SESSION_LOG.md', 'CURRENT_SPRINT.md', 'DECISIONS.md', 'ARCHITECTURE.md', 'CONVENTIONS.md'];
  const aiDir = path.join(TARGET, '.ai');
  fs.mkdirSync(aiDir, { recursive: true });
  for (const f of aiFiles) {
    const dest = path.join(aiDir, f);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, generateAiContent(f, stack, version), 'utf8');
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

  // 8. CLAUDE.md (기술 스택 자동 치환)
  const claudeMdDest = path.join(TARGET, 'CLAUDE.md');
  const claudeTemplateSrc = path.join(STANDARD_ROOT, 'templates', 'project-claude.md');
  if (!fs.existsSync(claudeMdDest)) {
    if (fs.existsSync(claudeTemplateSrc)) {
      let template = fs.readFileSync(claudeTemplateSrc, 'utf8');
      template = applyStackToTemplate(template, stack, version);
      fs.writeFileSync(claudeMdDest, template, 'utf8');
      created.push('CLAUDE.md (기술 스택 자동 감지 적용)');
    }
  } else if (current && current !== version) {
    let claudeContent = fs.readFileSync(claudeMdDest, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    claudeContent = claudeContent.replace(/jinhak_standard_version:\s*[\d.]+/, 'jinhak_standard_version: ' + version);
    claudeContent = claudeContent.replace(/applied_date:\s*[\d-]+/, 'applied_date: ' + today);
    fs.writeFileSync(claudeMdDest, claudeContent, 'utf8');
    created.push('CLAUDE.md (버전 ' + current + ' -> ' + version + ' 업데이트)');
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
  log('  1. CLAUDE.md의 TODO 항목 확인 및 프로젝트에 맞게 수정');
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
