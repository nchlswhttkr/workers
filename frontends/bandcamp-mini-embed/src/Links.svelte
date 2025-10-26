<script>
  import bandcampLogoColor from "./icons/bandcamp-logotype-color.png";
  import bandcampLogoWhite from "./icons/bandcamp-logotype-white.png";

  let { albumUrl } = $props();
</script>

<div class="links">
  <a href={`${albumUrl}&action=buy`}>buy</a>
  &nbsp;
  <a href={`${albumUrl}&action=share`}>share</a>
  <a class="logo" href={albumUrl}>
    <picture>
      <source srcset={bandcampLogoWhite} media="(prefers-color-scheme: dark)" />
      <img src={bandcampLogoColor} alt="Bandcamp logo" />
    </picture>
  </a>
</div>

<style>
  .links {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .links > *:first-child {
    margin-right: 8px; /* fix space between buy/share links */
  }

  .links > .logo {
    line-height: 0;
  }

  .links > .logo > picture > img {
    height: 32px;
    width: 110px;
  }
</style>
