<template>
  <transition name="viewer-fade">
    <ImageViewer
      v-if="visible"
      :url-list="urlList"
      :z-index="zIndex"
      :initial-index="initialIndex"
      :append-to-body="appendToBody"
      :mask-closable="maskClosable"
      :on-close="closeViewer"
    />
  </transition>
</template>

<script>
import ImageViewer from "element-ui/packages/image/src/image-viewer";

export default {
  components: { ImageViewer },
  props: {
    urlList: {
      type: Array,
      default: () => [],
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
    maskClosable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    closeViewer() {
      this.visible = false;
    },
  },
};
</script>
