import { createApp } from 'vue'
import App from './App'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/style/im.scss'
import './assets/iconfont/iconfont.css'
import { createPinia } from 'pinia'
import httpRequest from './api/httpRequest'
import * as socketApi from './api/wssocket'
import * as messageType from './api/messageType'
import emotion from './api/emotion.js'
import url from './api/url.js'
import element from './api/element.js'
import * as enums from './api/enums.js'
import * as date from './api/date.js'
import dialogDrag from './utils/directive/dialogDrag'
import eventBus from './api/eventBus'
import useChatStore from './store/chatStore.js'
import useFriendStore from './store/friendStore.js'
import useGroupStore from './store/groupStore.js'
import useUserStore from './store/userStore.js'
import useConfigStore from './store/configStore.js'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(pinia)
app.use(router)
app.use(dialogDrag)

// global properties
app.config.globalProperties.$wsApi = socketApi
app.config.globalProperties.$msgType = messageType
app.config.globalProperties.$date = date
app.config.globalProperties.$http = httpRequest
app.config.globalProperties.$emo = emotion
app.config.globalProperties.$url = url
app.config.globalProperties.$elm = element
app.config.globalProperties.$enums = enums
app.config.globalProperties.$eventBus = eventBus

app.config.globalProperties.chatStore = useChatStore()
app.config.globalProperties.friendStore = useFriendStore()
app.config.globalProperties.groupStore = useGroupStore()
app.config.globalProperties.userStore = useUserStore()
app.config.globalProperties.configStore = useConfigStore()

app.mount('#app')
