## Description

React hook to init shell connection via ssh.

## Requirements
* [node.js](http://nodejs.org/) -- v10.16.0 or newer
# Installation
Using npm:

    npm install react-ssh2-hook
Using yarn:

    yarn add react-ssh2-hook
## Get started
### Simple example
```typescript
const { initShell, stream } = useShell({
  // See ssh2 lib documentation
  config: {host: 'host', username: 'username', password: 'password'},
  window: { term: 'xterm-256color' },
  onConnect: () => console.log('connected'),
  onData: (data: string) => console.log(data),
  onClose: () => console.log('closed'),
  onError: (err: Error) => console.error(err),
});
```
### Connection hopping
```typescript
const { initShell, stream } = useShell({
  // Pass an array of SSH2 ConnectConfig
  config: [
      {host: 'host1', username: 'username1', password: 'password1'},
      {host: 'host2', username: 'username2', password: 'password2'}
  ],
  window: { term: 'xterm-256color' },
});
```
