import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ModernButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
  gradient?: boolean;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    glow = false,
    gradient = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          gradient && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          glow && "shadow-lg hover:shadow-xl",
          "active:scale-95 transform",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        <div className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText || "Loading..."}
            </>
          ) : (
            <>
              {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </>
          )}
        </div>
      </Button>
    );
  }
);
ModernButton.displayName = "ModernButton";

export { ModernButton }; 