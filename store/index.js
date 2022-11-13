import app from './modules/app.js'
import error from './modules/error.js'
import user from './modules/user.js'
import goods from './modules/goods.js'

// const modulesFiles = require.context('./modules', true, /\.js$/)
// const modules = modulesFiles.keys().reduce((modules, modulePath) => {
//     const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
//     const value = modulesFiles(modulePath)
//     modules[moduleName] = value.default
//     return modules
// }, {})

// #ifndef VUE3
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	modules: {
		app,
		error,
		user,
		goods
	}
})
// #endif

// #ifdef VUE3
import {
	createStore
} from 'vuex'
// todo ssr
const store = createStore({
	modules: {
		app,
		error,
		user,
		goods
	}
})
// #endif


export default store
