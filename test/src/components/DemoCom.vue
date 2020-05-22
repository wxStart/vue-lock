<template>
  <div :class="$style.root">
    <div :class="$style.title">{{ copyWriting }}</div>
    <div :class="$style.canvas">
      <canvas-lock ref="canvas" @drawEnd="drawEnd" :disbaled="disbaledDraw"></canvas-lock>
    </div>
    <div @click="onReset">重新开始</div>
  </div>
</template>

<script>
import { Toast } from 'mint-ui';
import md5 from 'blueimp-md5';
import { CanvasLock } from '../../../src/index'; // 包的路径

const ENTER_PASSWORD = '请录入手势解锁密码';
const RSET_ENTER_PASSWORD = '请重新录入密码';
const ENTER_AGAIN = '请再次输入';
const INCONSISTENT_PASSWORD = '两次不一致，重新输入';
const PASS_LOCK = '请滑动手势解锁';
const PASS_WORD_ERROR = '密码错误，请重新输入';
const PASS_OK = '解锁成功';
const PASS_WORD_LENGTH = '密码长度至少为四位';
const errorColor = 'red';

export default {
  components: {
    CanvasLock,
  },
  data() {
    return {
      copyWriting: '初始化中,请等待',
      disbaledDraw: true,
      lockStep: 0,
      firstPwd: null,
      userHasPwd: window.sessionStorage['lock_password'] ? true : false,
    };
  },
  methods: {
    init() {
      if (this.userHasPwd) {
        this.copyWriting = PASS_LOCK;
        this.lockStep = 2;
      } else {
        this.lockStep = 1;
        this.firstPwd = null;
        this.copyWriting = ENTER_PASSWORD;
      }
      this.disbaledDraw = false;
    },

    drawStatusPoint(color) {
      this.$refs.canvas.drawStatusPoint(color);
    },

    drawEnd(pwd) {
      if (pwd.length < 4) {
        const oldCopyWriting = this.copyWriting;
        this.drawStatusPoint(errorColor);
        this.copyWriting = PASS_WORD_LENGTH;
        this.disbaleClick = true;
        this.timer = setTimeout(() => {
          this.copyWriting = oldCopyWriting;
          this.disbaleClick = false;
          clearTimeout(this.timer);
        }, 1000);
        return;
      }
      const passWord = this.getMD5Pwd(pwd);
      if (this.lockStep === 1) {
        if (!this.firstPwd) {
          this.firstPwd = passWord;
          this.copyWriting = ENTER_AGAIN;
        } else if (this.firstPwd === passWord) {
          this.drawStatusPoint('#2CFF26');
          this.onEntryPwd(passWord);
        } else {
          this.copyWriting = INCONSISTENT_PASSWORD;
          this.drawStatusPoint(errorColor);
          // 清除第一次的密码
          this.firstPwd = null;
        }
      } else if (this.lockStep === 2) {
        this.onLogin(passWord);
      }
    },

    getMD5Pwd(pwd) {
      const oData = pwd;
      const pasArr = [];
      for (var i = 0; i < oData.length; i++) {
        pasArr.push(oData[i].index);
      }
      return md5(JSON.stringify(pasArr));
    },
    async onEntryPwd(passWord) {
      //录入密码
      const userCode = this.userId;
      const randomNumber = Math.random();
      const result = { ok: randomNumber > 0.3 ? true : false }; // 模拟接口失败
      if (result.ok) {
        Toast({
          message: '录入手势成功，请尝试解锁',
          iconClass: 'iconfont iconchenggong',
          duration: 2000,
        });
        //更新密码的状态
        this.userHasPwd = true;
        this.copyWriting = PASS_LOCK;
        this.lockStep = 2;
        window.sessionStorage['lock_password'] = passWord;
      } else {
        Toast({
          message: '录入手势解锁失败，请稍后重试',
          iconClass: 'iconfont icon71shibai',
          duration: 2000,
        });
        this.copyWriting = RSET_ENTER_PASSWORD;
        // 清除第一次的密码
        this.firstPwd = null;
      }
    },
    async onLogin(passWord) {
      const result = { ok: passWord == window.localStorage['lock_password'] ? true : false }; //模拟接口验证
      if (result.ok) {
        this.copyWriting = PASS_OK;
      } else {
        this.copyWriting = PASS_WORD_ERROR;
        this.drawStatusPoint(errorColor);
      }
    },

    onReset() {
      window.sessionStorage.removeItem('lock_password');
      this.userHasPwd = false;
      this.init();
    },
  },

  mounted() {
    document.title = '手势认证';
    this.init();
  },
};
</script>

<style lang="scss" module>
@import '@/styles/common';
.root {
  height: 100%;
  text-align: center;
  background-color: #81aaff;
  padding-top: px2rem(80);
  .title {
    color: #fff;
    font-size: px2rem(40);
    font-weight: 500;
  }
  .canvas {
    padding-top: px2rem(60);
  }
}
</style>
