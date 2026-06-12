import Link from "next/link";
import { clsx } from "@/lib/clsx";

type Variant =
  | "primary"
  | "brand"
  | "danger"
  | "secondary"
  | "outline"
  | "whatsapp";

const base =
  "inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full px-5 text-[15px] font-semibold transition-colors disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy/90",
  brand: "bg-brand text-white hover:bg-brand/90",
  danger: "bg-danger text-white hover:bg-danger/90",
  secondary: "border border-line bg-card text-ink hover:bg-line/60",
  outline: "border border-brand bg-white text-brand hover:bg-brand-soft",
  whatsapp: "bg-[#1f7a52] text-white hover:brightness-95",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

type AsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string };

export function Button(props: AsButton | AsLink) {
  if ("href" in props && props.href) {
    const { variant = "primary", className, children, href } = props;
    return (
      <Link href={href} className={clsx(base, variants[variant], className)}>
        {children}
      </Link>
    );
  }

  const { variant = "primary", className, children, ...rest } = props;
  return (
    <button className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
