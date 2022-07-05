<script lang="ts">
  import { ow } from "./store";
  import { source } from "./store";

  import CodeMirror from "codemirror";
  import "codemirror/mode/javascript/javascript";
  import "codemirror/mode/go/go";
  import "codemirror/mode/python/python";

  import { onMount } from "svelte";

  export let base: string;
 
  let modeMap = {
    js: "javascript",
    go: "go",
    py: "python",
  };

  let editor = undefined;
  onMount(() => {
    editor = CodeMirror(document.getElementById("editor"), {
      lineNumbers: true,
    });
    $ow.load($source).then((code) => {
      let mode = modeMap[$source.split(".").pop()];
      if (mode) editor.setOption("mode", mode);
      if (code) editor.setValue(code);
    });
    window.scrollTo(0, 0);
  });

  function cancel() {
    if (confirm("Are you sure you want to lose your changes?")) {
      editor.setValue("");
      source.set("");
    }
  }

  async function del() {
    let name = $source;
    name = name.split(".")[0];
    let namespace = $ow.namespace;
    let botname = namespace.split("-")[0] + "/" + name;
    if (confirm("Are you sure you want to delete this Robot?")) {
      $ow.del($source).then(() => {
        editor.setValue("");
        source.set("");
      });
    }
  }

  async function save() {
    let name = $source;
    name = name.split(".")[0];
    let namespace = $ow.namespace;
    namespace = namespace.split("-")[0];

    let code = await editor.getValue();
    //console.log(code);
    $ow.save($source, code, true).then(() => {
      source.set("");
    });
  }

  function help() {

    window.open(base+"/help.html")

  }
</script>

<main class="wrapper">
  <div id="editor" name="editor" style="width: 100%; height: 90%;" />
  <section class="container" style="height: 100%;">
    <div class="clearfix">
      <!-- Float either directions -->
      <div class="float-left">
        <button id="done" on:click={save}>Save</button>
        &nbsp;
        <button id="done" on:click={cancel}>Cancel</button>
        &nbsp;
        <button id="done" on:click={del}>Delete</button>
        &nbsp;
        <button id="help" on:click={help}>Help</button>
      </div>
      <div class="float-right">
        <h3>
          <tt>{$source}</tt>
        </h3>
      </div>
    </div>
  </section>
</main>
>
