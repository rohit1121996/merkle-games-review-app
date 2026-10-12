<template>
  <div class="error-state-container" role="alert">
    <h3>Error</h3>
    <p>{{ message }}</p>
    <button v-if="retry" @click="retry" class="retry-btn">Try Again</button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true,
  },
  retry: {
    type: Function,
    default: null,
  },
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.error-state-container {
  padding: $spacing-xl;
  background-color: var(--color-danger-surface);
  border: 1px solid $danger;
  border-radius: $border-radius;
  color: var(--color-danger-text);
  text-align: center;
  margin: $spacing-xl 0;

  h3 {
    margin-bottom: $spacing-sm;
  }

  .retry-btn {
    margin-top: $spacing-md;
    background-color: $danger;
    color: white;
    border: none;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius;

    &:hover {
      background-color: color-mix(in srgb, $danger 85%, black);
    }
  }
}
</style>
