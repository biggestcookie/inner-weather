type PwaInstallState = "installed" | "supported" | "partial" | "unsupported";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// The browser fires `beforeinstallprompt` once per load and only while a
// listener is attached, so the listeners stay for the life of the page.
let listening = false;

/**
 * The browser's install offer. Chromium hands us a prompt we can show on
 * request ("supported"); iOS Safari has no prompt, only the share sheet
 * ("partial"); anything already installed or not installable stays quiet.
 */
export function usePwaInstall() {
  const state = useState<PwaInstallState>(
    "pwa-install-state",
    () => "unsupported"
  );
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>(
    "pwa-install-prompt",
    () => null
  );

  if (import.meta.client && !listening) {
    listening = true;

    onMounted(() => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;

      if (standalone) {
        state.value = "installed";
        return;
      }

      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
      const isSafariIOS =
        isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

      if (isSafariIOS) {
        state.value = "partial";
      } else if (deferredPrompt.value) {
        state.value = "supported";
      }

      window.addEventListener("beforeinstallprompt", (event: Event) => {
        event.preventDefault();
        deferredPrompt.value = event as BeforeInstallPromptEvent;
        state.value = "supported";
      });

      window.addEventListener("appinstalled", () => {
        state.value = "installed";
        deferredPrompt.value = null;
      });
    });
  }

  async function install(): Promise<boolean> {
    if (!deferredPrompt.value) return false;

    await deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
    // A declined offer is a no, not something to ask again this load.
    state.value = outcome === "accepted" ? "installed" : "unsupported";

    return outcome === "accepted";
  }

  return { state, install };
}
