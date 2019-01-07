
<template>
    <div id="tag_panel">
      <div class="tagPanel" v-on:click="taggingEnabled = !taggingEnabled; toggleTagging();" v-bind:class="{ active: taggingEnabled }">
          <font-awesome-icon icon="tag" />
      </div>
    </div>
</template>

<style scoped>
/* Style the button that is used to open and close the collapsible content */
.tagPanel {
 background-color: transparent;
 color: white;
 cursor: pointer;
 padding: 5px;
 border: none;
 text-align: left;
 outline: none;
 font-size: 25px;
 z-index: 2001;
 position: absolute;
 right:30px;
 top:0px;
 width: 30px;
 height: 30px;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .iconPanel:hover {
 color: #000;
}
</style>

<script>
/* eslint-disable */


export default {
  name: 'tag',

  data: function () {
    return {
      taggingEnabled: false,
    }
  },

  mounted: function () {
  },

  created: function () {

  },

  computed: {
  },

  methods: {
      toggleTagging: function() {
        if (this.taggingEnabled) {
          this.$parent.$emit('navigationDisabled');
          this.$parent.$emit('taggingEnabled');
        } else {
          this.$parent.$emit('navigationEnabled');
          this.$parent.$emit('taggingDisabled');
        }
      }
    }
}
</script>
