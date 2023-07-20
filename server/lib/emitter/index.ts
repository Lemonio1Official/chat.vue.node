type events = Record<string, cb>;
type cb = (...args: any[]) => void;

interface IEmitter {
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, cb: cb) => void;
  once: (event: string, cb: cb) => void;
  removeEvent: (event: string) => void;
}

interface IEvents {
  events: events;
  once: (keyof events)[];
  emitter: IEmitter;
}

const events: IEvents = {
  events: {},
  once: [],
  emitter: {
    emit(event, args) {
      if (!events.events[event]) return undefined;
      events.events[event](args);
      if (events.once.find((i) => i === event)) {
        delete events.events[event];
        events.once = events.once.filter((i) => i !== event);
      }
    },
    on(event, cb) {
      events.events[event] = cb;
    },
    once(event, cb) {
      events.events[event] = cb;
      events.once.push(event);
    },
    removeEvent(event) {
      delete events.events[event];
    },
  },
};

export default events.emitter;
