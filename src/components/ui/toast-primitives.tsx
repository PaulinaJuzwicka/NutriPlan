import * as React from 'react';
import * as RadixToast from '@radix-ui/react-toast';

export const ToastProvider = RadixToast.Provider;
export const ToastViewport = RadixToast.Viewport;

export const Toast = React.forwardRef<
  React.ElementRef<typeof RadixToast.Root>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Root>
>(({ className, ...props }, ref) => (
  <RadixToast.Root
    ref={ref}
    className={cn(
      'grid grid-cols-[auto_max-content] items-center gap-x-2 rounded-md p-4 shadow-lg',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
      'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
      'data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
      className
    )}
    {...props}
  />
));
Toast.displayName = 'Toast';

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof RadixToast.Action>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Action>
>(({ className, ...props }, ref) => (
  <RadixToast.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

export const ToastClose = RadixToast.Close;
export const ToastTitle = RadixToast.Title;
export const ToastDescription = RadixToast.Description;
