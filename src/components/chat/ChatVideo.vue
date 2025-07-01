<template>
  <div class="chat-video">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnFriendInfo"></i>
      <p>视频</p>
    </div>
    <div class="content">
      <div class="content-img"
           v-for="(item,index) in setTime"
           :key="index">
        <p>
          {{ item.month }}
        </p>
        <ul class="content-video-list">
          <template v-for="(value,i) in item.items">
            <li :key="i"
                @click="play(i)"
                @contextmenu.prevent="pause(i)">
              <video :ref="'videoPlayer' + i"
                     class="send-video"
                     muted
                     playsinline
                     @loadedmetadata="getDuration($event, i)"
                     :poster="JSON.parse(value.content).coverUrl"
                     :src="JSON.parse(value.content).videoUrl" />
                     <!-- {{JSON.parse(value.content)}} -->
              <div class="video-duration">
                <span class="icon"></span>
                <span class="time">{{ formatTime(durations[i] || 0) }}</span>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { groupByMonth } from '@/utils/filtration.js'
export default {
  data () {
    return {
      durations: []
    }
  },
  props: {
    chat: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  methods: {
    returnFriendInfo () {
      this.$emit('returnFriendInfo')
    },
    transitionJson (content) {
      return JSON.parse(content)
    },
    play (i) {
      const video = this.$refs['videoPlayer' + i][0];
      if (video && video.play) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen(); // Safari
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen(); // Firefox
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen(); // IE/Edge
        }

        video.play().catch(err => {
          console.warn("播放失败：", err);
        });
      }
    },
    pause (i) {
      const video = this.$refs['videoPlayer' + i][0];
      if (video && video.pause) {
        video.pause();
      }
    },
    getDuration (event, i) {
      const duration = Math.floor(event.target.duration);
      this.$set(this.durations, i, duration); // 确保响应式
    },
    formatTime (seconds) {
      const min = Math.floor(seconds / 60).toString().padStart(2, '0');
      const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${min}:${sec}`;
    }
  },
  computed: {
    videoList () {
      let type = this.$enums.MESSAGE_TYPE.VIDEO;
      return groupByMonth(this.chat.messages.filter(m => m.type == type));
    },
    setTime () {
      let groupedList = Object.entries(this.videoList).map(([month, items]) => ({
        month,
        items
      }));
      return groupedList;
    }
    //转换JSON字符串
  },
}
</script>
<style lang="scss" scoped>
  .chat-video {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      padding: 0 20px;
      height: 35px;
      color: #000000;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      p {
        flex: 1;
        text-align: center;
      }
    }
    .content {
      width: 100%;
      height: 450px;
      box-sizing: border-box;
      padding: 0px 30px;
      overflow-y: auto;
      .content-img {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        .content-video-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          margin: 0px;
          padding: 0px !important;
          li {
            width: calc(100% / 4 - 3.75px);
            height: 100px;
            margin: 0px 5px 5px 0px;
            background-color: #0000003c;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            position: relative;
            cursor: pointer;
            .send-video {
              width: 100%;
              height: 100%;
            }
            .video-duration {
              width: 100%;
              height: 25px;
              padding: 0 5px;
              box-sizing: border-box;
              border-radius: 0px 0px 4px 4px;
              position: absolute;
              background-color: #0000003c;
              bottom: 0px;
              font-size: 12px;
              color: #ffffff;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              .icon {
                width: 16px;
                height: 16px;
                background: url("~@/assets/chat/video-btn-icon.png") no-repeat
                  center;
                background-size: 100%;
              }
              .time {
                margin-left: 5px;
              }
            }
          }
          li:nth-child(4n) {
            margin-right: 0px;
          }
        }
      }
    }
  }
</style>
