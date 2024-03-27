export const isWebContainerSupported = () => {
  const hasSharedArrayBuffer = "SharedArrayBuffer" in window;
  const looksLikeChrome = navigator.userAgent.toLowerCase().includes("chrome");
  const looksLikeFirefox = navigator.userAgent.includes("Firefox");
  const looksLikeSafari = navigator.userAgent.includes("Safari");

  if (hasSharedArrayBuffer && (looksLikeChrome || looksLikeFirefox)) {
    return true;
  }

  if (hasSharedArrayBuffer && looksLikeSafari) {
    const match = navigator.userAgent.match(
      /Version\/(\d+)\.(\d+) (?:Mobile\/.*?)?Safari/
    );
    const majorVersion = match ? Number(match?.[1]) : 0;
    const minorVersion = match ? Number(match?.[2]) : 0;

    return majorVersion > 16 || (majorVersion === 16 && minorVersion >= 4);
  }

  try {
    return Boolean(localStorage.getItem("webcontainer_any_ua"));
  } catch {
    return false;
  }
};
