const { execFile } = require('child_process');

execFile('cmd.exe', ['/c', 'start', '""', 'C:\\Does\\Not\\Exist'], (err) => {
  if (err) console.error("Error Code:", err.code);
  else console.log('success');
});
