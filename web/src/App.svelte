<script lang="ts">
  import "normalize.css/normalize.css";
  import "milligram/dist/milligram.min.css";
  import "codemirror/lib/codemirror.css";
  import "./style.css";

  import Field from "./Field.svelte";
  import Editor from "./Editor.svelte";
  import { source } from "./store";

  // shared openwhisk

  // calculate api server location from the url
  let url = new URL(location.href);
  // remove the index.html
  let a = url.pathname.split("/");
  let namespace = a[a.length - 4];
  url.pathname = a.slice(0, -1).join("/");

  // if the location.host is localhost:5000 you are in development mode
  // you need a surgery to contact the locally running openwhisk
  if (location.host == "localhost:5000") {
    url.port = "80";
  }
  // get base and apihost
  let base = url.href;
  url.pathname = "";
  let apihost = url.href.slice(0, -1);
  //console.log(apihost)
  //source.set("Terminator.js")
</script>

{#if $source == ""}
  <Field {base} {namespace} {apihost} />
{:else}
  <Editor {base} />
{/if}
