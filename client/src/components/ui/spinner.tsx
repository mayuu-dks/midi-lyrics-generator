import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function Spinner({ 
  className, 
  size = "md", 
  fullPage = false,
  ...props 
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinnerContent = (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="loading"
      {...props}
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
