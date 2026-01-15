import { colors, spacing, borderRadius, shadows } from '../../theme';

export default function Card({
  children,
  variant = 'default',
  elevated = false,
  interactive = false,
  padding = 'lg',
  className,
  style: customStyle,
  ...props
}) {
  const paddingValues = {
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.lg,
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
    },
    surface: {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
    },
    accent: {
      backgroundColor: colors.primaryLight,
      border: `1px solid ${colors.primary}`,
    },
  };

  const style = {
    ...variantStyles[variant],
    borderRadius: borderRadius.lg,
    padding: paddingValues[padding] || padding,
    boxShadow: elevated ? shadows.md : shadows.sm,
    transition: 'all 200ms ease-in-out',
    ...(interactive && {
      cursor: 'pointer',
      '&:hover': {
        boxShadow: shadows.lg,
        transform: 'translateY(-2px)',
      },
    }),
    ...customStyle,
  };

  return (
    <div style={style} className={className} {...props}>
      {children}
    </div>
  );
}
