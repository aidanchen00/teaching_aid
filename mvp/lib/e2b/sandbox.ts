import { Sandbox } from 'e2b';

const VITE_PORT = 5173;
const WORK_DIR = '/home/user/app';

const VITE_TEMPLATE_FILES = [
  {
    path: 'package.json',
    content: JSON.stringify({
      name: 'openpreneurship-generated-app',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite --host 0.0.0.0'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.1',
        vite: '^5.0.0'
      }
    }, null, 2)
  },
  {
    path: 'vite.config.js',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: false,
    allowedHosts: ['.e2b.app', '.e2b.dev', 'localhost', '127.0.0.1'],
  },
})`
  },
  {
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>openpreneurship Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
  },
  {
    path: 'src/main.jsx',
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
  },
  {
    path: 'src/App.jsx',
    content: `function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Building your app...</h1>
      <p>The AI is generating your code.</p>
    </div>
  )
}

export default App`
  },
  {
    path: 'src/index.css',
    content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #1a1a1a; }`
  }
];

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface SandboxState {
  id: string | null;
  previewUrl: string | null;
  status: 'idle' | 'creating' | 'ready' | 'error';
  error?: string;
}

export async function createE2BSandbox(): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  console.log('[E2B] Creating sandbox...');
  const sandbox = await Sandbox.create({ timeoutMs: 3_600_000 }); // 1 hour
  console.log('[E2B] Sandbox ID:', sandbox.sandboxId);

  // Setup project
  await sandbox.commands.run(`mkdir -p ${WORK_DIR}/src`);

  for (const file of VITE_TEMPLATE_FILES) {
    await sandbox.files.write(`${WORK_DIR}/${file.path}`, file.content);
  }

  // Install
  console.log('[E2B] npm install...');
  const install = await sandbox.commands.run(`cd ${WORK_DIR} && npm install`, { timeoutMs: 120_000 });
  if (install.exitCode !== 0) {
    throw new Error('npm install failed: ' + install.stderr);
  }

  // Start vite in background - don't await, just fire
  console.log('[E2B] Starting vite...');
  sandbox.commands.run(`cd ${WORK_DIR} && npm run dev`, { background: true });

  // Give it time to start
  await new Promise(r => setTimeout(r, 5000));

  const host = sandbox.getHost(VITE_PORT);
  const previewUrl = `https://${host}`;
  console.log('[E2B] Preview:', previewUrl);

  return { sandbox, previewUrl };
}

export async function writeFilesToE2BSandbox(
  sandbox: Sandbox,
  files: GeneratedFile[]
): Promise<void> {
  for (const file of files) {
    const dir = file.path.split('/').slice(0, -1).join('/');
    if (dir) await sandbox.commands.run(`mkdir -p ${WORK_DIR}/${dir}`);
    await sandbox.files.write(`${WORK_DIR}/${file.path}`, file.content);
  }
}

export function getPreviewUrl(sandbox: Sandbox): string {
  return `https://${sandbox.getHost(VITE_PORT)}`;
}

// In-memory sandbox storage
const sandboxes = new Map<string, Sandbox>();

export const storeSandbox = (id: string, s: Sandbox) => sandboxes.set(id, s);
export const getSandbox = (id: string) => sandboxes.get(id);
export const killSandbox = async (id: string) => {
  const s = sandboxes.get(id);
  if (s) {
    await s.kill();
    sandboxes.delete(id);
  }
};
