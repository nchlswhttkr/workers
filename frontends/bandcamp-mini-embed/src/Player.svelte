<script>
  import playIcon from "./icons/play.svg";
  import pauseIcon from "./icons/pause.svg";
  import previousIcon from "./icons/previous.svg";
  import nextIcon from "./icons/next.svg";

  let {
    artwork,
    album,
    albumUrl,
    tracks,
    currentTrack,
    paused,
    play,
    pause,
    seek,
    currentTime,
    previousTrack,
    nextTrack,
  } = $props();

  function toggle() {
    if (paused) {
      play(currentTrack);
    } else {
      pause();
    }
  }

  let seekingTime = $state();
  function handleSeeking(event) {
    switch (event.type) {
      case "change":
        seek(event.target.value);
        seekingTime = undefined;
        break;
      case "input":
        seekingTime = event.target.value;
        break;
      default:
        break;
    }
  }
</script>

<div class="player">
  <div class="artwork">
    <!-- Duplicates the play button's functionality, just useful for mobile -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <img onclick={toggle} src={artwork} alt="Cover artwork for {album}" />
  </div>
  <div class="info">
    <p>
      <a href={albumUrl}>
        {@html tracks[currentTrack].title}
      </a>
    </p>
    <p>
      {@html tracks[currentTrack].artist}
    </p>
    <p>{@html album}</p>
    <div class="controls">
      <button
        aria-label={paused ? "Play current song" : "Pause current song"}
        onclick={paused ? () => play(currentTrack) : pause}
      >
        {@html paused ? playIcon : pauseIcon}
      </button>
      <input
        aria-label="Seek"
        type="range"
        min="0"
        max={Math.floor(tracks[currentTrack].duration)}
        value={(seekingTime === undefined ? currentTime : seekingTime) || 0}
        onchange={handleSeeking}
        oninput={handleSeeking}
      />
      <button
        aria-label="Play previous song"
        onclick={() => play(previousTrack)}
        disabled={previousTrack === undefined}
      >
        {@html previousIcon}
      </button>
      <button
        aria-label="Play next song"
        onclick={() => play(nextTrack)}
        disabled={nextTrack === undefined}
      >
        {@html nextIcon}
      </button>
    </div>
  </div>
</div>

<style>
  button {
    cursor: pointer;
    opacity: 0.8;
    color: inherit;
    border: none;
    background-color: unset;
    padding: 4px;
    line-height: 0;
  }
  button:hover {
    opacity: 1;
  }
  button:disabled {
    cursor: auto;
    opacity: 0.5;
  }

  .player {
    display: flex;
    height: 120px;
  }

  .info {
    flex: 1 1 0;
    min-width: 198px;
    padding: 12px 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }
  .info p {
    margin: 0 8px 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info > p:last-of-type {
    font-style: italic;
  }

  .controls {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding-right: 4px; /* line up with links below */
  }
  .controls > *:first-child {
    padding-left: 8px; /* keep space between play button/artwork interactive */
  }
  .controls > input {
    cursor: grab;
    flex-grow: 1;
    width: 0; /* force smaller width on Firefox */
  }
  .controls > input:active {
    cursor: grabbing;
  }

  .artwork {
    cursor: pointer;
    height: 120px;
    width: 120px;
    min-width: 80px;
    display: flex;
    justify-content: center;
    overflow: hidden;
  }
</style>
