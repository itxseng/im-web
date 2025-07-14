<template>
  <div class="download-file"
       :style="{backgroundColor:bg,width: iconWidth,height:iconWidth}">
    <!-- 未下载：显示下载图标 -->
    <i class="el-icon-bottom"
       @click="downloadFile"
       v-if="!progressVisible && !isDownloaded"></i>
    <!-- 已下载：点击打开文件夹 -->
    <div class="file-icon"
         v-else-if="!progressVisible && isDownloaded"
         @click="openFile">
      <span class="el-icon-document"></span>
    </div>
    <!-- 正在下载：显示进度圈 -->
    <div v-else-if="progressVisible"
         class="download-file-progress">
      <el-progress type="circle"
                   :percentage="progress"
                   :status="progressStatus"
                   :width="iconWidth? iconWidth : 45"></el-progress>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    msgInfo: { type: Object, default: () => ({}) },
    chat: { type: Object, default: () => ({}) },
    isForward: { type: Boolean, default: false },
    bg: {
      type: String,
      default: ''
    },
    iconWidth: {
      type: String,
      default: ''
    },

  },
  data () {
    return {
      progress: 0,
      progressVisible: false,
      progressStatus: 'success',
      removeProgress: null,
      removeDone: null,
      removeError: null,
      msg: {}
    };
  },
  computed: {
    contentData () {
      if (this.isForward) {
        try {
          const forward = JSON.parse(this.msgInfo.content || '{}');
          return JSON.parse(forward.content || '{}');
        } catch (e) { return {}; }
      }
      return JSON.parse(this.msgInfo.content);
    },
    isChat () { return this.chat },
    // isMegInfo () { return this.msgInfo },
    isMegInfo: {
      get () { return this.msgInfo },
      set (val) { this.msgInfo = val }
    },
    isDownloaded () {
      return this.msgInfo && this.msgInfo.isDownload;
    }
  },
  mounted () {
    this.checkLocalFile();
    this.registerListeners();
  },
  beforeDestroy () {
    this.cleanup();
  },
  methods: {
    registerListeners () {
      this.removeProgress = window.electronAPI.onDownloadProgress(({ requestId, percent }) => {
        if (requestId === (this.isMegInfo.id || this.isMegInfo.tmpId)) {
          this.progress = percent;
        }
      });
      this.removeDone = window.electronAPI.onDownloadDone(({ requestId, filename, filePath }) => {
        if (requestId === (this.isMegInfo.id || this.isMegInfo.tmpId)) {
          this.progress = 100;
          this.progressVisible = false;
          this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, true);
          // 更新本地路径
          if (this.isForward) {
            const forward = JSON.parse(this.msgInfo.content || '{}');
            const data = { ...JSON.parse(forward.content || '{}'), localPath: filePath };
            forward.content = JSON.stringify(data);
            this.msgInfo.content = JSON.stringify(forward);
          } else {
            const data = { ...this.contentData, localPath: filePath };
            this.msgInfo.content = JSON.stringify(data);
          }
          this.chatStore.updateMessage(this.msgInfo, this.chat);
          console.log('下载完成：', filePath);
        }
      });
      this.removeError = window.electronAPI.onDownloadError(({ requestId, error }) => {
        if (requestId === (this.isMegInfo.id || this.isMegInfo.tmpId)) {
          this.progressStatus = 'exception';
          this.progressVisible = false;
          console.error('下载失败：', error);
        }
      });
    },
    cleanup () {
      this.removeProgress && this.removeProgress();
      this.removeDone && this.removeDone();
      this.removeError && this.removeError();
    },
    checkLocalFile () {
      const { localPath } = this.contentData || {};
      this.$forceUpdate()
      if (!this.isMegInfo.isDownload) return;
      if (!localPath || !window.electronAPI.checkPathExists(localPath)) {
        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, false);
      }
    },
    downloadFile () {
      const filename = this.contentData?.name;
      const downloadUrl = this.contentData?.url?.originUrl;
      if (!filename || !downloadUrl) {
        console.warn('缺少文件名或下载地址');
        return;
      }
      this.progress = 0;
      this.progressVisible = true;
      this.progressStatus = 'success';
      const requestId = this.isMegInfo.id || this.isMegInfo.tmpId;
      console.log(this.isChat.targetId, this.isMegInfo.id);
      
      this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, false);
      window.electronAPI.downloadFile({ url: downloadUrl, filename, requestId });
    },
    openFile () {
      const { localPath, name } = this.contentData || {};
      const filename = name;

      if (localPath && window.electronAPI.checkPathExists(localPath)) {
        window.electronAPI.showInLocalFolder(localPath);
      } else {
        // 本地文件不存在，更新状态为未下载
        console.warn('本地文件已被删除，恢复为未下载状态');

        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, false);

        // 更新 msgInfo.content 中的 localPath 字段
        if (this.isForward) {
          const forward = JSON.parse(this.msgInfo.content || '{}');
          const newContent = { ...JSON.parse(forward.content || '{}'), localPath: null };
          forward.content = JSON.stringify(newContent);
          this.msgInfo.content = JSON.stringify(forward);
        } else {
          const newContent = { ...this.contentData, localPath: null };
          this.msgInfo.content = JSON.stringify(newContent);
        }
        this.chatStore.updateMessage(this.msgInfo, this.chat);

        // 调用 fallback：根据文件名去 Downloads 目录找
        if (filename) {
          window.electronAPI.showInFolderByName(filename);
        }
      }
    }
  },
  watch: {
    msgInfo: {
      handler (val) {
        console.log('chat-item msgInfo', val);
        if (val && typeof val.isDownload === 'undefined') {
          this.$set(val, 'isDownload', false);
        }
        this.msg = val;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped lang="scss">
  .download-file {
    width: 45px;
    height: 45px;
    background-color: #3065ec;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    color: #fff;
    cursor: pointer;

    .el-icon-bottom {
      cursor: pointer;
    }

    .file-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .download-file-progress {
      width: 100%;
      height: 100%;
    }

    ::v-deep .el-progress {
      width: 45px;
      height: 45px;

      .el-progress-circle {
        width: 45px !important;
        height: 45px !important;
      }

      .el-icon-check {
        font-size: 0;
      }
    }
  }
</style>
