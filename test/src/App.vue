<template>
  <div id="app" :class="$style.app">
    <demo-com />
  </div>
</template>

<script>
import DemoCom from './components/DemoCom';
export default {
  components: {
    DemoCom
  },
  data() {
    return {
      loading: true
    };
  },
  methods: {
    initFontSize() {
      //得到手机屏幕的宽度
      let htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
      //得到html的Dom元素
      let htmlDom = document.getElementsByTagName('html')[0];
      //设置根元素字体大小
      htmlDom.style.fontSize = htmlWidth / 20 + 'px';
    }
  },
  mounted() {
    this.initFontSize();
  }
};
</script>

<style lang="scss" module>
@import '@/styles/common';
html,
body {
  @include full;
  overflow: hidden;
}
.app {
  @include full;
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }
}

:global {
  .canvas-container .title {
    font-size: px2rem(44);
  }

  .mint-toast-icon.iconfont.icon71shibai {
    font-size: px2rem(64);
    color: $g-red-color;
  }
  .mint-toast-icon.iconfont.icontixingshixin {
    font-size: px2rem(64);
    color: $g-blue-color;
  }
  .mint-toast-icon.iconfont.iconchenggong {
    font-size: px2rem(64);
    color: $g-green-color;
  }
}
</style>
