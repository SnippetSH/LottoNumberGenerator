import { app, BrowserWindow, ipcMain } from 'electron'
import axios from 'axios'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

export interface LottoData {
  "times": number;
  "numbers": number[];
}

// const _require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
const isDev = VITE_DEV_SERVER_URL ? true : false;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true, // true로 설정 (기본값)
      nodeIntegration: false, // Node.js 직접 접근 금지
    },
  })

  if (isDev) {
    win.webContents.openDevTools()
  }

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

ipcMain.handle('read-lotto-data', async () => {
  let filePath: string;
  filePath = path.join(process.resourcesPath, 'data/lotto.json');
  if (isDev) {
    filePath = path.join(__dirname, '../public/data/lotto.json');
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(error);
    throw error;
  }
})

ipcMain.handle('fetch-lotto-data', async (_, time: number) => {
  try {
    const res = await axios.get(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${time}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
})

ipcMain.handle('update-lotto-data', async (_, data: LottoData) => {
  let filePath: string;
  filePath = path.join(process.resourcesPath, 'data/lotto.json');
  if (isDev) {
    filePath = path.join(__dirname, '../public/data/lotto.json');
  }
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(fileContent);

    parsedData.push(data);

    fs.writeFileSync(filePath, JSON.stringify(parsedData, null, 2), 'utf-8');
  } catch (error) {
    console.error(error);
    throw error;
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
