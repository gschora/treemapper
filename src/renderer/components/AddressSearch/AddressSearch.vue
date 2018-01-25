<template>
<v-text-field
        name='searchAddressTxt'
        ref="autocomplete"
        type="text"
        :class="[classname, show  ? 'show': '']"
        :id="id"
        :placeholder="placeholder"
        v-model="autocompleteText"
        @focus="onFocus()"
        @blur="onBlur()"
        @change="onChange"
        @keypress="onKeyPress"
        @keyup="onKeyUp"
        prepend-icon="search"
        :prepend-icon-cb="toggle"
        clearable
        hide-details
        single-line
        ></v-text-field>
</template>

<script>
export default {
  name: 'VueGoogleAutocomplete',
  props: {
    id: {
      type: String,
      required: true,
    },
    classname: String,
    placeholder: {
      type: String,
      default: 'Start typing',
    },
    types: {
      type: String,
      default: 'address',
    },
    country: {
      type: [String, Array],
      default: null,
    },
    enableGeolocation: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /**
       * The Autocomplete object.
       *
       * @type {Autocomplete}
       * @link https://developers.google.com/maps/documentation/javascript/reference#Autocomplete
       */
      autocomplete: null,
      /**
       * Autocomplete input text
       * @type {String}
       */
      autocompleteText: '',
      show: false,
    };
  },
  watch: {
    autocompleteText(newVal, oldVal) {
      this.$emit('inputChange', { newVal, oldVal }, this.id);
    },
    country() {
      this.autocomplete.setComponentRestrictions({
        country: this.country === null ? [] : this.country,
      });
    },
  },
  mounted() {
    /* global google: true */ // this is important otherwise eslint doesnt find the google viariable

    const options = {};
    if (this.types) {
      options.types = [this.types];
    }
    if (this.country) {
      options.componentRestrictions = {
        country: this.country,
      };
    }

    const ac = document.getElementById(this.id);
    ac.ref = 'autocomplete';
    this.autocomplete = new google.maps.places.Autocomplete(
      ac,
      options,
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        this.$emit('no-results-found', place, this.id);
        return;
      }
      const addressComponents = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name',
      };
      const returnData = {};
      if (place.address_components !== undefined) {
        // Get each component of the address from the place details
        for (let i = 0; i < place.address_components.length; i += 1) {
          const addressType = place.address_components[i].types[0];
          if (addressComponents[addressType]) {
            const val = place.address_components[i][addressComponents[addressType]];
            returnData[addressType] = val;
          }
        }
        returnData.latitude = place.geometry.location.lat();
        returnData.longitude = place.geometry.location.lng();
        // return returnData object and PlaceResult object
        this.$emit('placechanged', returnData, place, this.id);
        // update autocompleteText then emit change event
        this.autocompleteText = document.getElementById(this.id).value;
        this.onChange();
      }
    });
  },
  methods: {
    /**
     * When the input gets focus
     */
    onFocus() {
      this.geolocate();
      this.$emit('focus');
    },
    /**
     * When the input loses focus
     */
    onBlur() {
      this.$emit('blur');
      this.show = !this.show;
    },
    /**
     * When the input got changed
     */
    onChange() {
      this.$emit('change', this.autocompleteText);
    },
    /**
     * When a key gets pressed
     * @param  {Event} event A keypress event
     */
    onKeyPress(event) {
      this.$emit('keypress', event);
    },
    /**
     * When a keyup occurs
     * @param  {Event} event A keyup event
     */
    onKeyUp(event) {
      this.$emit('keyup', event);
    },
    /**
     * Clear the input
     */
    clear() {
      this.autocompleteText = '';
    },
    /**
     * Focus the input
     */
    focus() {
      this.$refs.autocomplete.focus();
    },
    /**
     * Blur the input
     */
    blur() {
      this.$refs.autocomplete.blur();
    },
    /**
     * Update the value of the input
     * @param  {String} value
     */
    update(value) {
      this.autocompleteText = value;
    },
    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
    geolocate() {
      if (this.enableGeolocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            const circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy,
            });
            this.autocomplete.setBounds(circle.getBounds());
          });
        }
      }
    },
    toggle() {
      if (!this.show) {
        this.focus();
      }
      this.show = !this.show;
    },
  },
};

</script>

<style>
div.addressSearch {
  max-width: 0%;
  transition: max-width 1s;
}
div.addressSearch.show {
  max-width: 40%;
  transition: max-width 1s;
}
</style>
