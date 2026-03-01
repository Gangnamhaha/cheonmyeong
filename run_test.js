const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx vitest run --reporter=verbose', {
    cwd: 'C:\\saju\\cheonmyeong',
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  fs.writeFileSync('C:\\saju\\cheonmyeong\\vitest_output.txt', output);
  console.log('Vitest completed successfully');
} catch (error) {
  fs.writeFileSync('C:\\saju\\cheonmyeong\\vitest_output.txt', 
    `Error: ${error.message}\nStdout: ${error.stdout}\nStderr: ${error.stderr}`);
  console.log('Vitest completed with error');
}
