#!/usr/bin/env node

/**
 * Stop Hook - 세션 로그 미기록 리마인더
 * Claude 응답 완료 시 실행되어, 변경사항이 있지만 SESSION_LOG가 업데이트되지 않은 경우 알림
 */
const fs = require('fs');
const { execSync } = require('child_process');

function exec(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim(); }
  catch { return null; }
}

const today = new Date().toISOString().split('T')[0];

// 1. git diff로 변경사항 존재 여부 확인
const diff = exec('git diff --name-only') || '';
const diffCached = exec('git diff --cached --name-only') || '';
const hasChanges = (diff + diffCached).trim().length > 0;

if (!hasChanges) process.exit(0); // 변경사항 없으면 종료

// 2. SESSION_LOG.md에 오늘 날짜 엔트리 존재 여부 확인
try {
  const log = fs.readFileSync('.ai/SESSION_LOG.md', 'utf-8');
  if (log.includes(`## ${today}`)) process.exit(0); // 이미 기록됨
} catch {
  // 파일 없으면 리마인더 출력
}

// 3. 리마인더 출력
console.log('[SESSION] 미커밋 변경사항이 있습니다. 세션 종료 전 /session-end 또는 .ai/SESSION_LOG.md 업데이트를 권장합니다.');
