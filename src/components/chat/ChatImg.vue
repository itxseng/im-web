<template>
  <div class="chat-img">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnInfo"></i>
      <p>图片</p>
    </div>
    <div class="content">
      <div class="content-img"
           v-for="(item,index) in setTime"
           :key="index">
        <p>
          {{ item.month }}
        </p>
        <ul class="content-img-list">
          <li v-for="(value,i) in item.items"
              :key="i">
            <el-image :src="transitionJson(value.content)"
                      fit="fill"
                      :preview-src-list="[transitionJson(value.content)]">
            </el-image>
          </li>
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
    returnInfo () {
      this.$emit('returnInfo')
    },
    transitionJson (content) {
      return JSON.parse(content).originUrl
    }
  },
  computed: {
    imageMessage () {
      let type = this.$enums.MESSAGE_TYPE.IMAGE;
      return groupByMonth(this.chat.messages.filter(m => m.type == type));
    },
    setTime () {
      let groupedList = Object.entries(this.imageMessage).map(([month, items]) => ({
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
  .chat-img {
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
      max-height: 450px;
      box-sizing: border-box;
      padding: 0px 30px;
      overflow-y: auto;
      .content-img {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        .content-img-list {
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
            .el-image {
              width: 100%;
              height: 100%;
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