// Full-screen helpers. Browsers only allow full screen after a user gesture,
// and iPhone Safari does not allow it for web pages at all.

export function fullscreenSupported() {
  const el = document.documentElement;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function enterFullscreen() {
  const el = document.documentElement;
  try {
    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    const result = request && request.call(el, { navigationUI: 'hide' });
    if (result && result.catch) result.catch(() => {});
  } catch {
    // Not allowed here; the game still works in the browser window.
  }
}

export function exitFullscreen() {
  try {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    const result = exit && exit.call(document);
    if (result && result.catch) result.catch(() => {});
  } catch {
    // Ignore.
  }
}

/** On phones and tablets, go full screen when a game starts. */
export function autoFullscreen() {
  const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (touch && fullscreenSupported() && !isFullscreen()) enterFullscreen();
}
