<template>
  <div class="download-file"
       v-if="chat && msgInfo">
    <!-- 未下载：显示下载图标 -->
    <i class="el-icon-bottom"
       @click="downloadFile"
       v-if="progressVisible === false && this.isMegInfo.isDownload === false"></i>
    <!-- 已下载：点击打开文件夹 -->
    <div class="file-icon"
         v-else-if="progressVisible === false && this.isMegInfo.isDownload"
         @click="openFile">
      <span class="el-icon-document"></span>
    </div>
    <!-- 正在下载：显示进度圈 -->
    <div v-else
         class="download-file-progress">
      <el-progress type="circle"
                   :percentage="progress"
                   :status="progressStatus"
                   :width="45"></el-progress>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      progress: 0,
      progressVisible: false,
      progressStatus: 'success',
      fileCheckInterval: null
    };
  },
  props: {
    msgInfo: {
      type: Object,
      default: () => ({})
    },
    chat: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    this.checkDownloaded();
    this.startFileCheckTimer()

    // 防止重复注册监听
    window.electronAPI.onDownloadProgress(({ filename, percent }) => {
      if (filename === this.contentData.name) {
        this.progress = percent;
      }
    });

    window.electronAPI.onDownloadDone(({ filename, filePath }) => {
      console.log('download done', filename, filePath);

      if (filename === this.contentData.name) {
        this.progress = 100;
        this.progressVisible = false;
        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, true)
        console.log('下载完成：', filePath);
      }
    });

    window.electronAPI?.onDownloadError?.((errMsg) => {
      this.progressStatus = 'exception';
      this.progressVisible = false;
      console.error('下载失败：', errMsg);
    });
  },
  beforeDestroy () {
    if (this.fileCheckInterval) {
      clearInterval(this.fileCheckInterval);
    }
  },
  methods: {
    validStatus (status) {
      console.log('validStatus:', status);

      const valid = ['success', 'exception', 'warning'];
      return valid.includes(status) ? status : 'success';
    },
    checkDownloaded () {
      this.progressVisible = false;
      this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, false)
      if (this.contentData.localPath) {
        this.progressVisible = false;
        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, true)
      } else {
        const filename = this.contentData?.name;
        if (!filename) return;
        const exists = window.electronAPI.checkFileExists(filename);
        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, !!exists);
      }
    },
    startFileCheckTimer () {
      const filename = this.contentData?.name;
      if (!filename || this.contentData?.localPath) return;

      // 先清一次
      if (this.fileCheckInterval) {
        clearInterval(this.fileCheckInterval);
      }

      // 每2秒检查一次
      this.fileCheckInterval = setInterval(() => {
        const exists = window.electronAPI.checkFileExists(filename);
        // console.log('check file exists', exists);
        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, exists)
        // 如果文件已存在了，停止监听
        // if (exists) {
        //   clearInterval(this.fileCheckInterval);
        //   this.fileCheckInterval = null;
        // }
      }, 2000);
    },
    downloadFile () {
      const filename = this.contentData?.name;
      const downloadUrl = this.contentData?.url?.originUrl;
      this.chatStore.setDownload(this.isChat.sendId,)

      if (!filename || !downloadUrl) {
        console.warn('缺少文件名或下载地址');
        return;
      }

      this.progress = 0;
      this.progressVisible = true;
      this.progressStatus = 'success';
      this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, true)
      window.electronAPI?.downloadFile?.({
        url: downloadUrl,
        filename: filename
      });
    },
    openFile () {
      if (this.contentData.localPath) {
        const filePath = this.contentData.localPath;
        window.electronAPI.showInLocalFolder(filePath);
      } else {
        const filename = this.contentData?.name;
        if (!filename) return;
        window.electronAPI.showInFolderByName(filename);
      }
    }
  },
  computed: {
    contentData () {
      return JSON.parse(this.isMegInfo.content)
    },
    isChat () {
      return this.chat
    },
    isMegInfo () {
      return this.msgInfo
    },
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
