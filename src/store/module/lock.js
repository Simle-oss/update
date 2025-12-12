const key = "lock-password";
const lock = {
  state: {
    isLock: !!sessionStorage.getItem(key),
  },
  mutations: {
    updateLock(state, pwd) {
      if (pwd) {
        sessionStorage.setItem(key, pwd);
        state.isLock = true;
      } else {
        sessionStorage.removeItem(key);
        state.isLock = false;
      }
    },
  },
};

export default lock;
