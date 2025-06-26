import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white shadow hover:bg-primary-700 focus-visible:ring-primary-500 active:scale-95",
        destructive: "bg-error-600 text-white shadow hover:bg-error-700 focus-visible:ring-error-500 active:scale-95",
        outline: "border border-primary-300 bg-white text-primary-700 shadow-sm hover:bg-primary-50 hover:border-primary-400 focus-visible:ring-primary-500 active:scale-95",
        secondary: "bg-secondary-600 text-white shadow hover:bg-secondary-700 focus-visible:ring-secondary-500 active:scale-95",
        ghost: "text-primary-700 hover:bg-primary-50 hover:text-primary-800 focus-visible:ring-primary-500",
        link: "text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500",
        gradient: "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-secondary-700 focus-visible:ring-primary-500 active:scale-95",
        glow: "bg-primary-600 text-white shadow-lg shadow-primary-200/50 hover:shadow-xl hover:shadow-primary-300/50 hover:bg-primary-700 focus-visible:ring-primary-500 active:scale-95",
        success: "bg-success-600 text-white shadow hover:bg-success-700 focus-visible:ring-success-500 active:scale-95",
        warning: "bg-warning-600 text-white shadow hover:bg-warning-700 focus-visible:ring-warning-500 active:scale-95",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        wiggle: "hover:animate-wiggle",
        spin: "hover:animate-spin",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          fullWidth && "w-full",
          loading && "cursor-not-allowed"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Shimmer effect for gradient buttons */}
        {variant === "gradient" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        )}
        
        {/* Ripple effect container */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 ease-out rounded-full" />
        </div>

        {/* Content */}
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
      </Comp>
    );
  }
);
Button.displayName = "Button";

// Floating Action Button
const FloatingButton = React.forwardRef<HTMLButtonElement, ButtonProps & {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}>(
  ({ className, position = 'bottom-right', size = 'lg', variant = 'gradient', ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-20 right-6',
      'top-left': 'fixed top-20 left-6',
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "z-50 rounded-full shadow-2xl hover:shadow-2xl hover:scale-110 transition-all duration-300",
          positionClasses[position],
          className
        )}
        {...props}
      />
    );
  }
);
FloatingButton.displayName = "FloatingButton";

// Button Group
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, variant, size, orientation = 'horizontal', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex",
        orientation === 'horizontal' ? "flex-row" : "flex-col",
        className
      )}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Button) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
                     return React.cloneElement(child as React.ReactElement<ButtonProps>, {
             variant: (child.props as ButtonProps).variant || variant,
             size: (child.props as ButtonProps).size || size,
             className: cn(
               (child.props as ButtonProps).className,
               orientation === 'horizontal' ? [
                 !isFirst && "ml-[-1px]",
                 isFirst && "rounded-r-none",
                 isLast && "rounded-l-none",
                 !isFirst && !isLast && "rounded-none",
               ] : [
                 !isFirst && "mt-[-1px]",
                 isFirst && "rounded-b-none",
                 isLast && "rounded-t-none",
                 !isFirst && !isLast && "rounded-none",
               ]
             ),
           });
        }
        return child;
      })}
    </div>
  );
});
ButtonGroup.displayName = "ButtonGroup";

// Icon Button
const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps & {
  icon: React.ReactNode;
  label: string;
}>(({ icon, label, size = 'icon', className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      size={size}
      className={cn("rounded-full", className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </Button>
  );
});
IconButton.displayName = "IconButton";

export { Button, buttonVariants, FloatingButton, ButtonGroup, IconButton }; 