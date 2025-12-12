<template>
  <div class="generate-button-container">
    <el-button class="generate-button" type="primary" @click="generatePaper">
      <span class="button-text">开始生成</span>
    </el-button>
  </div>
</template>

<script >
export default {
  methods: {
    generatePaper() {
      this.$bus.emit('handleGenerate')
      // this.$emit("generatePaper");
    },
  },
}
</script>

<style lang="scss" scoped>
.generate-button-container {
  width: 914px;
  flex-shrink: 0;
  // align-self: stretch;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  column-gap: 657px;
  row-gap: 0px;
  position: relative;
  margin: 16px 0px;

  .generate-button {
    flex-shrink: 0;
    transform-origin: right;
    transform: scale(.8);
    width: 160px;
    height: 56px;
    box-shadow: 0px 21px 27px -10px rgba(96, 60, 255, 0.48);
    border-radius: 65px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    row-gap: 0px;
    padding: 0px 64px;
    overflow: hidden;
    background: linear-gradient(
      15deg,
      rgba(74, 37, 225, 1) 0%,
      rgba(123, 90, 255, 1) 93%,
      rgba(123, 90, 255, 1) 100%
    );
    border: none;
    cursor: pointer;

    &:hover,
    &:focus {
      background: linear-gradient(
        15deg,
        rgba(74, 37, 225, 0.9) 0%,
        rgba(123, 90, 255, 0.9) 93%,
        rgba(123, 90, 255, 0.9) 100%
      );
    }

    .button-text {
      flex-shrink: 0;
      white-space: nowrap;
      color: #ffffff;
      font-size: 18px;
      line-height: 27px;
      font-weight: 600;
    }
  }
}
</style>
