#!/usr/bin/env node

/**
 * JINHAK AI 개발 표준 - 세션 브리핑 스크립트
 *
 * UserPromptSubmit Hook에서 실행되어 세션 시작 시 자동으로
 * 프로젝트 상태를 Claude에게 주입합니다.
 *
 * /session-start 스킬의 핵심 동작(1~3단계)을 자동화합니다.
 */

const fs = require('fs');
const { execSync } = require('child_process');

function readFile(filePath, maxLines) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (maxLines) {
      return content.split('\n').slice(0, maxLines).join('\n');
    }
    return content;
  } catch {
    return null;
  }
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

function getStandardVersion() {
  const claude = readFile('CLAUDE.md');
  if (!claude) return null;
  const match = claude.match(/jinhak_standard_version:\s*([\d.]+)/);
  return match ? match[1] : null;
}

function getRecentSessionLog() {
  const log = readFile('.ai/SESSION_LOG.md');
  if (!log) return null;

  // 최근 세션 엔트리 추출 (## YYYY-MM-DD 패턴)
  const entries = log.split(/(?=^## \d{4}-\d{2}-\d{2})/m).filter(e => e.trim());
  if (entries.length <= 1) return log.split('\n').slice(0, 20).join('\n');

  // 최근 1개 세션만
  return entries[entries.length - 1].split('\n').slice(0, 15).join('\n');
}

// === 메인 ===
const output = [];

output.push('========================================');
output.push('  [세션 브리핑] 자동 컨텍스트 로드');
output.push('========================================');
output.push('');

// 1. 현재 스프린트
const sprint = readFile('.ai/CURRENT_SPRINT.md', 30);
if (sprint) {
  output.push('[현재 스프린트]');
  output.push(sprint.trim());
  output.push('');
}

// 2. 최근 작업 기록
const recentLog = getRecentSessionLog();
if (recentLog) {
  output.push('[최근 작업]');
  output.push(recentLog.trim());
  output.push('');
}

// 3. Git 상태
const gitStatus = exec('git status --short');
if (gitStatus) {
  output.push('[미커밋 변경사항]');
  output.push(gitStatus);
  output.push('');
} else {
  output.push('[미커밋 변경사항] 없음');
  output.push('');
}

// 4. 최근 커밋
const gitLog = exec('git log --oneline -5');
if (gitLog) {
  output.push('[최근 커밋]');
  output.push(gitLog);
  output.push('');
}

// 5. 표준 버전
const version = getStandardVersion();
if (version) {
  output.push('[JINHAK 표준] v' + version + ' 적용됨');
  // v2.0 보안 가이드레일 확인
  const vNum = parseFloat(version);
  if (vNum >= 2.0) {
    const securityDir = fs.existsSync('security');
    const securitySkill = fs.existsSync('.claude/skills/security-check/SKILL.md');
    const securityHook = fs.existsSync('scripts/security-check-hook.js');
    if (securityDir && securitySkill) {
      output.push('[보안 가이드레일] v2.0 활성 (/security-check 사용 가능)');
    } else {
      output.push('[보안 가이드레일] v2.0 파일 일부 누락 - /apply-standard로 복구하세요');
    }
  }
} else {
  output.push('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  output.push('!!  [JINHAK 표준 미적용]                        !!');
  output.push('!!  /apply-standard 를 반드시 실행하세요!       !!');
  output.push('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}

output.push('');
output.push('위 컨텍스트를 참고하여 이전 작업 맥락을 이어서 진행하세요.');

console.log(output.join('\n'));
