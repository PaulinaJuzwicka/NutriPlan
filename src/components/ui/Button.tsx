import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: any;
  rightIcon?: any;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children?: any;
  onClick?: () => void;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 py-2 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm',
    ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
  };

  return (
    <button
      type={type as "button" | "submit" | "reset" | undefined}
      className={`${baseStyles} ${sizeStyles[size as keyof typeof sizeStyles]} ${variantStyles[variant as keyof typeof variantStyles]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        leftIcon && <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}

Button.displayName = 'Button';

export default Button;
