<template>
  <div v-show='show' :id='ttpDivid' :class="cssClass">
      <span :id='ttpLabelid'>{{text}}</span>
  </div>
</template>

<script>
export default {
  props: {
    ttpLabelid: {
      // changes label id
      type: String,
      default: 'tooltptxt',
    },
    ttpDivid: {
      // changes outer div id
      type: String,
      default: 'tooltpdiv',
    },
    cssClass: {
      // css classes to use
      type: Array,
      default: () => ['tooltip', 'tooltip-static'],
    },
  },
  data() {
    return {
      show: false, // display:none
      text: 'tooltiptext', // default text of label
    };
  },
};
</script>

<style>

</style>
