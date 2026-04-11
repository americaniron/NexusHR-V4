import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
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

export function AIAvatar({ src, name, size = "md", className }: AIAvatarProps) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <Avatar className={cn(sizeClasses[size], "border-2 border-primary/20 shadow-md", className)}>
      {src && <AvatarImage src={src} alt={name || "AI Avatar"} />}
      <AvatarFallback className={cn("bg-primary/10 text-primary", textSizes[size])}>
        {initials || <Zap className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  );
}
