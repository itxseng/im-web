<template>
  <div class="chat-file">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnFriendInfo"></i>
      <p>文件</p>
    </div>
    <div class="content">
      <div class="content-file"
           v-for="(item,index) in assemble"
           :key="index">
        <p style="font-weight: 700;font-size: 16px;">
          {{ item.month }}
        </p>
        <ul class="content-file-list">
          <template v-for="(value,i) in item.items">
            <li v-if="value.loadStatus === 'ok'"
                :key="i">
              <div class="file-box">
                <div class="file-box-icon">
                  <div class="icon"></div>
                </div>
              </div>
              <div class="file-info">
                <div class="file-info-top">
                  <p class="file-info-top-name">{{ transitionJson(value.content).name }}</p>
                  <p>{{ fileSizeStr(transitionJson(value.content).size) }}</p>
                </div>
                <p>
                  {{ filtrationTime(value.sendTime) }}
                </p>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { filtrationTime,groupByMonth } from '@/utils/filtration.js'
export default {
  data () {
    return {
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
    filtrationTime (time) {
      return filtrationTime(time);
    },
    fileSizeStr (siez) {
      if (siez > 1024 * 1024) {
        return Math.round(siez / 1024 / 1024) + "M";
      }
      if (siez > 1024) {
        return Math.round(siez / 1024) + "KB";
      }
      return siez + "B";
    }
  },
  computed: {
    fileMessage () {
      let type = this.$enums.MESSAGE_TYPE.FILE;
      return groupByMonth(this.chat.messages.filter(m => m.type == type));
    },
    assemble () {
      let groupedList = Object.entries(this.fileMessage).map(([month, items]) => ({
        month,
        items
      }));
      return groupedList;
    }
  },
}
</script>
<style lang="scss" scoped>
  .chat-file {
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
      .content-file {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        .content-file-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          margin: 0px;
          padding: 0px !important;
          li {
            width: 100%;
            height: 80px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-bottom: 10px;
            .file-box {
              width: 100px;
              height: 80px;
              background-color: #efc274e9;
              border-radius: 5px;
              display: flex;
              justify-content: center;
              align-items: center;
              .file-box-icon {
                width: 35px;
                height: 35px;
                border-radius: 20px;
                background-color: #00000048;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                .icon {
                  width: 20px;
                  height: 20px;
                  background: url("~@/assets/chat/down-icon.png") no-repeat center;
                  background-size: 100%;
                }
              }
            }
            .file-info {
              width: calc(100% - 100px);
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: space-around;
              margin-left: 10px;
              border-bottom: 1px solid #0000001f;
              p {
                margin: 0px;
                color: #999;
                font-size: 14px;
              }
              .file-info-top {
                width: 100%;
                height: 35px;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                .file-info-top-name {
                  color: #000;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
