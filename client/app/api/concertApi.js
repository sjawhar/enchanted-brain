import EventEmitter from "events";

let ws = null;
let isConnect = false;
const events = new EventEmitter();

const connect = idToken => {
  if (ws) {
    return;
  }

  isConnect = true;
  ws = new WebSocket(
    "wss://gem4rt4c0j.execute-api.us-east-1.amazonaws.com/Prod",
    null,
    {
      headers: { Authorization: idToken },
    },
  );

  ws.onopen = () => {
    console.log("CONNECTED");
    ws.send(
      JSON.stringify({
        event: "CHOICE_MADE",
        data: {
          choiceType: "CHOICE_COLOR",
          choice: "COLOR_BLUE",
          timestamp: new Date().toISOString(),
        },
      })
    );
    console.log("MESSAGE SENT.");
  };
  ws.onmessage = message => {
    if (!message || !message.data) {
      return;
    }
    console.log("MESSAGE", message.data);
    try {
      const { event, data } = JSON.parse(message.data);
      if (event === 'EVENT_STAGE_CHANGED') {
        console.log('emitting SHOW_COLOR_PICKER event')
        events.emit('SHOW_COLOR_PICKER');
      }
    } catch (error) {
      console.error(error);
    }
  };

  ws.onerror = e => {
    console.error("ERROR", e.message);
  };

  ws.onclose = e => {
    ws = null;
    console.log("CLOSED", e.code, e.reason);
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
}

const send = message => {
  if (!ws) {
    return false
  }

  ws.send(message)
}

export default Object.assign(events, { connect, disconnect, send });
