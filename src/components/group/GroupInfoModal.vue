<template>
  <div class="group-info">
    <div class="title">群组信息</div>
    <div class="info">
      <div class="info-img">
        <img :src="groupInfo.headImage"
             alt="">
      </div>
      <div class="info-text">
        <p>{{ groupInfo.showGroupName }}</p>
        <p class="info-text-num">{{`${groupInfo.membersCount}位成员,${groupInfo.onlineCount}位在线`}}</p>
      </div>
    </div>
    <div class="content">
      <ul class="content-set">
        <li>
          <div class="left">
            <span class="icon inform-icon"></span>
            <span class="text">消息通知</span>
          </div>
          <span class="right">
            <el-switch :value="message"
                       @change="onSwitchMessageChange"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </span>
        </li>
        <!-- <li>
          <div class="left">
            <span class="icon group-icon"></span>
            <span class="text">保存到群聊</span>
          </div>
          <span class="right">
            <el-switch :value="saveGroup"
                       @change="onSaveGroupChange"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </span>
        </li> -->
        <li @click="openModal('投诉')">
          <div class="left">
            <span class="icon complaint-icon"></span>
            <span class="text">投诉</span>
          </div>
        </li>
        <li @click="openModal('图片')"
            v-if="imageAmount > 0">
          <span class="icon image-icon"></span>
          <span class="text">{{ imageAmount }}张图片</span>
        </li>
        <li @click="openModal('视频')"
            v-if="videoAmount > 0">
          <span class="icon video-icon"></span>
          <span class="text">{{ videoAmount }}个视频</span>
        </li>
        <li @click="openModal('文件')"
            v-if="fileAmount > 0">
          <span class="icon files-icon"></span>
          <span class="text">{{ fileAmount }}个文件</span>
        </li>
      </ul>
      <div class="popover-box"
           v-if="popoverShow"
           @click.stop="popoverClose">
        <el-popover placement="bottom"
                    trigger="manual"
                    v-model="messageSelectShow">
          <div class="message-list"
               v-for="(item, index) in messageSelectList"
               :key="index"
               @click.stop="messageSelectItem(item.value)">
            <p>{{ item.label }}</p>
          </div>
          <div class="message-slider"
               v-if="sliderShow"
               @click.stop>
            <div class="slider-tips">
              <span class="first-time">
                1小时
              </span>
              <span class="last-time">
                7天
              </span>
            </div>
            <el-slider :min="1"
                       :max="168"
                       v-model="messageInformTime"
                       :show-tooltip="false"
                       @input="updateDisplay"></el-slider>
            <p>{{ timeDisplay }}</p>
            <div class="message-slider-ok"
                 @click.stop="messageSliderOk">确定</div>
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    chat: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      groupInfo: {},
      message: false,
      popoverShow: false,
      messageSelectShow: false,
      messageSelectValue: '',
      messageSelectList: [
        {
          value: '1',
          label: '暂停消息通知1小时'
        },
        {
          value: '2',
          label: '暂停消息2天'
        },
        {
          value: '3',
          label: '永久关闭'
        },
        {
          value: '4',
          label: '自定义'
        }
      ],
      sliderShow: false,
      saveGroup: false,
      messageInformTime: 1,
      timeDisplay: '1小时',
    }
  },
  methods: {
    open (info) {
      this.groupInfo = info
    },
    onSwitchMessageChange (val) {
      // 当前是 true（用户点击要开启免打扰）
      if (val === false) {
        // 弹出选择弹框，但不立刻切换 switch 的值
        this.popoverShow = true;
        this.messageSelectShow = true;
      } else {
        // 用户主动取消免打扰，立即切换状态
        this.message = true;
        this.setMessageTime(0);
      }
    },
    // 消息通知点击
    messageSelectItem (value) {
      this.messageSelectValue = value
      switch (value) {
        case '0':
          this.setMessageTime(0)
          this.message = true
          break;
        case '1':
          this.setMessageTime(1)
          this.message = false
          break;
        case '2':
          this.setMessageTime(48)
          this.message = false
          break;
        case '3':
          this.setMessageTime(876000)
          this.message = false
          break;
        case '4':
          this.sliderShow = true
          break;
      }
    },
    onSaveGroupChange (val) {
      this.saveGroup = val
    },
    openModal (title, list) {
      this.$emit('openDialog', title, list)
    },
    // 时间计算
    updateDisplay (val) {
      const days = Math.floor(val / 24);
      const hours = val % 24;

      if (days > 0 && hours > 0) {
        this.timeDisplay = `${days}天 ${hours}小时`;
      } else if (days > 0) {
        this.timeDisplay = `${days}天`;
      } else {
        this.timeDisplay = `${hours}小时`;
      }
    },
    messageSliderOk () {
      this.setMessageTime(this.messageInformTime)
      this.sliderShow = false
      this.message = false
    },
    setMessageTime (time) {
      let data = {
        groupId: this.groupInfo.id,
        notifyExpireTs: time * 1000 * 60 * 60
      };
      this.$http({
        url: "/group/notify/expire",
        method: 'put',
        data
      }).then(() => {
        this.$message.success("设置成功");
        this.popoverClose();

        if (time > 0) {
          this.message = false;
        } else {
          this.message = true;
        }
        this.$emit('updateGroupInfo', true);
      });
    },
    // popover关闭
    popoverClose () {
      this.sliderShow = false
      this.messageSelectShow = false
      this.popoverShow = false
      this.messageInformTime = 1
    },
  },
  computed: {
    imageAmount () {
      let type = this.$enums.MESSAGE_TYPE.IMAGE;
      return this.chat.messages.filter(m => m.type == type).length;
    },
    fileAmount () {
      let type = this.$enums.MESSAGE_TYPE.FILE;
      return this.chat.messages.filter(m => m.type == type && m.loadStatus == 'ok').length
    },
    videoAmount () {
      let type = this.$enums.MESSAGE_TYPE.VIDEO;
      return this.chat.messages.filter(m => m.type == type).length;
    },
  },
  watch: {
    groupInfo: {
      handler (value) {
        if (value.notifyExpireTs) {
          this.message = false
        } else {
          this.message = true
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-info {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      padding: 0 20px;
      height: 35px;
      color: #999;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .info {
      width: calc(100% - 40px);
      height: 60px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;
      border-bottom: 5px solid #d9d9d9;
      .info-img {
        width: 60px;
        height: 100%;
        border-radius: 30px;
        background-color: #ccc;
        margin-right: 15px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info-text {
        width: calc(100% - 60px);
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        p {
          margin: 0px;
          font-size: 16px;
          color: #000;
        }
        .info-text-num {
          font-size: 14px;
          color: #999;
        }
      }
    }
    .content {
      width: 100%;
      max-height: 500px;
      overflow-y: auto;
      .content-set {
        width: 100%;
        margin: 0px;
        padding: 0px;
        li {
          width: calc(100% - 40px);
          height: 40px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          .left {
            width: calc(100% - 28px);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .right {
            width: 50px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .icon {
            width: 16px;
            height: 16px;
            margin-right: 10px;
          }
          .text {
            font-size: 14px;
          }
          .text-color {
            color: #3066ec;
          }
          .inform-icon {
            background: url("~@/assets/friend/inform-icon.png") no-repeat center;
            background-size: 100%;
          }
          .complaint-icon {
            background: url("~@/assets/friend/complaint-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .group-icon {
            width: 17px;
            height: 17px;
            background: url("~@/assets/icon/group/group-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .image-icon {
            background: url("../../assets/friend/image-icon.png") no-repeat center;
            background-size: 100%;
          }
          .video-icon {
            background: url("../../assets/friend/video-info-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .files-icon {
            background: url("../../assets/friend/files-icon.png") no-repeat center;
            background-size: 100%;
          }
        }
        li:hover {
          background-color: #ededed;
        }
      }
    }
  }
  .message-list {
    width: calc(100% - 10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 5px;
    &:hover {
      background-color: #ededed;
    }
    p {
      margin: 0;
      font-size: 14px;
      cursor: pointer;
    }
    .el-icon-close {
      cursor: pointer;
    }
  }
  ::v-deep .el-popover {
    position: absolute;
    top: 190px;
    right: -88px;
    padding: 0px;
    .message-list {
      width: 100%;
      padding: 5px 10px;
      box-sizing: border-box;
      cursor: pointer;
    }
  }
  .popover-box {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(255, 255, 255, 0);
  }
  .message-slider {
    width: 300px;
    height: 180px;
    position: absolute;
    top: 89px;
    right: 151px;
    z-index: 2;
    padding: 30px;
    box-sizing: border-box;
    background: white;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    .slider-tips {
      width: 100%;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    p {
      width: 100%;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: #c42b1c;
    }
    .message-slider-ok {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      cursor: pointer;
      color: #fff;
      background: #096bff;
      border-radius: 4px;
    }
    .message-slider-ok:hover {
      background: #096bff8e;
    }
  }
</style>