import { changeArray } from '@/utils/util.js'

export default {
  namespaced: true,
  state: {
    list: []
  },
  mutations: {
    changeList(state, data) {
      state.list = changeArray(data)
    },
    clearList(state) {
      state.list = []
    }
  },
  actions: {
    getCategoryList(context) {
      const db = uniCloud.database()
      return db
        .collection('goods-category')
        .field('_id,name,parent_id')
        .get()
        .then(({ result }) => {
          context.commit('changeList', result.data)
          return Promise.resolve(result)

        })
    },
    clearCategoryList(context) {
      context.commit('clearList')
    }
  }
}
