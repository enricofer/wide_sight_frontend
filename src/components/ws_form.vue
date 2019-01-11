
<template>
  <div class="formPanel" v-if="tagKey">
  <section size="is-small">
    <b-collapse class="card">
        <div slot="trigger" slot-scope="props" class="card-header">
            <p class="card-header-title">
                {{ tagKey }}
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
            <b-field label="Note">
                <b-input type="textarea" ref="notefield" v-model="note_field"></b-input>
            </b-field>
        </div>
        <footer class="card-footer">
            <a class="card-footer-item" v-on:click="Tcancel">Close</a>
            <a class="card-footer-item" ></a>
            <a class="card-footer-item" v-on:click="Tdelete">Delete</a>
            <a class="card-footer-item" v-on:click="Tsave">Save</a>
        </footer>
    </b-collapse>
  </section>
  </div>

</template>

<style lang="scss">
/* Style the button that is used to open and close the collapsible content */
.formPanel {
  position: absolute;
  bottom:0px;
  right:0px;
  text-align: left;
  width: 300;
  height: auto;
  z-index: 2002;
  padding: 5px;
}

html {
  font-size: 10px;
}

@import "~bulma/sass/utilities/_all";

</style>

<script>
/* eslint-disable */

export default {
  name: 'tagform',

  data: function () {
    return {
      tagKey: undefined,
      note_field: "",
      opts: [
        {key: 'UNO', value: 'uno'},
        {key: 'DUE', value: 'due'},
        {key: 'TRE', value: 'tre'}
      ]
    }
  },

  mounted: function () {
  },

  created: function () {
    this.$parent.$on('editTag', this.editTag)
    this.$parent.$on('editSpot', this.editTag)
  },

  computed: {
  },

  methods: {
    editTag: function(tagKey) {
        this.tagKey = tagKey
        this.retrieve_url = this.$parent.backend+"/image_objects/"+tagKey+"/?apikey="+this.$parent.apikey;
        console.log(this.retrieve_url);
        const component = this
        $.ajax({
              type: 'GET',
              url: component.retrieve_url,
              error: function(errormsg) { console.log("ERROR", errormsg);},
              success: function(resultData) {
                  component.formData = resultData
                  console.log(resultData)
                  if (resultData["note"]){
                        component.note_field = resultData["note"]
                  } else {
                      component.note_field = ""
                  }
              }
        })
    },

    Tsave: function() {
        console.log("saving", this.note_field)
        const tagData = {
            note: this.note_field
        }
        const component = this
        $.ajax({
              type: 'PATCH',
              url: component.retrieve_url,
              data: JSON.stringify(tagData),
              contentType : 'application/json',
              error: function(errormsg) { console.log("ERROR", errormsg);},
              success: function(resultData) {
                  component.$parent.$emit('tag_edited',tagData,resultData)
                  component.tagKey = undefined
              }
        })
    },

    Tdelete: function() {
        const component = this
        $.ajax({
              type: 'DELETE',
              url: component.retrieve_url,
              error: function(errormsg) { console.log("ERROR", errormsg);},
              success: function(resultData) {
                  switch (component.formData['type']) {
                      case 1:
                         component.$parent.$emit('tag_deleted');
                         break;
                      case 2:
                         component.$parent.$emit('spot_deleted');
                         break;
                  }
                  component.tagKey = undefined
              }
        })
    },

    Tcancel: function() {
        this.tagKey = undefined
    }
  }
}
</script>
