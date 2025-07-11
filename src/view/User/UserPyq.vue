<template>
  <div class="user-pyq">
    <div class="header-title">
      <i class="el-icon-refresh"
         @click="refresh"
         title="刷新"></i>
      <span>我的朋友圈</span>
      <!-- <i class="el-icon-camera-solid" @click="showPostPyqModel"></i> -->
      <i class="el-icon-bell" @click="openNotify"></i>
    </div>
    <div class="content">
      <div class="content-box"
           :style="contentBoxStyle">
        <div class="content-bg"
             :style="contentBgStyle">
          <div class="content-bg-head"
               :style="contentBgHeadStyle">
            <div class="img-box"
                 :style="headImgBoxStyle">
              <img :src="userInfo.headImageThumb"
                   alt="">
            </div>
            <div class="text-box">
              <span> {{ userInfo.nickName }}</span>
            </div>
          </div>
        </div>
        <Loading :visible="isLoading"
                 fullscreen
                 text="加载中..."
                 v-if="isLoading" />
        <ul class="content-list"
            :style="contentListStyle"
            v-else>
          <template v-if="pyqList && pyqList.length > 0">
            <li v-for="(item,index) in pyqList"
                :key="index"
                @click="onClick(item)">
              <div class="li-head">
                <div class="li-head-img">
                  <img :src="item.topic.portrait"
                       alt="">
                </div>
                <p class="li-head-name">
                  {{ item.topic.nickName }}
                </p>
              </div>
              <div class="li-container">
                <p>
                  {{ item.topic.content }}
                </p>
                <!-- ? 图片展示 -->
                <div class="li-container-img"
                     v-show="item.topic.topicType == 2">
                  <div class="li-container-img-box"
                       v-for="(value,i) in getImgOrVideoList(item.topic.location)"
                       :key="i">
                    <el-image :src="value"
                              fit="contain"
                              lazy
                              :preview-src-list="getImgOrVideoList(item.topic.location)"></el-image>
                  </div>
                </div>
                <!-- ? 视频展示 -->
                <div class="li-container-video"
                     v-show="item.topic.topicType == 3">
                  <div class="li-container-video-box"
                       v-for="(value,i) in getImgOrVideoList(item.topic.location)"
                       :key="i">
                    <video ref="videoPlayer"
                           class="video"
                           autoplay
                           muted
                           playsinline
                           preload="none"
                           controls
                           :poster="videoPoster"
                           :src="value" />
                  </div>
                </div>
                <!-- ? 点赞、评论按钮 -->
                <div class="li-container-operate">
                  <div class="li-container-operate-time">
                    <span>
                      {{ showTime(item.topic.createTime) }}
                    </span>
                    <span class="li-container-operate-del"
                          @click="deleteMyPyq(item.topic.topicId)"
                          v-if="currentUser(item.topic.userId)">
                      删除
                    </span>
                  </div>
                  <div class="li-container-operate-btn">
                    <i class="el-icon-chat-dot-square comment-button"
                       @click="commentBtn(item)"></i>
                    <i :class="[item.like === 'N' ? 'el-icon-like' : 'el-icon-like-active']"
                       @click="likeBtn(item)"></i>
                  </div>
                </div>
                <!-- ? 点赞、评论列表 -->
                <div class="li-container-show">
                  <div class="li-container-show-like"
                       v-if="item?.likeList && item?.likeList.length > 0">
                    <div class="li-container-show-like-item"
                         v-for="(like,i) in item.likeList"
                         :key="i">
                      <span>❤</span>
                      <span class="li-container-show-like-item-name">{{ like.displayName }}</span>
                    </div>
                  </div>
                  <div class="li-container-show-comment"
                       v-if="item?.replyList && item?.replyList.length > 0">
                    <div class="li-container-show-comment-item"
                         v-for="(comment,i) in item.replyList"
                         :key="i"
                         @contextmenu.prevent="showMessageMenu($event,comment,item.topic.topicId)">
                      <template v-if="comment.replyType === 1">
                        <div class="li-container-show-comment-item-name">{{ comment.nickName }}</div>
                        <span class="li-container-show-comment-item-colon">:</span>
                        <div class="li-container-show-comment-item-content"
                             @click.stop="commentFriend(comment,item.topic.topicId)">{{ comment.content }}</div>
                      </template>
                      <template v-if="comment.replyType === 2">
                        <div class="li-container-show-comment-item-reply">
                          <span class="li-container-show-comment-item-reply-user">{{ comment.nickName }}</span>
                          <span style="color: #000;padding: 0 2px;">回复</span>
                          <span class="li-container-show-comment-item-reply-friend">{{ comment.toNickName }}</span>
                        </div>
                        <span class="li-container-show-comment-item-colon">:</span>
                        <div class="li-container-show-comment-item-text"
                             @click.stop="commentFriend(comment,item.topic.topicId)">{{ comment.content }}</div>
                      </template>
                    </div>
                  </div>
                </div>
                <!-- ? 评论框 -->
                <div class="li-container-comment comment-box"
                     ref="commentBox"
                     v-if="commentShowTopicId === item.topic.topicId">
                  <el-input type="textarea"
                            :ref="'input-' + item.topic.topicId"
                            :autosize="{ minRows: 2, maxRows: 3}"
                            maxlength="1000"
                            placeholder="请输入..."
                            v-model="commentText"
                            @keydown.native="handleKeyDown($event,item)">
                  </el-input>
                  <div class="li-container-comment-btn">
                    <!-- <div class="icon iconfont emoji-bar-icon"></div> -->
                    <el-button type="primary"
                               size="small"
                               @click="commentClickBtn(item)">评论</el-button>
                  </div>
                </div>
              </div>
            </li>
            <div class="footer-tip">———— 到底了 ————</div>
          </template>
          <div class="list-tip"
               v-else>
            快去发条朋友圈吧...
          </div>
        </ul>
      </div>
    </div>
    <RightMenu ref="rightMenu"
               @select="onSelectMenu" />
    <PyqNotifyListModel ref="notifyListRef"
                        :title="'朋友圈通知'" />
    <!-- <PostPyqModel ref="postPyqRef" :title="'发布朋友圈'"/> -->
  </div>
