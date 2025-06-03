import { cn } from '../../lib/utils';

interface CheckboxProps {
  className?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  label?: string;
  [key: string]: any;
}

export function Checkbox({ 
  className, 
  checked, 
  onChange, 
  disabled, 
  id, 
  name, 
  required,
  label,
  ...props 
}: CheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={cn(
          'h-4 w-4 rounded border-primary text-primary focus:ring-primary',
          className
        )}
        {...props}
      />
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Checkbox;
