import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Icon3D, { type Icon3DName } from "./Icon3D";

/**
 * Kupon kot vstopnica: modra ploskev z globino, 3D grafika, zareza na robu.
 * `notch` je razred barve podlage pod vstopnico (zareza jo »izreže«).
 */
export default function RewardTicket({ href, name, venue, label = "Čaka te", icon = "darilo", notch = "bg-canvas", className = "" }: { href: string; name: string; venue: string; label?: string; icon?: Icon3DName; notch?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`atmo-brand group relative flex items-center gap-4 overflow-hidden rounded-3xl py-4 pl-4 pr-5 text-on-brand shadow-brand transition-all duration-700 ease-spring hover:-translate-y-1 active:scale-[0.98] ${className}`}
    >
      <span className="flex size-16 shrink-0 items-center justify-center">
        <Icon3D name={icon} size={64} className="-rotate-6 drop-shadow-lg transition-all duration-700 ease-spring group-hover:rotate-0 group-hover:scale-105" />
      </span>
      {/* perforacija z zarezama */}
      <span className="relative h-20 w-0 shrink-0 border-l-2 border-dashed border-white/40" aria-hidden="true">
        <span className={`absolute -left-3 -top-8 size-6 rounded-full ${notch}`} />
        <span className={`absolute -bottom-8 -left-3 size-6 rounded-full ${notch}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
        <span className="line-clamp-2 text-lg font-semibold leading-6 tracking-tight">{name}</span>
        <span className="block truncate text-sm font-medium opacity-85">{venue}</span>
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink transition-all duration-700 ease-spring group-hover:translate-x-1">
        <ArrowRight size={20} weight="bold" aria-hidden="true" />
      </span>
    </Link>
  );
}
