import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoHeader from "../../../public/logo-header.png";
import logoFull from "../../../public/logo-full.png";

type LogoVariant = "default" | "full" | "text";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  if (variant === "text") {
    return (
      <Link
        href="/"
        className={cn(
          "font-display text-2xl font-semibold tracking-wide text-white transition-colors hover:text-gold",
          className
        )}
      >
        Laser<span className="italic text-gold">ía</span>
      </Link>
    );
  }

  const image = variant === "full" ? logoFull : logoHeader;

  return (
    <Link href="/" className={cn("block", className)}>
      <Image
        src={image}
        alt="Lasería — Centro de depilación láser"
        className="h-full w-auto"
        priority
      />
    </Link>
  );
}
