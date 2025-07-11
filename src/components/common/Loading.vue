<template>
  <div
    v-if="visible"
    class="loading-mask"
    :class="{ fullscreen }"
  >
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p v-if="text" class="loading-text">{{ text }}</p>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-mask {
  position: absolute;
  top: 0;
  left: 350px;
  width: calc(100% - 350px);
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-mask.fullscreen {
  position: fixed;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
