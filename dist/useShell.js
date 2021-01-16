"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShell = void 0;
const react_1 = require("react");
const ssh2_1 = require("ssh2");
const useShell = ({ config, window, onClose, onConnect, onData, onError }) => {
    const [stream, setStream] = react_1.useState();
    const connectConfig = Array.isArray(config) ? config : [config];
    const clients = connectConfig.map(() => new ssh2_1.Client());
    const handleError = (error) => {
        if (onError) {
            onError(error);
        }
        else {
            throw error;
        }
    };
    const initShell = () => {
        clients[0].on('error', handleError).connect(connectConfig[0]);
        if (clients.length > 1) {
            for (let i = 0; i < connectConfig.length - 1; i++) {
                clients[i].on('ready', () => {
                    clients[i].forwardOut(connectConfig[i + 1].host || '', Math.floor(Math.random() * (65535 - 49152) + 49152), connectConfig[i + 1].host || '', connectConfig[i + 1].port || 22, (err, s) => {
                        if (err) {
                            if (onError) {
                                onError(err);
                            }
                            clients[i].end();
                        }
                        else {
                            clients[i + 1].on('error', handleError).connect(Object.assign(Object.assign({}, connectConfig[i + 1]), { sock: s }));
                        }
                    });
                });
            }
        }
        clients[clients.length - 1].on('ready', () => {
            clients[clients.length - 1].shell(window, (err, s) => {
                if (err) {
                    if (onError) {
                        onError(err);
                    }
                    clients.length === 1 ? clients[0].end() : clients.forEach((c, index) => index < clients.length - 1 && c.end());
                }
                else {
                    s.on('close', () => {
                        clients.forEach((c) => c.end());
                        if (onClose) {
                            onClose();
                        }
                    }).on('data', (data) => {
                        if (onData) {
                            onData(data);
                        }
                    });
                    setStream(s);
                    if (onConnect) {
                        onConnect();
                    }
                }
            });
        });
    };
    react_1.useEffect(() => {
        return () => {
            if (stream) {
                stream.close();
            }
        };
    }, []);
    return { initShell, stream };
};
exports.useShell = useShell;
