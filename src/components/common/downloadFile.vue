<template>
  <div class="download-file"
       v-if="chat && msgInfo">
    <!-- 未下载：显示下载图标 -->
    <i class="el-icon-bottom"
       @click="downloadFile"
       v-if="!progressVisible && !this.isMegInfo.isDownload"></i>
    <!-- 已下载：点击打开文件夹 -->
    <div class="file-icon"
         v-else-if="!progressVisible && this.isMegInfo.isDownload"
         @click="openFile">
      <span class="el-icon-document"></span>
    </div>
    <!-- 正在下载：显示进度圈 -->
    <div v-else-if="progressVisible"
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
  props: {
    msgInfo: { type: Object, default: () => ({}) },
    chat: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      progress: 0,
      progressVisible: false,
      progressStatus: 'success',
      removeProgress: null,
      removeDone: null,
      removeError: null
    };
  },
  computed: {
    contentData () { return JSON.parse(this.msgInfo.content) },
    isChat () { return this.chat },
    isMegInfo () { return this.msgInfo }
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
      this.removeProgress = window.electronAPI.onDownloadProgress(({ filename, percent }) => {
        if (filename === this.contentData.name) {
          this.progress = percent;
        }
      });
      this.removeDone = window.electronAPI.onDownloadDone(({ filename, filePath }) => {
        if (filename === this.contentData.name) {
          this.progress = 100;
          this.progressVisible = false;
          this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, true);
          console.log('下载完成：', filePath);
        }
      });
      this.removeError = window.electronAPI.onDownloadError((errMsg) => {
        this.progressStatus = 'exception';
        this.progressVisible = false;
        console.error('下载失败：', errMsg);
      });
    },
    cleanup () {
      this.removeProgress && this.removeProgress();
      this.removeDone && this.removeDone();
      this.removeError && this.removeError();
    },
    checkLocalFile () {
      const { name, localPath } = this.contentData || {};
      if (localPath && window.electronAPI.checkPathExists(localPath)) {
        this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, true);
        return;
      }
      if (!name) return;
      const exists = window.electronAPI.checkFileExists(name);
      this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, !!exists);
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
      this.chatStore.setDownload(this.isChat.targetId, this.isMegInfo.id, false);
      window.electronAPI.downloadFile({ url: downloadUrl, filename });
    },
    openFile () {
      const { localPath, name } = this.contentData || {};
      if (localPath && window.electronAPI.checkPathExists(localPath)) {
        window.electronAPI.showInLocalFolder(localPath);
      } else {
        const filename = name;
        if (!filename) return;
        window.electronAPI.showInFolderByName(filename);
      }
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
