import { clsx } from "@/lib/clsx";

type AppShellProps = {
  children: React.ReactNode;
  surface?: "bg" | "white";
  homeIndicator?: boolean;
  className?: string;
};

/**
 * Mobile-first PWA shell.
 * On every screen size: a centred phone column (max 430 px) on a neutral backdrop.
 * No decorative side panel — the app is the focus.
 */
export function AppShell({
  children,
  surface = "bg",
  homeIndicator = true,
  className,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-[#e9ecf0]">
      <div
        className={clsx(
          "relative flex w-full max-w-107.5 flex-col shadow-xl shadow-black/10",
          surface === "white" ? "bg-white" : "bg-bg",
          className,
        )}
      >
        <div className="flex flex-1 flex-col pt-4">{children}</div>

        {homeIndicator && (
          <div className="flex justify-center py-2">
            <span className="h-1.5 w-32 rounded-full bg-ink/80" />
          </div>
        )}
      </div>
    </div>
  );
}
