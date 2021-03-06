<template>
<div class="plugin-editor">
    <md-toolbar  v-if="window" class="md-dense editor-toolbar md-layout" md-elevation="1">
      <div class="md-toolbar-section-start">
        <md-button @click="save()" class="md-icon-button">
          <md-icon>save</md-icon>
          <md-tooltip>Save this plugin</md-tooltip>
        </md-button>
        <md-button @click="saveAs()" class="md-icon-button">
          <md-icon>cloud_download</md-icon>
          <md-tooltip>Export this plugin</md-tooltip>
        </md-button>
        <md-button @click="remove()" v-if="window && window.plugin&&window.plugin.config&&window.plugin.config._id" class="md-icon-button">
          <md-icon>delete</md-icon>
          <md-tooltip>Remove this plugin</md-tooltip>
        </md-button>
        <span></span>
        <md-field  v-if="window && window.plugin&&window.plugin.tags&&window.plugin.tags.length>0">
          <!-- <label for="tag">Tag</label> -->
          <md-select id="tag" @md-selected="window.plugin.tags.includes(window.plugin.tag) && reload()" v-model="window.plugin.tag" name="tag">
            <md-option :value="tag" v-for="tag in window.plugin.tags" :key="tag">{{tag}}</md-option>
          </md-select>
          <md-tooltip>Select a tag for testing, the plugin will be reloaded.</md-tooltip>
        </md-field>
      </div>
    </md-toolbar>
    <monaco-editor
      class="code_editor"
      :class="window?'editor-with-toolbar':'editor-without-toolbar' "
      v-model="codeValue"
      language="html"
      ref="monaco_editor">
    </monaco-editor>
    <!-- <div class="editor">
      <div :id="'editor_'+pluginId" style='width="auto";height="auto"'></div>
    </div> -->
</div>
</template>

<script>
import { saveAs } from 'file-saver';
import {
  randId
} from '../utils.js'

import MonacoEditor from 'vue-monaco'

window.MonacoEnvironment = {
  getWorkerUrl: function(workerId, label) {
    var fullPath = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = {
        baseUrl: '${fullPath}/static'
      };
      try {
        importScripts('${fullPath}/static/vs/base/worker/workerMain.js');
      } catch (e) {
        console.error(e)
      } finally {

      }
      `
    )}`;
  }
};

export default {
  name: 'joy',
  props: ['value', 'title', 'pluginId', 'window'],
  data() {
    return {
      codeValue: '',
    }
  },
  created(){
    this.store = this.$root.$data.store
  },
  watch: {

  },
  mounted() {
    this.codeValue = this.value
    this.editor = this.$refs.monaco_editor.getMonaco()
    this.editor.layout();
    if(this.window){
      this.window.resize = ()=>{
        setTimeout(()=>{
          this.editor.layout();
        }, 200)
        setTimeout(()=>{
          this.editor.layout();
        }, 500)
      }
    }
    setTimeout(()=>{
      this.editor.layout();
    }, 200)
    setTimeout(()=>{
      this.editor.layout();
    }, 500)

    this.editor.addCommand( window.monaco.KeyMod.CtrlCmd |  window.monaco.KeyCode.KEY_S, ()=>{
      this.save()
    });
    // this.editor.addCommand( window.monaco.KeyMod.CtrlCmd |  window.monaco.KeyCode.KEY_R, ()=>{
    //   this.reload()
    // });
  },
  methods: {
    save(){
      this.$emit('input', this.codeValue)
      this.window.save({pluginId: this.pluginId, code: this.codeValue, tag: this.window.plugin && this.window.plugin.tag}).then((config)=>{
        // this.window.data._id = config._id
        // this.window.plugin._id = config._id
        // this.window.plugin.config._id= config._id
        this.window.data.config = config

        this.reload().finally(()=>{
          this.window.data._id = config._id
          this.window.plugin = config
          this.window.name = config.name
          this.window.data._name = config.name
          this.$forceUpdate()
        })

      })

    },
    remove(){
      this.$emit('input', this.codeValue)
      this.window.data._id = null
      this.window.remove(this.window.plugin).then(()=>{
        this.window.plugin = {}
      })
    },
    reload(){
      return new Promise((resolve, reject) => {
        if(this.codeValue){
          this.$emit('input', this.codeValue)
          if(this.window.plugin && this.window.plugin.config){
            this.window.plugin.config.code = this.codeValue
          }
          let newTag = this.window.plugin.tag
          const config = this.window.data && this.window.data.config
          if(config && this.window.plugin && this.window.plugin.tag){
            if(!this.window.data.config.tags.includes(this.window.plugin.tag)){
              newTag = this.window.data.config.tags[0]
            }
          }
          this.window.reload({_id: this.window.data._id, tag: newTag, name:this.window.data._name, code: this.codeValue}).then((plugin)=>{
            this.window.plugin = plugin
            this.$forceUpdate()
            resolve()
          }).catch((e)=>{
            reject(e)
          })
        }
      })
    },
    saveAs(){
      this.$emit('input', this.codeValue)
      const filename = this.window&&this.window.plugin&&this.window.plugin.name?this.window.plugin.name+"_"+randId()+'.imjoy.html':'plugin_'+randId()+'.imjoy.html'
      const file = new Blob([this.codeValue], {type: "text/plain;charset=utf-8"})
      saveAs(file, filename);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.editor-with-toolbar {
  overflow: hidden;
  /* height: 100%; */
  /* width: 600px; */
  /* width: 100%; */
  height: calc( 100% - 40px );
}

.editor-without-toolbar {
  overflow: hidden;
  /* height: 100%; */
  /* width: 600px; */
  /* width: 100%; */
  height: calc( 100% );
}

.editor-toolbar{
  padding: 0px;
  min-height: 40px!important;
  height: 40px!important;
}

/*

.plugin-editor {
  display: flex;
  width: 100%;
  height: calc(100% + 5px);
  flex-direction: column;
  overflow: auto;
}
.editor::-webkit-scrollbar {
 display: none;
} */
</style>
