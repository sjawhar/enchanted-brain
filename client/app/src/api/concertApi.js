import EventEmitter from 'events';
import config from '../config';

let ws = null;
let isConnect = false;
const events = new EventEmitter();

const connect = idToken => {
  if (ws) {
    return;
  }

  isConnect = true;
  ws = new WebSocket(config.WEBSOCKET_API_URL, null, {
    headers: { Authorization: idToken },
  });

  ws.onopen = () => {
    console.log('CONNECTED');
    ws.send(
      JSON.stringify({
        event: 'CHOICE_MADE',
        data: {
          choiceType: 'CHOICE_COLOR',
          choice: 'COLOR_BLUE',
          timestamp: new Date().toISOString(),
        },
      })
    );
    console.log('MESSAGE SENT.');
  };
  ws.onmessage = message => {
    if (!message || !message.data) {
      return;
    }
    console.log('MESSAGE', message.data);
    try {
      const { event, data } = JSON.parse(message.data);
      if (event === "CONNECTED") {
        events.emit("WEBSOCKET_CONNECTED", data);
      }
      if (event === "EVENT_STAGE_CHANGED") {
        events.emit("STAGE_CHANGED", data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  ws.onerror = e => {
    console.error('ERROR', e.message);
  };

  ws.onclose = e => {
    ws = null;
    console.log('CLOSED', e.code, e.reason);
    if (isConnect) {
      connect(idToken);
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
  if (!ws) {
    return false;
  }

  ws.send(message);
};

export default Object.assign(events, { connect, disconnect, send });
