const { spawn } = require('child_process');

const folderPath = process.cwd();
const child = spawn('explorer.exe', [folderPath]);

child.on('error', (err) => {
  console.error('Error spawning:', err);
});

child.on('close', (code) => {
  console.log('Explorer exited with code:', code);
});
