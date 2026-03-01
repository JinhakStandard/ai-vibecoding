/**
 * prompt-track.cjs
 * PostToolUse Hook — 프롬프트 사용 시 JABIS API에 자동 트래킹
 *
 * 환경변수:
 *   JABIS_API_URL    - JABIS API Gateway URL (기본값: https://jabis-api.jinhakapply.com)
 *   PROMPT_API_KEY   - 프롬프트 API Key
 *
 * 동작:
 *   - Edit/Write 도구 실행 후, 변경된 파일이 prompts/ 하위이면 'use' 이벤트 기록
 *   - 실패 시 무시 (사용자 워크플로우 차단 방지)
 */

const https = require('https');
const http = require('http');
const path = require('path');

const API_URL = process.env.JABIS_API_URL || 'https://jabis-api.jinhakapply.com';
const API_KEY = process.env.PROMPT_API_KEY || '';

// stdin에서 도구 실행 정보 읽기
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || data.tool_input?.path || '';

    // prompts/ 하위 파일 변경인지 확인
    if (!filePath || !filePath.includes('prompts/')) return;

    // _template 폴더는 제외
    if (filePath.includes('_template/')) return;

    // 프롬프트 ID 추출 (prompts/{category}/{id}/ 패턴)
    const parts = filePath.split('/');
    const promptsIdx = parts.indexOf('prompts');
    if (promptsIdx < 0 || promptsIdx + 2 >= parts.length) return;

    const promptId = parts[promptsIdx + 2];
    if (!promptId) return;

    // API Key가 없으면 무시
    if (!API_KEY) return;

    // 트래킹 API 호출
    const body = JSON.stringify({
      action: 'track',
      prompt_id: promptId,
      event: 'use',
      context: {
        project: path.basename(process.cwd()),
        source: 'claude-code-hook',
      },
    });

    const url = new URL(`${API_URL}/api/prompts`);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Api-Key': API_KEY,
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 3000,
      },
      () => {
        // 응답 무시 (fire-and-forget)
      }
    );

    req.on('error', () => {
      // 실패 시 무시
    });

    req.write(body);
    req.end();
  } catch {
    // JSON 파싱 실패 등 무시
  }
});
