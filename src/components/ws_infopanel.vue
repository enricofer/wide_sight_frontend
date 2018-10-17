
<template>
    <div id="info_panel">
      <font-awesome-icon class="collapsible" icon="appIcon" />
      <div class="content">
        {{key}}
        {{lat}}
        {{lon}}
      </div>
    </div>
</template>

<style scoped>
/* Style the button that is used to open and close the collapsible content */
.collapsible {
 background-color: #eee;
 color: #444;
 cursor: pointer;
 padding: 18px;
 width: 50px;
 border: none;
 text-align: left;
 outline: none;
 font-size: 15px;
 z-index: 2001
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .collapsible:hover {
 background-color: #ccc;
}

/* Style the collapsible content. Note: hidden by default */
.content {
 padding: 0 18px;
 display: none;
 overflow: hidden;
 background-color: #f1f1f1;
 z-index: 2001
}
</style>

<script>
/* eslint-disable */

import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

export default {
  name: 'infopanel',

  data: function () {
    return {
      key: 'askhdfljhabdlahsdbflashdb',
      lat: 14.78,
      lon: 56.99
    }
  },

  mounted: function () {
  },

  created: function () {
  },

  computed: {
    infoIcon () {
      return faInfoCircle
    }
  },

  methods: {

    }
}
</script>
