import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl border transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-white border-neutral-200 shadow-sm hover:shadow-md",
        elevated: "bg-white border-neutral-200 shadow-lg hover:shadow-xl",
        gradient: "bg-gradient-to-br from-white to-neutral-50 border-neutral-200 shadow-md hover:shadow-lg",
        glass: "bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl",
        interactive: "bg-white border-neutral-200 shadow-sm hover:shadow-lg hover:border-primary-300 cursor-pointer transform hover:-translate-y-1",
        glow: "bg-white border-primary-200 shadow-lg shadow-primary-100/50 hover:shadow-xl hover:shadow-primary-200/50",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";
    return (
      <Comp
        className={cn(cardVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { gradient?: boolean }
>(({ className, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-0 pb-4",
      gradient && "bg-gradient-to-r from-primary-50 to-secondary-50 -m-6 mb-4 p-6 rounded-t-xl border-b border-neutral-100",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    size?: 'sm' | 'md' | 'lg' | 'xl';
    gradient?: boolean;
  }
>(({ className, size = 'md', gradient, ...props }, ref) => {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-xl font-semibold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold",
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "leading-none tracking-tight",
        sizeClasses[size],
        gradient && "bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { 
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <p
      ref={ref}
      className={cn(
        "text-neutral-500 leading-relaxed",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    border?: boolean;
    background?: boolean;
  }
>(({ className, border, background, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center pt-4",
      border && "border-t border-neutral-100 mt-4",
      background && "bg-neutral-50 -m-6 mt-4 p-6 rounded-b-xl",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Enhanced Card with built-in animations and states
const AnimatedCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    loading?: boolean;
    error?: boolean;
    success?: boolean;
    onClick?: () => void;
  }
>(({ className, loading, error, success, onClick, children, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getStatusVariant = () => {
    if (loading) return "glass";
    if (error) return "default";
    if (success) return "glow";
    if (onClick) return "interactive";
    return "default";
  };

  return (
    <Card
      ref={ref}
      variant={getStatusVariant()}
      className={cn(
        "relative overflow-hidden",
        loading && "animate-pulse",
        error && "border-error-200 bg-error-50/30",
        success && "border-success-200 bg-success-50/30",
        onClick && "cursor-pointer select-none",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Success indicator */}
      {success && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-success-500 rounded-full animate-pulse" />
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-error-500 rounded-full animate-pulse" />
      )}

      {/* Hover effect */}
      {onClick && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 pointer-events-none" />
      )}

      {children}
    </Card>
  );
});
AnimatedCard.displayName = "AnimatedCard";

// Metric Card for displaying statistics
const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
  }
>(({ className, title, value, change, changeType = 'neutral', icon, trend, ...props }, ref) => {
  const changeColors = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-neutral-500',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <Card ref={ref} variant="elevated" className={cn("relative", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-neutral-900">{value}</p>
              {change && (
                <span className={cn("text-sm font-medium", changeColors[changeType])}>
                  {trend && trendIcons[trend]} {change}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
MetricCard.displayName = "MetricCard";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  AnimatedCard,
  MetricCard
}; 