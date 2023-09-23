<script lang="ts">
  import { OpenWhisk } from "./openwhisk";
  import { VERSION } from "./const";
  import { BattleWeb } from "./battleweb";
  import { AssetsLoader } from "./util";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { inspector, source, rewards, ow } from "./store";
  import { log } from "./robot";

  export let base: string;
  export let apihost: string;
  export let namespace: string;

  let battle: BattleWeb;
  let msg = $ow === undefined ? "" : "Choose opponents";
  let status = "Select Opponents";

  let ready = false;
  let debug = false;
  let extra = "";

  let myBot: string;
  let enemyBot: string;

  let fighting = false;
  let editing = false;

  let robotName = "";
  let robotType = "";

  let myBots: string[] = [];

  let enemyBots: { name: string; url: string; rewards: number }[] = [];
  let cyanBots = enemyBots;
  let redBots = enemyBots;
  let searchCyanBot = "";
  let searchRedBot = "";
  let filteredCyanBots = cyanBots;
  let filteredMyBots = myBots;
  let filteredRedBots = redBots;
  let canStartBattle = true;

  let samples = ["JsBot.js", "GoBot.go", "PyBot.py"];
  let sample = samples[0];
  let regex = /^\w{1,60}$/g;

  function check(r) {
    if (r.ok) return r.json();
    else {
      console.log(r);
    }
  }

  let password = "";
  let logging = false;
  function login() {
    logging = false;
    if (password == "") {
      alert("password cannot be empty");
    }
    let url = base + "/login";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password }),
    })
      .then(check)
      .then((r) => {
        console.log(r);
        if ("error" in r) {
          alert(r.error);
        } else {
          if ("token" in r) {
            ow.set(new OpenWhisk(apihost, r["token"], namespace));
            window["ow"] = $ow;
            updateBots();
          }
        }
      })
      .catch((ex) => {
        console.log(ex);
        alert("Unexpected error - check logs");
      });
  }

  async function create(): Promise<boolean> {
    if (!robotName.match(regex)) {
      alert("Invalid Robot Name");
      return false;
    }
    robotType = sample.split(".").pop();
    let src = base + "/samples/" + sample;
    console.log(robotType, src);
    let bot: string;
    return fetch(src)
      .then((data) => {
        if (data.ok) return data.text();
        throw data.statusText;
      })
      .then((code) => {
        bot = robotName + "." + robotType;
        return $ow.save(bot, code, false);
      })
      .then(async (result) => {
        console.log(result);
        if ("error" in result) throw result["error"];
        source.set(bot);
        return true;
      })
      .catch((err) => {
        alert(err);
        return false;
      });
  }

  async function updateBots() {
    console.log(apihost);
    let res = await fetch(
      `${apihost}/api/v1/web/nuvolaris/default/robots`
    ).then((j) => j.json());
    enemyBots = res;
    cyanBots = Object.assign([], enemyBots);
    cyanBots.sort(() => 0.5 - Math.random());
    redBots = Object.assign([], enemyBots);
    redBots.sort(() => 0.5 - Math.random());
    if ($ow !== undefined) {
      myBots = await $ow.list();
    }
    updateSelectList();
  }

  function updateSelectList() {
    filteredCyanBots = cyanBots.filter(
      (item) =>
        item.name.toLowerCase().indexOf(searchCyanBot.toLowerCase()) !== -1
    );
    filteredMyBots = myBots.filter(
      (item) => item.toLowerCase().indexOf(searchCyanBot.toLowerCase()) !== -1
    );
    filteredRedBots = redBots.filter(
      (item) =>
        item.name.toLowerCase().indexOf(searchRedBot.toLowerCase()) !== -1
    );

    if (myBots.length > 0) {
      myBot = filteredMyBots[0];
    } else {
      myBot = filteredCyanBots[0].url;
    }
    enemyBot = filteredRedBots[0].url;
    console.log("updated", myBot, enemyBot);
  }

  let unsubscribeSource = source.subscribe((value) => {
    editing = value != "";
    updateBots();
  });

  function finish(winner: number) {
    msg = "Game over";
    if (winner == -2) {
      image = "ready";
      extra = "";
    } else if (winner == -1) {
      image = "draw";
      extra = "";
    } else if (winner == 0) {
      image = "won";
      extra = "Great!";
    } else {
      image = "lose";
      extra = "";
    }
    status = "Select Opponents";
    ready = false;
    fighting = false;
    battle.stop();
    inspector.set([
      { n: 0, req: "", res: "", state: "" },
      { n: 0, req: "", res: "", state: "" },
    ]);
  }

  function trace() {
    status = "Tracing...";
    fighting = false;
    msg = battle.trace();
  }

  function suspended(msg: string, state0: string, state1: string) {
    status = msg;
    fighting = false;
    inspector.update((info) => {
      info[0].state = state0;
      info[1].state = state1;
      return info;
    });
  }

  function edit() {
    console.log(myBot);
    source.set(myBot);
    battle.stop();
    editing = true;
  }

  let image = $ow === undefined ? "splash" : "ready";
  let Images = new AssetsLoader({
    splash: "img/splash.png",
    ready: "img/ready.png",
    lose: "img/lose.png",
    won: "img/won.png",
    draw: "img/draw.png",
  });

  function splash() {
    //console.log("splash")
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);
    ctx.drawImage(Images.get(image), 0, 0);
  }

  afterUpdate(() => {
    if (!(editing || ready)) splash();
  });

  function selected() {
    console.log("mybot", myBot);
    console.log("enemybot", enemyBot);

    let champ =
      myBots.length == 0
        ? myBot
        : $ow.namespace + "/default/" + myBot.split(".")[0];

    let champExtraLives = 0;

    let enemy = enemyBot;
    let enemyExtraLives = 0;

    let prefix = apihost + "/api/v1/web/";
    let urls = [prefix + champ, prefix + enemy];

    let canvas = document.getElementById("arena") as HTMLCanvasElement;

    let startAngles = [
      [Math.random() * 360, Math.random() * 360],
      [Math.random() * 360, Math.random() * 360],
    ];

    let startLives = [champExtraLives, enemyExtraLives];

    battle.webinit(canvas.getContext("2d"), urls, startAngles, startLives);
    ready = true;
    msg = "May the best micro-services win!";
    status = "Fighting!";
    fighting = true;
    battle.draw();
    battle.start();
  }

  function toggle() {
    fighting = !fighting;
    if (fighting) {
      status = "Fighting!";
      battle.start();
    } else {
      status = "Suspended...";
      battle.stop();
    }
  }

  onMount(() => {
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    battle = new BattleWeb(
      parseInt(canvas.getAttribute("width")),
      parseInt(canvas.getAttribute("height")),
      finish,
      suspended
    );
    updateBots();
    Images.loadAll(() => splash());
  });
  onDestroy(unsubscribeSource);
