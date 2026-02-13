#!/usr/bin/env node

/**
 * JINHAK AI 개발 표준 - 글로벌 Hook용 표준 감지 스크립트
 *
 * ~/.claude/scripts/check-standard.js 에 복사되어
 * 글로벌 UserPromptSubmit Hook에서 실행됩니다.
 *
 * 동작:
 * 1. CLAUDE.md에서 jinhak_standard_version 확인
 * 2. 버전이 있으면 session-briefing.js 위임 실행
 * 3. 버전이 없으면 표준 미적용 경고 출력
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function getStandardVersion() {
  const content = readFile('CLAUDE.md');
  if (!content) return null;
  const match = content.match(/jinhak_standard_version:\s*([\d.]+)/);
  return match ? match[1] : null;
}

// === 메인 ===
const version = getStandardVersion();

if (version) {
  // 표준 적용됨 → session-briefing.js 위임 실행
  const briefingPath = path.join('.claude', 'scripts', 'session-briefing.js');
  if (fs.existsSync(briefingPath)) {
    try {
      execSync(`node "${briefingPath}"`, { stdio: 'inherit', timeout: 10000 });
    } catch {
      console.log(`[JINHAK 표준 v${version} 감지] /session-start 를 실행하세요.`);
    }
  } else {
    console.log(`[JINHAK 표준 v${version} 감지] /session-start 를 실행하세요.`);
  }
} else if (fs.existsSync('CLAUDE.md')) {
  // CLAUDE.md 있으나 메타정보 없음
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!!  [JINHAK 표준 미적용]                        !!');
  console.log('!!  CLAUDE.md는 있으나 표준 메타정보가 없음     !!');
  console.log('!!                                              !!');
  console.log('!!  반드시 /apply-standard 를 실행하여          !!');
  console.log('!!  JINHAK AI 개발 표준을 적용하세요!           !!');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
} else {
  // CLAUDE.md 없음
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!!  [JINHAK 표준 미적용]                        !!');
  console.log('!!                                              !!');
  console.log('!!  반드시 /apply-standard 를 실행하여          !!');
  console.log('!!  JINHAK AI 개발 표준을 적용하세요!           !!');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
