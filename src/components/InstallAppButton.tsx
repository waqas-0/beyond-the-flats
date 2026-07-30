"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, Plus, X, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Chrome/Edge/Android fire `beforeinstallprompt` with a promptable event.
// It isn't in the TS DOM lib, so type the bits we use.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Real PWA install action. Uses the native prompt where available and falls
 *  back to platform instructions (iOS Safari never fires the event). Renders
 *  nothing once the app is already installed.
 *  `variant="pill"` renders the compact footer chip instead of a full button. */
export function InstallAppButton({
  variant = "button",
}: {
  variant?: "button" | "pill";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [busy, setBusy] = useState(false);

  // Whether we're already running as an installed app is external browser
  // state, so read it through a store rather than syncing it into an effect.
  const subscribe = useCallback((onChange: () => void) => {
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", onChange);
    window.addEventListener("appinstalled", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("appinstalled", onChange);
    };
  }, []);
  const installed = useSyncExternalStore(
    subscribe,
    isStandalone,
    () => false, // server render: assume not installed
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Stop Chrome's own mini-infobar so our button owns the action.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Already running as an installed app — nothing to offer.
  if (installed) return null;

  function openHelp() {
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setShowHelp(true);
  }

  async function install() {
    if (!deferred) {
      // iOS, or the browser hasn't offered a prompt — guide them manually.
      openHelp();
      return;
    }
    setBusy(true);
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setDeferred(null);
    } catch {
      openHelp();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {variant === "pill" ? (
        <button
          onClick={install}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
        >
          <Download size={13} /> {busy ? "Installing…" : "Install App"}
        </button>
      ) : (
        <Button variant="outline" onClick={install} disabled={busy}>
          <Download size={18} /> {busy ? "Installing…" : "Install App"}
        </Button>
      )}

      {showHelp && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-5 pb-6"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-ink">Install the app</h3>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-muted"
              >
                <X size={16} />
              </button>
            </div>

            {isIos ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  On iPhone and iPad, add Beyond The Flats from the Safari share
                  menu:
                </p>
                <ol className="mt-4 space-y-3 text-sm text-ink">
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Share size={16} />
                    </span>
                    Tap the <strong>Share</strong> button in Safari
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Plus size={16} />
                    </span>
                    Choose <strong>Add to Home Screen</strong>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <CircleCheck size={16} />
                    </span>
                    Tap <strong>Add</strong> — done
                  </li>
                </ol>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Your browser hasn&apos;t offered an install prompt yet. You can
                  still add it from the browser menu:
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-ink">
                  <li className="flex gap-2">
                    <span className="text-brand">•</span> Open the browser menu
                    (⋮) and choose <strong>Install app</strong> or{" "}
                    <strong>Add to Home screen</strong>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand">•</span> On desktop Chrome, use
                    the install icon in the address bar
                  </li>
                </ul>
                <p className="mt-4 text-xs text-faint">
                  Note: installing needs a secure (https) connection, so it
                  won&apos;t appear on plain local development.
                </p>
              </>
            )}

            <Button
              variant="primary"
              className="mt-6"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
