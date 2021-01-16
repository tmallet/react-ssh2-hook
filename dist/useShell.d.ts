import { ClientChannel, ConnectConfig, PseudoTtyOptions } from 'ssh2';
export interface ShellConfig {
    config: ConnectConfig[] | ConnectConfig;
    window: false | PseudoTtyOptions;
    onData?: (data: string) => void;
    onClose?: () => void;
    onError?: (err: Error) => void;
    onConnect?: () => void;
}
export declare const useShell: ({ config, window, onClose, onConnect, onData, onError }: ShellConfig) => {
    initShell: () => void;
    stream: ClientChannel;
};
