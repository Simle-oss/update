<template>
  <Button v-waves v-bind="$attrs" v-on="$listeners">
    <slot />
  </Button>
</template>

<script>
import { Button } from "element-ui";
export default {
  name: "ElButton",
  components: { Button },
};
</script>
