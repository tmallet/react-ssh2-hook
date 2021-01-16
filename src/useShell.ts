import { useEffect, useState } from 'react'
import { Client, ClientChannel, ConnectConfig, PseudoTtyOptions } from 'ssh2'

export interface ShellConfig {
  config: ConnectConfig[] | ConnectConfig
  window: false | PseudoTtyOptions
  onData?: (data: string) => void
  onClose?: () => void
  onError?: (err: Error) => void
  onConnect?: () => void
}

export const useShell = ({ config, window, onClose, onConnect, onData, onError }: ShellConfig) => {
  const [stream, setStream] = useState<ClientChannel>()
  const connectConfig: ConnectConfig[] = Array.isArray(config) ? config : [config]
  const clients: Client[] = connectConfig.map(() => new Client())

  const handleError = (error: Error) => {
    if (onError) {
      onError(error)
    } else {
      throw error
    }
  }

  const initShell = () => {
    clients[0].on('error', handleError).connect(connectConfig[0])

    if (clients.length > 1) {
      for (let i = 0; i < connectConfig.length - 1; i++) {
        clients[i].on('ready', () => {
          clients[i].forwardOut(
            connectConfig[i + 1].host || '',
            Math.floor(Math.random() * (65535 - 49152) + 49152),
            connectConfig[i + 1].host || '',
            connectConfig[i + 1].port || 22,
            (err, s) => {
              if (err) {
                if (onError) {
                  onError(err)
                }
                clients[i].end()
              } else {
                clients[i + 1].on('error', handleError).connect({
                  ...connectConfig[i + 1],
                  sock: s,
                })
              }
            }
          )
        })
      }
    }

    clients[clients.length - 1].on('ready', () => {
      clients[clients.length - 1].shell(window, (err, s) => {
        if (err) {
          if (onError) {
            onError(err)
          }
          clients.length === 1 ? clients[0].end() : clients.forEach((c, index) => index < clients.length - 1 && c.end())
        } else {
          s.on('close', () => {
            clients.forEach((c) => c.end())
            if (onClose) {
              onClose()
            }
          }).on('data', (data: string) => {
            if (onData) {
              onData(data)
            }
          })
          setStream(s)
          if (onConnect) {
            onConnect()
          }
        }
      })
    })
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.close()
      }
    }
  }, [])

  return { initShell, stream }
}
