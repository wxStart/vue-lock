<template>
  <canvas :style="rootStyle" ref="canvas"></canvas>
</template>

<script>
export default {
  props: {
    width: { //canvas的宽度
      type: Number,
      default: 300
    },
    height: { //canvas的高度
      type: Number,
      default: 300
    },
    chooseType: { //生成点的个数 3*3 4*4
      type: Number,
      default: 3
    },
    disbaled: {
      type: Boolean, // 禁止事件响应
      default: false
    },
    strokeStyle: { // 画笔的颜色
      type: String,
      default: '#CFE6FF'
    },
    fillStyle: { // 填充点的颜色，主要是手势解锁的点
      type: String,
      default: '#CFE6FF'
    },
    pathLineWidth: { // 轨迹线的粗细
      type: Number,
      default: 3
    },
    pathCircleWidth: { // 生成点的粗细
      type: Number,
      default: 2
    }
  },
  computed: {
    rootStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      };
    }
  },
  data() {
    return {
      isMobile: true,
      lastPoint: [],
      restPoint: [],
      devicePixelRatio: window.devicePixelRatio || 1
    };
  },
  methods: {
    init() {
      this.canvas = this.$refs.canvas;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.canvas.height = this.height * this.devicePixelRatio;
      this.canvas.width = this.width * this.devicePixelRatio;
      this.ctx = this.canvas.getContext('2d');
      this.createCircle();
      this.bindEvent();
    },

    drawCle(x, y) {
      // 初始化解锁密码面板
      this.ctx.strokeStyle = this.strokeStyle;
      this.ctx.lineWidth = this.pathCircleWidth;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    drawPoint() {
      // 初始化圆心
      for (let i = 0; i < this.lastPoint.length; i++) {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
      }
    },

    drawStatusPoint(color) {
      // 初始化状态线条
      for (let i = 0; i < this.lastPoint.length; i++) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    },

    drawLine(po) {
      // 解锁轨迹
      this.ctx.beginPath();
      this.ctx.lineWidth = this.pathLineWidth;
      this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
      for (let i = 1; i < this.lastPoint.length; i++) {
        this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
      }
      this.ctx.lineTo(po.x, po.y);
      this.ctx.stroke();
      this.ctx.closePath();
    },

    createCircle() {
      // 创建解锁点的坐标，根据canvas的大小来平均分配半径
      const n = this.chooseType;
      let count = 0;
      this.r = this.ctx.canvas.width / (2 + 4 * n); // 公式计算
      this.lastPoint = [];
      this.arr = [];
      this.restPoint = [];
      const r = this.r;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          count++;
          const obj = {
            x: j * 4 * r + 3 * r,
            y: i * 4 * r + 3 * r,
            index: count
          };
          this.arr.push(obj);
          this.restPoint.push(obj);
        }
      }
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      for (let i = 0; i < this.arr.length; i++) {
        this.drawCle(this.arr[i].x, this.arr[i].y);
      }
    },

    reset() {
      // 复位
      this.createCircle();
    },

    touchstartOrMouseDown(e) {
      e.preventDefault(); // 某些 android 的 touchmove不宜触发 所以增加此行代码
      if (this.disbaled) return;
      const self = this;
      const po = self.getPosition(e);
      for (let i = 0; i < self.arr.length; i++) {
        if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {
          self.touchFlag = true;
          self.drawPoint(self.arr[i].x, self.arr[i].y);
          self.lastPoint.push(self.arr[i]);
          self.restPoint.splice(i, 1);
          break;
        }
      }
    },
    touchmoveOrMouseMove(e) {
      if (this.disbaled) return;
      const self = this;
      if (self.touchFlag) {
        self.update(self.getPosition(e));
      }
    },
    touchendOrMouseup() {
      if (this.disbaled) return;
      const self = this;
      if (self.touchFlag) {
        self.touchFlag = false;
        self.$emit('drawEnd', self.lastPoint);
        setTimeout(() => {
          self.reset();
        }, 300);
      }
    },
    bindEvent() {
      const elDom = this.canvas;
      elDom.addEventListener('touchstart', this.touchstartOrMouseDown.bind(this), { passive: false });
      elDom.addEventListener('mousedown', this.touchstartOrMouseDown.bind(this), { passive: false });
      elDom.addEventListener('touchmove', this.touchmoveOrMouseMove.bind(this), { passive: false });
      elDom.addEventListener('mousemove', this.touchmoveOrMouseMove.bind(this), { passive: false });
      elDom.addEventListener('touchend', this.touchendOrMouseup.bind(this), { passive: false });
      elDom.addEventListener('mouseup', this.touchendOrMouseup.bind(this), {
        passive: false
      });
    },

    update(po) {
      // 核心变换方法在touchmove时候调用
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      for (let i = 0; i < this.arr.length; i++) {
        // 每帧先把面板画出来
        this.drawCle(this.arr[i].x, this.arr[i].y);
      }

      this.drawPoint(this.lastPoint); // 每帧花轨迹
      this.drawLine(po, this.lastPoint); // 每帧画圆心

      for (let i = 0; i < this.restPoint.length; i++) {
        if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
          this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
          this.lastPoint.push(this.restPoint[i]);
          this.restPoint.splice(i, 1);
          break;
        }
      }
    },
    getPosition(e) {
      // 获取touch点相对于canvas的坐标
      let rect = '',
        po = {};
      const x = e.clientX ? e.clientX : e.touches[0].clientX;
      const y = e.clientY ? e.clientY : e.touches[0].clientY;

      if (this.isMobile) {
        rect = e.currentTarget.getBoundingClientRect();
      } else {
        rect = e.target.getBoundingClientRect();
      }
      po = {
        x: (x - rect.left) * this.devicePixelRatio,
        y: (y - rect.top) * this.devicePixelRatio
      };
      return po;
    }
  },
  created() {
    this.isMobile = window.navigator.userAgent
      .toString()
      .toLowerCase()
      .includes('mobile');
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="sass" module></style>
