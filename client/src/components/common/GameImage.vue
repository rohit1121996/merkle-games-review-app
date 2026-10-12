<template>
  <div
    class="game-image-wrapper"
    :class="{ 'is-loading': loading, 'has-error': error }"
  >
    <img
      v-show="!error"
      :src="src"
      :alt="alt"
      @load="onLoad"
      @error="onError"
      class="game-image"
    />
    <div v-if="error" class="fallback-image" aria-label="Image failed">
      <span class="fallback-icon"> Broken Image </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const error = ref(false);

const onLoad = () => {
  loading.value = false;
};

const onError = () => {
  loading.value = false;
  error.value = true;
};
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: $border-color;
  overflow: hidden;

  &.is-loading {
    animation: pulse 1.5s infinite;
  }
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fallback-image {
  @include flex-center;
  width: 100%;
  height: 100%;
  background-color: $border-color;

  .fallback-icon {
    font-size: 3rem;
    opacity: 0.5;
  }
}

@keyframes pulse {
  0% {
    background-color: $border-color;
  }
  50% {
    background-color: color-mix(in srgb, $border-color 90%, black);
  }
  100% {
    background-color: $border-color;
  }
}
</style>
