import { tv, type VariantProps } from 'tailwind-variants';

export const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
  variants: {
    variant: {
      default: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      destructive: 'bg-red-100 text-red-800',
      outline: 'border-2 border-primary-600 text-primary-600',
      success: 'bg-primary-500 text-white',
      warning: 'bg-accent-600 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-secondary-500 text-white',
      neutral: 'bg-secondary-500 text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type BadgeVariants = VariantProps<typeof badgeVariants>;
