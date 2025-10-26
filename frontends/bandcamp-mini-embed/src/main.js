import App from "./App.svelte";
import { mount } from "svelte";

{
  const albumId = document.currentScript.getAttribute("data-album-id");
  const origin = new URL(document.currentScript.src).origin;
  const fallbackText =
    document.currentScript.getAttribute("data-fallback-text");
  const fallbackUrl = document.currentScript.getAttribute("data-fallback-url");
  const target = document.currentScript.previousElementSibling;

  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) {
      return;
    }
    observer.disconnect();
    mount(App, {
      target,
      props: { albumId, origin, fallbackText, fallbackUrl },
    });
  }).observe(target);
}
