import http from '../api/httpRequest.js'
import { defineStore } from 'pinia';
import localForage from '../utils/electronForage.js';
const CACHE_KEY = 'pyqList'
export default defineStore('pyqStore', {
  state: () => {
    return {
      pyqList: [],
      isLoading: false,
      commentShowTopicId: null,
      commentText: '',
      notifyList: [],
      notifyListNum: {}
    }
  },
  actions: {
    /** 从缓存中读取 pyqList */
    async loadFromCache () {
      try {
        const cached = await localForage.getItem(CACHE_KEY)
        if (cached) {
          this.pyqList = cached
          console.log('[缓存] 朋友圈已从缓存中加载')
        }
      } catch (err) {
        console.error('[缓存读取失败]', err)
      }
    },

    /** 获取朋友圈数据并更新缓存 */
    async fetchPyqList (page = 1, size = 10) {
      this.isLoading = true
      try {
        const data = await http({
          url: `/topic/list?page=${page}&size=${size}`,
          method: 'GET'
        })
        this.pyqList = data
        this.getNotifyList()
        this.getNotifyListNum()
        await localForage.setItem(CACHE_KEY, data)
        console.log('[网络] 朋友圈数据已获取并缓存')
      } catch (err) {
        console.error('[网络请求失败]', err)
      } finally {
        this.isLoading = false
      }
    },
    /** 清空本地缓存 */
    async clearCache () {
      await localForage.removeItem(CACHE_KEY)
      console.log('[缓存] 已清除 pyqList 缓存')
    },

    /** 显示评论输入框 */
    showComment (topicId) {
      this.commentShowTopicId = topicId
    },
    /** 提交评论 */
    async comment (data, topicId) {
      const userPyq = this.findUserPyq(topicId)
      if (!userPyq) return console.warn(`未找到 userPyq: ${userPyq}`)
      try {
        const res = await http({
          url: `/topic/reply`,
          method: 'POST',
          data
        })
        userPyq.replyList.push(res)
        this.updatePyqList(userPyq)
        this.hideComment()
      } catch (err) {
        console.error(`[提交评论失败]`, err)
      }
    },
    /** 隐藏评论框 */
    hideComment () {
      this.commentShowTopicId = null
      this.commentText = ''
    },

    /** 更新评论文本 */
    setCommentText (text) {
      this.commentText = text
    },
    /** 点赞 */
    async like (topicId, userInfo) {
      const userPyq = this.findUserPyq(topicId)
      if (!userPyq) return console.warn(`未找到 topicId: ${topicId}`)
      const isLiked = userPyq.like === 'Y'
      const url = isLiked ? `/topic/cancelLike/${topicId}` : `/topic/like/${topicId}`
      const newLikeStatus = isLiked ? 'N' : 'Y'
      let likeListItem = null
      if (!isLiked) {
        likeListItem = {
          displayName: userInfo.nickName,
          nickName: userInfo.nickName,
          portrait: userInfo.headImageThumb,
          userId: userInfo.id
        }
        userPyq.likeList.push(likeListItem)
      } else {
        userPyq.likeList = userPyq.likeList.filter(item => item.userId !== userInfo.id)
      }
      try {
        await http({ url, method: 'GET' })
        userPyq.like = newLikeStatus
        this.updatePyqList(userPyq)
        console.log(`[网络] ${isLiked ? '取消点赞' : '点赞'}成功`)
      } catch (err) {
        console.error(`[网络请求失败] ${isLiked ? '取消点赞' : '点赞'}`, err)
      }
    },
    // 删除朋友圈
    async deletePyq (id) {
      const url = `/topic/remove/${id}`
      try {
        await http({ url, method: 'GET' })
        this.pyqList = this.pyqList.filter(item => item.topic.topicId !== id)
        console.log('删除成功')
      } catch (err) {
        console.error('删除失败', err)
      }
    },
    // 删除评论
    async deleteComment (data) {
      const userPyq = this.findUserPyq(data.topicId)
      userPyq.replyList = userPyq.replyList.filter(item => item.replyId !== data.replyId)
      try {
        await http({
          url: `/topic/removeReply/${data.replyId}`,
          method: 'GET'
        })
        this.updatePyqList(userPyq)
      } catch (err) {
        console.error(`[删除评论请求失败]`, err)
      }
    },
    // 更新列表
    updatePyqList (userPyq) {
      this.pyqList.forEach((item, idx) => {
        if (item.topic.topicId == userPyq.id) {
          // 拷贝属性
          Object.assign(this.pyqList[idx], userPyq);
        }
      })
    },
    async getNotifyList () {
      try {
        const data = await http({
          url: `/topic/noticeList`,
          method: 'GET'
        })
        this.notifyList = data
      } catch (err) {
        console.error(`[删除评论请求失败]`, err)
      }
    },
    async getNotifyListNum () {
      try {
        const data = await http({
          url: `/topic/noticeListCount`,
          method: 'GET'
        })
        this.notifyListNum = data
      } catch (err) {
        console.error(`[删除评论请求失败]`, err)
      }
    }
  },
  getters: {
    findUserPyq: (state) => (topicId) => {
      return state.pyqList.find(item => item.topic.topicId == topicId);
    },
  }
});