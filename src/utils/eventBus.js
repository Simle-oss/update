class eventBus {
  constructor() {
    this.events = {};
  }
  on(event, fn) {
    if (!this.events.hasOwnProperty(event)) {
      this.events.event = [];
    }
    this.events.event.push(fn);
  }
  emit(event, ...args) {
    (this.events[event] || []).forEach((fn) => fn(...args));
  }
  off(event, fn) {
    if (this.events[event]) {
      delete this.events[event]
    }
  }
}
export default new eventBus;
