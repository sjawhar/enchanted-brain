import EventEmitter from 'events';
import { WEBSOCKET_API_URL, WEBSOCKET_API_STUB } from 'react-native-dotenv';
import { Auth } from 'aws-amplify';

let globalWsPromise = null;
let isConnect = false;
const events = new EventEmitter();

const isStub = WEBSOCKET_API_STUB !== 'false';

const retryQueue = [];

const connect = () => {
  isConnect = true;

  if (isStub) {
    const { eventData, storeActions } = require('./stub').default(WEBSOCKET_API_STUB);
    if (storeActions) {
      const { store } = require('../state');
      storeActions.forEach(store.dispatch);
    }
    events.emit('EVENT_STAGE_CHANGED', eventData);
    return;
  } else if (globalWsPromise) {
    return globalWsPromise;
  }

  const wsPromise = new Promise(async (resolve, reject) => {
    const idToken = (await Auth.currentSession()).getIdToken().getJwtToken();
    const ws = new WebSocket(`${WEBSOCKET_API_URL}?token=${idToken.split('.').pop()}`, null, {
      headers: { Authorization: idToken },
    });

    ws.onopen = () => {
      console.debug('CONNECTED');
      if (!wsPromise.resolved) {
        wsPromise.resolved = true;
        resolve(ws);
      }
    };

    ws.onerror = e => {
      console.debug('ERROR', e.message);
    };

    ws.onclose = e => {
      console.debug('CLOSED', e.code, e.reason);
      globalWsPromise = null;
      if (!wsPromise.resolved) {
        wsPromise.resolved = true;
        return reject(e);
      } else if (isConnect) {
        connect();
      }
    };

    ws.onmessage = message => {
      if (!message || !message.data) {
        return;
      }
      try {
        const { event, data } = JSON.parse(message.data);
        console.debug('MESSAGE', event, data);
        events.emit(event, data);
      } catch (error) {
        console.debug(error);
      }
    };
  }).then(ws => {
    const failedQueue = [];
    while (retryQueue.length > 0) {
      const retryMessage = retryQueue.shift();
      try {
        ws.send(retryMessage);
      } catch (error) {
        failedQueue.push(retryMessage);
        break;
      }
    }
    failedQueue.forEach(failedMessage => retryQueue.push(failedMessage));
    return ws;
  });

  globalWsPromise = wsPromise;

  return wsPromise;
};

const disconnect = async () => {
  isConnect = false;
  if (!globalWsPromise) {
    return;
  }

  const ws = await globalWsPromise;
  ws.close();
};

const send = async message => {
  if (isStub) {
    console.debug('SEND', message);
    return;
  }

  const data = JSON.stringify(message);
  try {
    const ws = await connect();
    ws.send(data);
    return true;
  } catch (error) {
    console.debug(error);
    retryQueue.push(data);
    return false;
  }
};

const isConnected = () => isConnect;

export default Object.assign(events, { connect, disconnect, send, isConnected });
