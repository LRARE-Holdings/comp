import Image from "next/image";
import { cn } from "@/lib/utils";

type VaraBrandProps = {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  showText?: boolean;
  priority?: boolean;
};

export function VaraBrand({
  className,
  logoClassName,
  textClassName,
  showText = true,
  priority = false,
}: VaraBrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/vara-logo.svg"
        alt="Vara logo"
        width={462}
        height={738}
        priority={priority}
        className={cn("h-10 w-auto shrink-0", logoClassName)}
      />
      {showText && (
        <span className={cn("font-display font-semibold text-xl tracking-[0.09em] text-white", textClassName)}>
          VARA
        </span>
      )}
    </div>
  );
}
