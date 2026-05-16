const { execSync, spawn } = require('child_process');

const port = Number(process.env.PORT || 5000);

function freePort(targetPort) {
  try {
    let pids = [];
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${targetPort}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString().trim();
      if (!output) return;
      
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4 && line.includes('LISTENING')) {
          const pid = Number(parts[parts.length - 1]);
          if (Number.isInteger(pid) && pid > 0 && pid !== process.pid && !pids.includes(pid)) {
            pids.push(pid);
          }
        }
      }
    } else {
      const output = execSync(`lsof -ti:${targetPort}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString().trim();
      if (!output) return;
      
      pids = output
        .split(/\s+/)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0 && value !== process.pid);
    }

    if (pids.length === 0) {
      return;
    }

    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Ignore individual kill failures
      }
    }

    console.log(`Freed port ${targetPort} by stopping PID(s): ${pids.join(', ')}`);
  } catch {
    // No process is using this port or command failed
  }
}

freePort(port);

const nodemonBin = require.resolve('nodemon/bin/nodemon.js');
const child = spawn(process.execPath, [nodemonBin, 'app.js'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
