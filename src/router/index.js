import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../view/Login'
import Register from '../view/Register'
import ForgetThePwd from '../view/ForgetThePwd'
import Home from '../view/Home'

const routes = [
  { path: '/', redirect: '/login' },
  { name: 'Login', path: '/login', component: Login },
  { name: 'Register', path: '/register', component: Register },
  { name: 'ForgetThePwd', path: '/forgetThePwd', component: ForgetThePwd },
  {
    name: 'Home',
    path: '/home',
    component: Home,
    children: [
      { name: 'Chat', path: '/home/chat', component: () => import('../view/Chat') },
      { name: 'Friend', path: '/home/friend', component: () => import('../view/Friend') },
      { name: 'GROUP', path: '/home/group', component: () => import('../view/Group') },
      {
        name: 'User',
        path: '/home/user',
        component: () => import('../view/User'),
        children: [
          { name: 'Equipment', path: '/home/user/equipment', component: () => import('../view/User/UserEquipment') },
          { name: 'Privacy', path: '/home/user/privacy', component: () => import('../view/User/UserPrivacy') },
          { name: 'Blacklist', path: '/home/user/blacklist', component: () => import('../view/User/privacy/UserBlacklist') },
          { name: 'UserInfo', path: '/home/user/userInfo', component: () => import('../view/User/UserInfo') },
          { name: 'Pyq', path: '/home/user/userPyq', component: () => import('../view/User/UserPyq') }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
