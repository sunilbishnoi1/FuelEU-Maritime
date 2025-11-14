import { tv, type VariantProps } from 'tailwind-variants';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-sm',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 shadow-sm',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:scale-95',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:scale-95 shadow-sm',
      ghost: 'text-primary-600 hover:bg-primary-50 active:scale-95',
      link: 'text-primary-600 underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
