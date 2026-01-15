import { colors, spacing, borderRadius } from '../../theme';

export default function Alert({
  children,
  variant = 'info',
  onDismiss,
  className,
  style: customStyle,
  ...props
}) {
  const variantStyles = {
    error: {
      backgroundColor: colors.dangerLight,
      borderColor: colors.danger,
      color: '#7f1d1d',
    },
    success: {
      backgroundColor: colors.successLight,
      borderColor: colors.success,
      color: '#15803d',
    },
    warning: {
      backgroundColor: colors.warningLight,
      borderColor: colors.warning,
      color: '#92400e',
    },
    info: {
      backgroundColor: colors.infoLight,
      borderColor: colors.info,
      color: '#0c4a6e',
    },
  };

  const style = {
    ...variantStyles[variant],
    border: `1px solid`,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    ...customStyle,
  };

  return (
    <div style={style} className={className} role="alert" {...props}>
      <div>{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
