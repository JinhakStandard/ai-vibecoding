#!/usr/bin/env node

/**
 * JINHAK AI 보안 가이드레일 - PreToolUse 보안 검사 Hook
 *
 * 민감 파일 접근, 금지 명령 실행을 감지하여 경고합니다.
 * Claude Code의 PreToolUse Hook에서 실행됩니다.
 *
 * 입력: stdin으로 JSON (Claude Code PreToolUse hook 형식)
 * 출력: 감지 시 {"additionalContext": "[SECURITY WARNING] ..."} JSON을 stdout으로 출력
 *       감지 안 되면 아무것도 출력하지 않음 (빈 출력)
 *
 * 사용법 (.claude/settings.json):
 *   "PreToolUse": [{
 *     "matcher": "",
 *     "hooks": [{
 *       "type": "command",
 *       "command": "node scripts/security-check-hook.cjs"
 *     }]
 *   }]
 */

const SENSITIVE_FILE_PATTERNS = [
  /\.env($|\.)/i,
  /secret/i,
  /credential/i,
  /password/i,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.jks$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.keystore$/i,
];

const DANGEROUS_COMMAND_PATTERNS = [
  /curl\s.*\|\s*sh/i,
  /wget\s.*\|\s*bash/i,
  /curl\s.*\|\s*bash/i,
  /curl\s.*\|\s*zsh/i,
  /wget\s.*\|\s*sh/i,
  /curl\s.*\|\s*node/i,
  /wget\s.*\|\s*node/i,
];

/**
 * stdin에서 JSON 입력을 읽어 파싱
 */
function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
    // 입력이 없는 경우를 위한 타임아웃
    setTimeout(() => resolve(null), 3000);
  });
}

/**
 * 파일 경로가 민감 파일 패턴에 해당하는지 검사
 */
function checkSensitiveFile(filePath) {
  if (!filePath) return null;
  for (const pattern of SENSITIVE_FILE_PATTERNS) {
    if (pattern.test(filePath)) {
      return `민감 파일 접근 감지: "${filePath}" - 이 파일은 비밀 정보를 포함할 수 있습니다. Vault를 통해 관리하세요.`;
    }
  }
  return null;
}

/**
 * 명령어가 금지 패턴에 해당하는지 검사
 */
function checkDangerousCommand(command) {
  if (!command) return null;
  for (const pattern of DANGEROUS_COMMAND_PATTERNS) {
    if (pattern.test(command)) {
      return `위험 명령 감지: 원격 스크립트 파이프 실행("${command.substring(0, 80)}...") - 신뢰할 수 없는 스크립트의 직접 실행은 금지됩니다. 먼저 다운로드 후 내용을 검토하세요.`;
    }
  }
  return null;
}

async function main() {
  const input = await readStdin();
  if (!input) {
    process.exit(0);
  }

  const warnings = [];

  // tool_input에서 파일 경로와 명령어 추출
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.file || toolInput.path || '';
  const command = toolInput.command || '';

  // 1. 민감 파일 접근 검사
  const fileWarning = checkSensitiveFile(filePath);
  if (fileWarning) warnings.push(fileWarning);

  // 2. 명령어 내 민감 파일 참조 검사
  if (command) {
    for (const pattern of SENSITIVE_FILE_PATTERNS) {
      if (pattern.test(command)) {
        warnings.push(`명령어에서 민감 파일 참조 감지: "${command.substring(0, 80)}" - .env, 인증서, 키 파일은 AI 컨텍스트에 노출하지 마세요.`);
        break;
      }
    }
  }

  // 3. 금지 명령 검사
  const cmdWarning = checkDangerousCommand(command);
  if (cmdWarning) warnings.push(cmdWarning);

  // 경고가 있으면 additionalContext로 출력
  if (warnings.length > 0) {
    const message = '[SECURITY WARNING] ' + warnings.join(' | ');
    const output = JSON.stringify({ additionalContext: message });
    process.stdout.write(output);
  }
  // 경고가 없으면 아무것도 출력하지 않음

  process.exit(0);
}

main().catch(() => {
  // 모든 에러는 내부에서 처리, 정상 종료
  process.exit(0);
});
