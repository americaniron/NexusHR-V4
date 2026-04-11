import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  src?: string | null;
  name?: string;
  roleTitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-5 w-5",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-xl",
  xl: "text-2xl",
};

const labelTextSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const roleLabelSizes = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

export function AIAvatar({ src, name, roleTitle, size = "md", showLabel = false, className }: AIAvatarProps) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const avatar = (
    <Avatar className={cn(sizeClasses[size], "border-2 border-primary/20 shadow-md", !showLabel && className)}>
      {src && <AvatarImage src={src} alt={name || "AI Avatar"} />}
      <AvatarFallback className={cn("bg-primary/10 text-primary", textSizes[size])}>
        {initials || <Zap className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  );

  if (!showLabel || (!name && !roleTitle)) {
    return avatar;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {avatar}
      <div className="flex flex-col min-w-0">
        {name && (
          <span className={cn("font-medium text-foreground truncate", labelTextSizes[size])}>
            {name}
          </span>
        )}
        {roleTitle && (
          <span className={cn("text-muted-foreground truncate", roleLabelSizes[size])}>
            {roleTitle}
          </span>
        )}
      </div>
    </div>
  );
}
