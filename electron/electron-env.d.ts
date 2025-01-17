/// <reference types="vite-plugin-electron/electron-env" />

import type { IpcRenderer, IpcRendererEvent } from 'electron'
import type { LottoData } from './main'

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
declare global {

interface Window {
    ipcRenderer: {
      // 원본 ipcRenderer on/off/send/invoke를 우리가 한 번 감싼 형태
      on(...args: Parameters<IpcRenderer['on']>): ReturnType<IpcRenderer['on']>
      off(...args: Parameters<IpcRenderer['off']>): ReturnType<IpcRenderer['off']>
      send(...args: Parameters<IpcRenderer['send']>): ReturnType<IpcRenderer['send']>
      invoke(...args: Parameters<IpcRenderer['invoke']>): ReturnType<IpcRenderer['invoke']>

      // 추가한 커스텀 메서드들
      fetchLottoData(time: number): Promise<any>   // 실제 반환 타입 맞춰서 any 대신 변경
      updateLottoData(data: LottoData): void // 마찬가지로 반환 타입 맞춰서 수정
      readLottoData(): Promise<LottoData[]> // 마찬가지로 반환 타입 맞춰서 수정
    }
  }
}


// import/export 없이 global 선언 시에는 아래처럼 해주면 됩니다
export {}