</script>

<main class="wrapper">
  <section class="container">
    <div class="row">
      {#if msg == ""}
        <img
          style="padding-bottom: 20px"
          alt="banner"
          width="500"
          class="center"
          src="img/banner.png"
        />
      {:else}
        <h1>{msg}</h1>
      {/if}
    </div>
    <div class="row"><canvas id="arena" width="500" height="500" /></div>

    {#if !ready}
      <div class="row">
        <h3>Select the opponents</h3>
      </div>
      <div class="row">
        <div class="column column-left column-offset">
          {#if $ow === undefined}
            <label for="mybot">Cyan Fighter {myBots.length}</label>
            <select bind:value={myBot} id="enemy">
              {#each filteredCyanBots as enemy}
                <option value={enemy.url}>{enemy.name}</option>
              {/each}
            </select>
          {:else}
            <label for="mybot">Your Fighter</label>
            {#if myBots.length == 0}
              <p>No fighters yet. Please create one.</p>
            {:else}
              <select bind:value={myBot} id="enemy">
                {#each filteredMyBots as bot}
                  <option value={bot}
                    >{bot.split(".")[0]}{$rewards > 0
                      ? " (+" + $rewards + ")"
                      : ""}</option
                  >
                {/each}
              </select>
            {/if}
          {/if}
          <label
            >Filter Cyan: <input
              bind:value={searchCyanBot}
              on:input={updateSelectList}
            /></label
          >
        </div>
        <div class="column column-right">
          <label for="enemy">{$ow ? "Enemy" : "Red"} Fighter</label>
          <select bind:value={enemyBot} id="enemy">
            {#each filteredRedBots as enemy}
              <option value={enemy.url}>{enemy.name}</option>
            {/each}
          </select>
          <label
            >Filter Red: <input
              bind:value={searchRedBot}
              on:input={updateSelectList}
            /></label
          >
        </div>
      </div>
      <div class="row">
        <!-- <div class="column column-left column-offset">
          {#if $ow === undefined}
            {#if logging}
              <form on:submit|preventDefault={login}>
                <input
                  id="password"
                  bind:value={password}
                  type="password"
                  placeholder="password then enter"
                />
                <button on:click={login}>Go</button>
              </form>
            {:else}
              <button
                id="login"
                on:click={() => {
                  logging = true;
                }}>Login</button
              >
            {/if}
          {:else}
            <div class="column column-right">
              <button id="edit" on:click={edit} disabled={myBots.length == 0}
                >Edit my Fighter</button
              >
            </div>
          {/if}
        </div> -->
        <div
          class="column column-center column-offset"
          style="text-align: center;"
        >
          <button id="done" disabled={!canStartBattle} on:click={selected}
            >Start the Battle</button
          >
        </div>
      </div>
      {#if $ow === undefined}
        <div class="row">
          <div class="column column-center column-offset">
            <h4>
              Welcome to
              <b>Micro-Bots</b>
              v{VERSION}
              <a target="_blank" href="license.html">(read license)</a>.
            </h4>
          </div>
        </div>
      {:else}
        <div class="row">
          <div class="column column-left column-offset">
            <button id="create" on:click={create}>Create New Fighter</button>
          </div>
          <div class="column column-right">
            <input
              type="text"
              bind:value={robotName}
              placeholder="robot name"
              id="botname"
            />
          </div>
        </div>
        <div class="row">
          <div class="column column-left column-offset" />
          <div class="column column-right">
            <label for="template">Pick a template:</label>
            <select id="template" bind:value={sample}>
              {#each samples as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </div>
        </div>
        <h4>{extra}</h4>
      {/if}
    {:else}
      <div class="row">
        <h3>{status}</h3>
      </div>
      <div class="row">
        <h1>
          <span id="cyan">{battle.robotName(0)}</span> vs
          <span id="red">{battle.robotName(1)}</span>
        </h1>
      </div>
      <div class="row">
        <div class="column column-left column-offset">
          <br />
          <button id="fight" on:click={toggle}>
            {#if fighting}Suspend{:else}Fight!{/if}
          </button>
          <br />
          <button
            on:click={() => {
              ready = false;
              fighting = false;
              battle.terminate();
            }}>Stop</button
          ><br />
          <button id="edit" on:click={edit} disabled={myBots.length == 0}
            >Edit</button
          >
        </div>
        <div class="column column-right">
          <br />
          <label>
            <input type="checkbox" bind:checked={debug} />
            Debug<br />
            <a
              href="https://apigcp.nimbella.io/wb/?command=activation+list"
              target="workbench">Logs</a
            >
          </label><br />
        </div>
      </div>
      {#if debug}
        <div class="row">
          <div class="column column-left column-offset">
            <button id="step" on:click={trace}>Trace</button>
          </div>
          <div class="column column-right">
            Trace:&nbsp;
            <label>
              <input type="checkbox" bind:checked={log.eventOn} />
              Events&nbsp;
            </label>
            <label>
              <input type="checkbox" bind:checked={log.requestOn} />
              Requests&nbsp;
            </label>
            <label>
              <input type="checkbox" bind:checked={log.actionOn} />
              Actions&nbsp;
            </label>
            (open console)
          </div>
        </div>
        <div class="row">
          <div class="column column-50 column-offset">
            <b>[Me] {$inspector[0].state}</b><br />
            Request/<b>Response</b>
            #{$inspector[0].n}
            <pre>{$inspector[0].req}<br /><b>{$inspector[0].res}</b>
              </pre>
            <b>[Emeny] {$inspector[1].state}</b><br />
            Request/<b>Response</b>
            #{$inspector[1].n}
            <pre>{$inspector[1].req}<br /><b>{$inspector[1].res}</b>
              </pre>
          </div>
        </div>
      {/if}
    {/if}
  </section>
</main>

<style>
  #arena {
    border: 1px solid grey;
    float: left;
  }

  #cyan {
    color: rgb(16, 162, 212);
  }
  #red {
    color: rgb(211, 19, 19);
  }
</style>
