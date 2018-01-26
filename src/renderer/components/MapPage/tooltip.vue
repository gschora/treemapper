<template>
  <div>
      <span>{{tooltip.text}}</span>
  </div>
</template>

<script>
export default {
  props: {
    tooltip: {
      type: Object,
      default: {
        text: 'rararara',
      },
    },
  },
};
</script>

<style>

</style>
