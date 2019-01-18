
<template>
  <div id="options_form">
    <div ref="optsIcon" v-on:click="visible = !visible" class="optsIcon iconOpen" v-bind:class="{ active: visible }">
      <font-awesome-icon icon="cog" />
    </div>
    <div class="optsPanel" v-if="visible">
    <section size="is-small">
      <b-collapse class="card">
          <div slot="trigger" slot-scope="props" class="card-header">
              <p class="card-header-title">
                  viewer options
              </p>
              <a class="card-header-icon">
                  <b-icon
                      :icon="props.open ? 'menu-down' : 'menu-up'">
                  </b-icon>
              </a>
          </div>
          <div class="card-content">
              <!--
              <b-field label="Tag type">
                  <b-select placeholder="Select a tag type">
                    <option v-for="item in opts" :value="item.value">
                        {{item.key}}
                    </option>
                  </b-select>
              </b-field>
              -->
              <div class="field">
                  <b-checkbox v-model="options.context" @input="Tchange">
                      context
                  </b-checkbox>
              </div>
              <div class="field">
                  <b-checkbox v-model="options.tags" @input="Tchange">
                      tags
                  </b-checkbox>
              </div>
              <div class="field" v-on:change="Tchange">
                  <b-checkbox v-model="options.labels" @input="Tchange">
                      labels
                  </b-checkbox>
              </div>
              <div class="field">
                  <b-checkbox v-model="options.spots" @input="Tchange">
                      map spots
                  </b-checkbox>
              </div>
          </div>
          <footer class="card-footer">
              <a class="card-footer-item" v-on:click="Tcancel">Close</a>
          </footer>
      </b-collapse>
    </section>
    </div>
  </div>

</template>

<style lang="scss" scoped>
/* Style the button that is used to open and close the collapsible content */
.optsPanel {
  position: absolute;
  bottom:0px;
  right:0px;
  text-align: left;
  width: 200;
  height: auto;
  z-index: 2003;
  padding: 5px;
}

.iconOpen {
 right:95px;
}

.optsIcon {
 background-color: transparent;
 color: white;
 cursor: pointer;
 padding: 5px;
 border: none;
 text-align: left;
 outline: none;
 font-size: 20px;
 z-index: 1003;
 position: absolute;
 top:0px;
 width: 30px;
 height: 30px;
 z-index: 2002;
}

.active, .iconPanel:hover {
 color: #000 !important;
}

@import "~bulma/sass/utilities/_all";

</style>

<script>
/* eslint-disable */

export default {
  name: 'optionsform',

  data: function () {
    return {
      visible: false,
      opts: [
        {key: 'UNO', value: 'uno'},
        {key: 'DUE', value: 'due'},
        {key: 'TRE', value: 'tre'}
      ],
      options: {
        context:true,
        labels: true,
        tags: true,
        spots: true,
      },
    }
  },

  mounted: function () {

  },

  created: function () {
      this.$on('input', this.editTag)
      console.log("CREATED OPTS FORM")
  },

  computed: {
  },

  methods: {
    Tcancel: function() {
        this.visible = false
    },
    Tchange: function({ type, target }) {
        this.$parent.$emit('options_changed', this.options);
    },
  }
}
</script>
