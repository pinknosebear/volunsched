import { colors, spacing, typography, borderRadius, transitions, shadows } from '../../theme';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className,
  ...props
}) {
  const sizes = {
    sm: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.sm,
      height: '32px',
    },
    md: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.base,
      height: '40px',
    },
    lg: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.lg,
      height: '48px',
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: disabled ? colors.disabled : colors.primary,
      color: disabled ? colors.textTertiary : 'white',
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.surface,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.link,
      border: 'none',
    },
    danger: {
      backgroundColor: disabled ? colors.disabled : colors.danger,
      color: disabled ? colors.textTertiary : 'white',
      border: 'none',
    },
  };

  const style = {
    ...sizes[size],
    ...variantStyles[variant],
    width: fullWidth ? '100%' : 'auto',
    fontWeight: typography.semibold,
    fontFamily: typography.fontFamily.base,
    borderRadius: borderRadius.lg,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.fast}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    boxShadow: 'none',
    '&:hover': !disabled && {
      boxShadow: shadows.md,
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
