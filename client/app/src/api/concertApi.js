import EventEmitter from 'events';
import { WEBSOCKET_API_URL, WEBSOCKET_API_STUB } from 'react-native-dotenv';
import { Auth } from 'aws-amplify';

let ws = null;
let isConnect = false;
const events = new EventEmitter();

const isStub = WEBSOCKET_API_STUB !== 'false';

const retryQueue = [];

const connect = async () => {
  isConnect = true;

  if (isStub) {
    const { eventData, storeActions } = require('./stub').default[WEBSOCKET_API_STUB](new Date());
    if (storeActions) {
      const { store } = require('../state');
      storeActions.forEach(store.dispatch);
    }
    events.emit('EVENT_STAGE_CHANGED', eventData);
    return;
  } else if (ws) {
    return;
  }

  const idToken = (await Auth.currentSession()).getIdToken().getJwtToken();
  const websocket = new WebSocket(`${WEBSOCKET_API_URL}?token=${idToken.split('.').pop()}`, null, {
    headers: { Authorization: idToken },
  });

  websocket.onopen = () => {
    console.debug('CONNECTED');
    ws = websocket;
    while (ws && retryQueue.length > 0) {
      ws.send(retryQueue.shift());
    }
  };
  websocket.onmessage = message => {
    if (!message || !message.data) {
      return;
    }
    try {
      const { event, data } = JSON.parse(message.data);
      console.debug('MESSAGE', event, data);
      events.emit(event, data);
    } catch (error) {
      console.error(error);
    }
  };

  websocket.onerror = e => {
    console.error('ERROR', e.message);
  };

  websocket.onclose = e => {
    ws = null;
    console.debug('CLOSED', e.code, e.reason);
    if (isConnect) {
      connect();
    }
  };
};

const disconnect = () => {
  isConnect = false;
  if (!ws) {
    return;
  }
  ws.close();
};

const send = message => {
  if (isStub) {
    console.log('SEND', message);
    return;
  }

  const data = JSON.stringify(message);
  if (!ws) {
    retryQueue.push(data);
    return false;
  }

  ws.send(data);
};

const isConnected = () => isConnect;

export default Object.assign(events, { connect, disconnect, send, isConnected });
