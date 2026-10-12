<template>
  <div class="empty-state-container">
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: "No data available.",
  },
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.empty-state-container {
  @include flex-center;
  padding: $spacing-xl;
  color: $text-muted;
  text-align: center;
  background-color: $card-bg;
  border: 1px dashed $border-color;
  border-radius: $border-radius-lg;
}
</style>
