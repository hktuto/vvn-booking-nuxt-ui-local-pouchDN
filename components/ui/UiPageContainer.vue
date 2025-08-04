<template>
  <div 
    :class="[
      'page-container',
      paddingClass,
      $attrs.class
    ]"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  /**
   * Padding variant to use
   * @default 'default'
   */
  padding?: 'none' | 'small' | 'default' | 'large' | 'custom'
  /**
   * Custom padding classes (only used when padding is 'custom')
   */
  customPadding?: string
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'default',
  customPadding: ''
})

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'small':
      return 'px-6 py-2'
    case 'default':
      return 'p-6'
    case 'large':
      return 'p-8'
    case 'custom':
      return props.customPadding
    default:
      return 'p-6'
  }
})
</script>

<style scoped>
.page-container {
  /* Additional styles can be added here if needed */
}
</style>