const { execSync, spawn } = require('child_process');

const port = Number(process.env.PORT || 5000);

function freePort(targetPort) {
  try {
    const output = execSync(`lsof -ti:${targetPort}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();

    if (!output) {
      return;
    }

    const pids = output
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0 && value !== process.pid);

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
    // No process is using this port or lsof not available
  }
}

freePort(port);

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npxCommand, ['nodemon', 'app.js'], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
