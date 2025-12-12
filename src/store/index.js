import Vue from "vue";
import Vuex from "vuex";
import layout from "./module/layout";
import facility from "./module/facility";
import lock from "./module/lock";
import user from "./module/user";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    layout,
    facility,
    lock,
    user,
    myData: [],  // 存储数据
    paperToPPTData: ''
  },
   state: {
    layout: {
      cachedViews: []
    }
  },
  mutations: {
    setData(state, data) {
      state.myData = data;
    }
  },
   addCachedView(state, viewName) {
      if (!state.layout.cachedViews.includes(viewName)) {
        state.layout.cachedViews.push(viewName);
      }
    },
    removeCachedView(state, viewName) {
      const index = state.layout.cachedViews.indexOf(viewName);
      if (index > -1) {
        state.layout.cachedViews.splice(index, 1);
      }
    },
  actions: {
    updateData({ commit }, data) {
      commit('setData', data);
    }
  }
});

export default store;
  


