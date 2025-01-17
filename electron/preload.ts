import { ipcRenderer, contextBridge } from 'electron'
import type { LottoData } from './main'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  readLottoData: () => ipcRenderer.invoke('read-lotto-data'),
  fetchLottoData: (time: number) => ipcRenderer.invoke('fetch-lotto-data', time),
  updateLottoData: (data: LottoData) => ipcRenderer.invoke('update-lotto-data', data),

  // You can expose other APTs you need here.
  // ...
})
