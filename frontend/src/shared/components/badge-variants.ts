import { tv, type VariantProps } from 'tailwind-variants';

export const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
  variants: {
    variant: {
      default: 'bg-emerald-100 text-emerald-800',
      secondary: 'bg-teal-100 text-teal-800',
      destructive: 'bg-red-100 text-red-800',
      outline: 'border-2 border-emerald-600 text-emerald-600',
      success: 'bg-emerald-500 text-white',
      warning: 'bg-amber-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-cyan-500 text-white',
      neutral: 'bg-slate-500 text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type BadgeVariants = VariantProps<typeof badgeVariants>;
