<template>
    <div v-show='{show}' :id='ttpDivid' :class="cssClass">
        <div>
            <span :id='ttpLabelid'>{{labeltext}}</span>
        </div>
        <div>
          <v-tooltip bottom>
            <v-btn fab small color='teal darken-3' slot="activator" @click="$emit('saveHome')">
              <v-icon dark>mdi-home-map-marker</v-icon>
            </v-btn>
            <label>als Heimatpunkt speichern</label>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn fab small color='light-blue darken-4' slot="activator">
              <v-icon dark>add_location</v-icon>
            </v-btn>
            <label>Adresse speichern</label>
          </v-tooltip>
        </div>
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
      default: () => ['mtooltip', 'mtooltip-static'],
    },
    labeltext: {
      type: String,
      default: "I'm a tooltip",
    },
    show: true,
  },
  data() {
    return {
      //   show: true, // display:none
      //   labeltext: 'toltiptext', // default text of label
    };
  },
  methods: {},
};
</script>

<style>
button.btn.btn--floating {
  width: 25px;
  height: 25px;
}
</style>
