import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = "md", 
  text = "Loading...", 
  className 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 p-6",
      className
    )}>
      <div className="relative">
        <Loader2 
          className={cn(
            "animate-spin text-green-600",
            sizeClasses[size]
          )} 
        />
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-green-200 animate-pulse",
          sizeClasses[size]
        )} />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
