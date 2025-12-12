<template>
  <div class="hello">
    <h1>{{ title }}</h1>
    <el-button type="primary" @click="inc">点击：{{ count }}</el-button>
  </div>
</template>

<script>
import { useExampleStore } from '@/stores/exampleStore'

export default {
  name: 'HelloWorld',
  data() {
    return {
      title: 'Hello Vue 3 (Options API)'
    }
  },
  created() {
    this.$store = useExampleStore()
  },
  computed: {
    count() {
      return this.$store.count
    }
  },
  methods: {
    inc() {
      this.$store.increment()
    }
  }
}
</script>

<style scoped>
.hello { padding: 1rem; }
</style>