</template>
<script>
import PostPyqModel from '@/components/pyq/PostPyqModel'
import PyqNotifyListModel from '@/components/pyq/PyqNotifyListModel'
import Loading from '@/components/common/Loading'
import RightMenu from '@/components/common/RightMenu.vue';
export default {
  components: {
    Loading,
    PostPyqModel,
    RightMenu,
    PyqNotifyListModel
  },
  data () {
    return {
      windowWidth: window.innerWidth,
      videoPoster: '', // 封面图 base64
      currentComment: {},
      copyCommentText: '',
      isFriend: false
    }
  },
  mounted () {
    this.pyqStore.loadFromCache()
    this.pyqStore.fetchPyqList()
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleOutsideClick)
    if (this.pyqList && this.pyqList.length > 0) {
      this.captureFirstFrame()
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleOutsideClick)
    this.pyqStore.hideComment()
    this.isFriend = false
    this.currentComment = {}
  },
  methods: {
    captureFirstFrame () {
      const video = this.$refs.videoPlayer
      console.log('获取视频封面', video);

      if (!video) return

      // 等视频元数据加载完
      video.addEventListener('loadeddata', () => {
        // 创建 canvas
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // 获取 base64 图片作为封面
        this.videoPoster = canvas.toDataURL('image/png')
      }, { once: true }) // 只监听一次
    },
    handleResize () {
      this.windowWidth = window.innerWidth
    },
    // 显示发布朋友圈模态框
    showPostPyqModel () {
      this.$refs.postPyqRef.open()
    },
    // 刷新
    refresh () {
      window.scrollTo(0, 0)
      this.pyqStore.hideComment()
      this.pyqStore.fetchPyqList()
    },
    // 获取图片、视频列表
    getImgOrVideoList (value) {
      return value.split(',')
    },
    showTime (time) {
      return this.$date.toTimeText(time, false)
    },
    // 评论
    async commentBtn (item) {
      console.log('评论', item);

      // 设置当前要展示评论框的 topicId
      await this.pyqStore.showComment(item.topic.topicId);

      // 等 DOM 渲染完成后再聚焦
      this.$nextTick(() => {
        this.inputFocus(item.topic.topicId)
      });
    },
    inputFocus (topicId) {
      this.$nextTick(() => {
        const inputRef = this.$refs['input-' + topicId][0];
        if (inputRef && inputRef.focus) {
          inputRef.focus();
        } else if (inputRef && inputRef.$el) {
          inputRef.$el.querySelector('textarea')?.focus();
        } else {
          console.warn('无法聚焦评论框：ref 未找到');
        }
      });
    },
    // 点赞
    likeBtn (value) {
      this.pyqStore.like(value.topic.topicId, this.userInfo)
    },
    handleKeyDown (event, item) {
      if (event.key === 'Enter') {
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Enter（或 Cmd+Enter）插入换行（默认行为），不阻止
          console.log(5555);
          return;
        } else {
          console.log(6666);

          event.preventDefault(); // 阻止换行
          this.commentClickBtn(item); // 调用评论方法
        }
      }
    },
    commentClickBtn (item) {
      let data = {
        content: this.commentText,
        replyId: this.isFriend ? this.currentComment.replyId : item.topic.topicId,
        replyType: this.isFriend ? 2 : 1
      }
      this.pyqStore.comment(data, item.topic.topicId).then(() => {
        this.isFriend = false
        this.currentComment = {}
      })
    },
    onClick (item) {
      console.log('item', item);
    },
    handleOutsideClick (e) {
      if (!this.commentShowTopicId) return

      // 排除点击评论按钮本身
      if (e.target.closest('.comment-button')) return

      const commentBox = this.$refs.commentBox
      const box = Array.isArray(commentBox) ? commentBox[0] : commentBox

      if (box && !box.contains(e.target)) {
        this.pyqStore.hideComment()
        this.commentText = ''
      }
    },
    showMessageMenu (e, comment, topicId) {
      this.currentComment = {
        replyId: comment.replyId,
        topicId: topicId
      }
      this.copyCommentText = comment.content
      let menuItems = [];
      if (comment.canDeleted === 'Y') {
        menuItems = [
          {
            key: 'DELETE',
            name: '删除'
          },
          {
            key: 'COPY',
            name: '复制'
          }
        ]
      } else {
        menuItems = [
          {
            key: 'COPY',
            name: '复制'
          }
        ]
      }
      this.$refs.rightMenu.open(e, menuItems);
    },
    onSelectMenu (item) {
      // 菜单id转驼峰作为事件key
      let eventKey = item.key.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      console.log(eventKey, item);
      if (item.key === 'DELETE') {
        this.delComment()
      }
      if (item.key === 'COPY') {
        this.copyComment()
      }
    },
    currentUser (id) {
      return id == this.userInfo.id
    },
    deleteMyPyq (topicId) {
      console.log('删除朋友圈');
      this.$confirm('你确定删除该朋友圈吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.pyqStore.deletePyq(topicId)
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
      })
    },
    // 删除评论
    delComment () {
      this.$confirm('你确定删除该条评论吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.pyqStore.deleteComment(this.currentComment).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.currentComment = {}
        })
      }).catch(() => {
      })
    },
    copyComment () {
      const textarea = document.createElement('textarea');
      textarea.value = JSON.parse(JSON.stringify(this.copyCommentText));
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        this.$message?.success('复制成功');
      } else {
        this.$message?.error('复制失败');
      }
      this.copyComment = ''
    },
    // 回复好友
    commentFriend (comment, topicId) {
      this.pyqStore.showComment(topicId)
      this.inputFocus(topicId)
      this.isFriend = true
      this.currentComment = {
        replyId: comment.replyId,
        topicId: topicId
      }
    },
    // 打开朋友圈通知
    openNotify(){
      this.$refs.notifyListRef.open()
    }
  },
  computed: {
    notifyList () {
      return this.pyqStore.notifyList
    },
    pyqList () {
      return this.pyqStore.pyqList
    },
    isLoading () {
      return this.pyqStore.isLoading
    },
    commentShowTopicId () {
      return this.pyqStore.commentShowTopicId
    },
    commentText: {
      get () {
        return this.pyqStore.commentText
      },
      set (val) {
        this.pyqStore.setCommentText(val)
      }
    },
    userInfo () {
      return this.userStore.userInfo
    },
    isWidth () {
      return this.windowWidth > 1500;
    },
    contentBoxStyle () {
      if (this.isWidth) {
        return {
          width: '750px'
        }
      } else {
        return {
          width: '375px'
        }
      }
    },
    contentBgStyle () {
      if (this.isWidth) {
        return {
          width: '750px',
          height: '460px'
        }
      } else {
        return {
          width: '375px',
          height: '230px'
        }
      }
    },
    contentListStyle () {
      if (this.isWidth) {
        return {
          width: '750px',
          height: 'calc(100% - 460px)'
        }
      } else {
        return {
          width: '375px',
          height: 'calc(100% - 230px)'
        }
      }
    },
    contentBgHeadStyle () {
      if (this.isWidth) {
        return {
          width: '190px',
          height: '80px'
        }
      } else {
        return {
          width: '170px',
          height: '60px'
        }
      }
    },
    headImgBoxStyle () {
      if (this.isWidth) {
        return {
          width: '80px'
        }
      } else {
        return {
          width: '60px'
        }
      }
    },
    liContainerImgStyle () {
      if (this.isWidth) {
        return {
          width: '190px',
          height: '80px'
        }
      } else {
        return {
          width: '170px',
          height: '60px'
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-pyq {
    width: 100%;
    height: 100%;
    .header-title {
      width: 100%;
      height: 50px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e5e5;
      font-size: 18px;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      .el-icon-refresh {
        position: absolute;
        left: 20px;
        font-weight: 700;
        cursor: pointer;
        &:hover {
          color: #658efe;
        }
      }
      .el-icon-bell,
      .el-icon-camera-solid {
        position: absolute;
        right: 20px;
        cursor: pointer;
        font-weight: 700;
        &:hover {
          color: #658efe;
        }
      }
    }
    .content {
      width: 100%;
      height: calc(100% - 50px);
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      .content-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .content-bg {
        width: 750px;
        height: 500px;
        background: url("../../assets/image/test-bg.png") no-repeat center;
        background-size: cover;
        position: relative;
        .content-bg-head {
          width: 160px;
          height: 60px;
          position: absolute;
          bottom: -20px;
          left: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .img-box {
            width: 60px;
            height: 100%;
            border-radius: 50%;
            background-color: #999;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .text-box {
            width: 100px;
            height: 100%;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            font-weight: 700;
          }
        }
      }
      .content-list {
        width: 750px;
        // min-height: calc(100% - 460px);
        margin: 0px;
        padding: 0px;
        padding-top: 45px;
        box-sizing: border-box;
        background-color: #e5e5e53b;
        .footer-tip {
          width: 100%;
          height: 30px;
          color: #999;
          text-align: center;
          line-height: 30px;
        }
        li {
          width: 100%;
          min-height: 100px;
          padding: 0 10px 5px 10px;
          box-sizing: border-box;
          margin-bottom: 10px;
          border-bottom: 1px solid #e5e5e5;
          &:last-child {
            border-bottom: none;
          }
          .li-head {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .li-head-img {
              width: 40px;
              height: 100%;
              border-radius: 50%;
              overflow: hidden;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .li-head-name {
              width: calc(100% - 50px);
              height: 100%;
              margin: 0px;
              font-size: 14px;
              display: flex;
              align-items: center;
              justify-content: flex-start;
              color: #8d8d8d;
            }
          }
          .li-container {
            width: 100%;
            margin-top: 10px;
            p {
              width: 100%;
              margin: 0px;
              font-size: 13px;
              font-weight: 500;
              text-align: left;
              margin-bottom: 5px;
            }
            .li-container-img {
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              flex-wrap: wrap;
              margin: 10px 0;
              .li-container-img-box {
                width: calc(100% / 3 - 5px);
                margin-right: 5px;
                margin-bottom: 5px;
                min-height: 100px;
                max-height: 300px;
                border-radius: 4px;
                overflow: hidden;
                background-color: #00000031;
                &:nth-child(3n) {
                  margin-right: 0px;
                }
                ::v-deep .el-image {
                  width: 100%;
                  height: 100%;
                  margin-right: 5px;
                  &:last-child {
                    margin-right: 0px;
                  }
                }
              }
            }
            .li-container-video {
              width: 100%;
              display: flex;
              justify-content: flex-start;
              margin: 10px 0px;
            }
            .li-container-video-box {
              width: 100%;
            }
            .li-container-operate {
              width: 100%;
              height: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              .li-container-operate-del,
              .li-container-operate-time {
                font-size: 12px;
                line-height: 30px;
                color: #928c8c;
              }
              .li-container-operate-del {
                cursor: pointer;
                margin-left: 3px;
                &:hover {
                  color: #658efe;
                }
              }
              .li-container-operate-btn {
                width: 50px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: space-around;
                .el-icon-chat-dot-square {
                  font-size: 20px;
                  cursor: pointer;
                  &:hover {
                    color: #658efe;
                  }
                }
                .el-icon-like {
                  width: 20px;
                  height: 20px;
                  background: url("../../assets/icon/user/pyq/like-icon.png")
                    no-repeat center;
                  background-size: 100%;
                  cursor: pointer;
                  &:hover {
                    background: url("../../assets/icon/user/pyq/like-active-icon.png")
                      no-repeat center;
                    background-size: 100%;
                  }
                }
                .el-icon-like-active {
                  width: 20px;
                  height: 20px;
                  background: url("../../assets/icon/user/pyq/like-active-icon.png")
                    no-repeat center;
                  background-size: 100%;
                  cursor: pointer;
                }
              }
            }
            .li-container-show {
              width: 100%;
              background-color: #ffffff8e;
              border-radius: 4px;
              .li-container-show-like {
                width: 100%;
                min-height: 30px;
                // max-height: 90px;
                border-radius: 4px;
                padding: 0 5px;
                box-sizing: border-box;
                color: #658efe;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                flex-direction: row;
                flex-wrap: wrap;
                .li-container-show-like-item {
                  display: flex;
                  align-items: center;
                  padding: 1px 2px;
                  font-size: 16px;
                  border-radius: 4px;
                  position: relative;
                  cursor: pointer;
                  &:last-child::after {
                    content: "";
                  }
                  &::after {
                    content: ",";
                    width: 5px;
                    height: 5px;
                    line-height: 3px;
                    color: #658efe;
                  }
                  .li-container-show-like-item-name {
                    font-size: 13px;
                    margin-left: 2px;
                  }
                }
              }
              .li-container-show-comment {
                width: 100%;
                min-height: 30px;
                margin-bottom: 5px;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                .li-container-show-comment-item {
                  width: 100%;
                  min-height: 30px;
                  font-size: 13px;
                  padding: 0 5px;
                  box-sizing: border-box;
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  border-radius: 4px;
                  flex-wrap: wrap;
                  flex-direction: row;
                  .li-container-show-comment-item-name {
                    // width: 70px;
                    white-space: nowrap; /* 不换行 */
                    overflow: hidden; /* 超出隐藏 */
                    text-overflow: ellipsis; /* 超出显示省略号 */
                    color: #658efe;
                    cursor: pointer;
                    text-align: right;
                  }
                  .li-container-show-comment-item-reply {
                    // width: 200px;
                    white-space: nowrap; /* 不换行 */
                    overflow: hidden; /* 超出隐藏 */
                    text-overflow: ellipsis; /* 超出显示省略号 */
                    color: #658efe;
                    cursor: pointer;
                    text-align: right;
                  }
                  .li-container-show-comment-item-colon {
                    margin: 0 5px;
                    width: 2px;
                    line-height: 20px;
                  }
                  .li-container-show-comment-item-content {
                    // width: calc(100% - 76px);
                    max-height: 60px;
                    color: #000;
                    display: -webkit-box; /* 必须结合下面两个属性使用 */
                    -webkit-box-orient: vertical; /* 垂直排列 */
                    -webkit-line-clamp: 3; /* 显示三行 */
                    overflow: hidden; /* 超出隐藏 */
                    text-overflow: ellipsis; /* 显示省略号 */
                    text-align: left;
                    line-height: 20px;
                  }
                  .li-container-show-comment-item-text {
                    max-height: 60px;
                    color: #000;
                    display: -webkit-box; /* 必须结合下面两个属性使用 */
                    -webkit-box-orient: vertical; /* 垂直排列 */
                    -webkit-line-clamp: 3; /* 显示三行 */
                    overflow: hidden; /* 超出隐藏 */
                    text-overflow: ellipsis; /* 显示省略号 */
                    text-align: left;
                    line-height: 20px;
                  }
                }
              }
            }
            .li-container-comment {
              width: 100%;
              min-height: 60px;
              padding: 5px;
              border: 2px solid #658efe;
              border-radius: 4px;
              box-sizing: border-box;
              background-color: #fff;
              .li-container-comment-btn {
                width: 100%;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-top: 5px;
              }
              .emoji-bar-icon {
                width: 20px;
                height: 22px;
                background: url("~@/assets/chat/emoji-bar-icon.png") no-repeat
                  center;
                background-size: 100%;
                cursor: pointer;
                margin-right: 10px;
                &:hover {
                  background: url("~@/assets/chat/emoji-bar-hover-icon.png")
                    no-repeat center;
                  background-size: 100%;
                }
              }
            }
          }
        }
        .list-tip {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #999;
        }
      }
    }
    ::v-deep .el-textarea__inner {
      max-height: 80px;
    }
    ::v-deep .el-image-viewer__canvas {
      height: calc(100% - 30px) !important;
      margin-top: 30px !important;
    }
  }
</style>