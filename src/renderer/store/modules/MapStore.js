const state = {
  mymap: null,
};
const getters = {
  mymap: state => state.mymap,
};

const mutations = {
  setMymap(state, newMap) {
    state.mymap = newMap;
  },
};

const actions = {};

export default {
  state,
  getters,
  mutations,
  actions,
};
