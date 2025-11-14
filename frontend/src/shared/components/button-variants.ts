import { tv, type VariantProps } from 'tailwind-variants';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm',
      outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:scale-95',
      secondary: 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95 shadow-sm',
      ghost: 'text-emerald-600 hover:bg-emerald-50 active:scale-95',
      link: 'text-emerald-600 underline-offset-4 hover:underline',
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
