import { colors, spacing, typography, borderRadius } from '../../theme';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  style: customStyle,
  ...props
}) {
  const sizes = {
    sm: {
      fontSize: typography.xs,
      padding: `${spacing.xs} ${spacing.sm}`,
    },
    md: {
      fontSize: typography.sm,
      padding: `${spacing.xs} ${spacing.md}`,
    },
    lg: {
      fontSize: typography.base,
      padding: `${spacing.sm} ${spacing.md}`,
    },
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.surface,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    },
    primary: {
      backgroundColor: colors.primaryLight,
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
    },
    success: {
      backgroundColor: colors.successLight,
      color: colors.success,
      border: `1px solid ${colors.success}`,
    },
    warning: {
      backgroundColor: colors.warningLight,
      color: colors.warning,
      border: `1px solid ${colors.warning}`,
    },
    danger: {
      backgroundColor: colors.dangerLight,
      color: colors.danger,
      border: `1px solid ${colors.danger}`,
    },
    info: {
      backgroundColor: colors.infoLight,
      color: colors.info,
      border: `1px solid ${colors.info}`,
    },
  };

  const style = {
    ...sizes[size],
    ...variantStyles[variant],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    fontWeight: typography.semibold,
    whiteSpace: 'nowrap',
    ...customStyle,
  };

  return (
    <span style={style} className={className} {...props}>
      {children}
    </span>
  );
}
