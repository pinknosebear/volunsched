// Modern design system and theme tokens
export const colors = {
  // Primary palette
  primary: '#0066cc',
  primaryLight: '#e6f0ff',
  primaryDark: '#004499',

  // Secondary palette
  secondary: '#666666',
  secondaryLight: '#f0f0f0',
  secondaryDark: '#333333',

  // Semantic colors
  success: '#16a34a',
  successLight: '#f0fdf4',
  warning: '#ea580c',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0284c7',
  infoLight: '#f0f9ff',

  // Status colors (for shifts/signups)
  statusFull: '#16a34a',
  statusShort: '#f59e0b',
  statusOpen: '#9ca3af',

  // Neutral palette
  background: '#ffffff',
  backgroundAlt: '#f8fafc',
  surface: '#f1f5f9',
  border: '#e2e8f0',
  borderDark: '#cbd5e1',
  text: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',

  // Interactive
  link: '#0066cc',
  linkHover: '#004499',

  // Special
  error: '#dc2626',
  disabled: '#cbd5e1',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const typography = {
  // Font sizes
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',

  // Font families
  fontFamily: {
    base: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    mono: '"Courier New", Courier, monospace',
  },

  // Font weights
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,

  // Line heights
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const borderRadius = {
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// Component-specific styles
export const componentStyles = {
  button: {
    base: {
      fontFamily: typography.fontFamily.base,
      fontWeight: typography.semibold,
      fontSize: typography.base,
      padding: `${spacing.sm} ${spacing.md}`,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: `all ${transitions.fast}`,
      outline: 'none',
      '&:focus-visible': {
        outline: `2px solid ${colors.primary}`,
        outlineOffset: '2px',
      },
    },
    variants: {
      primary: {
        backgroundColor: colors.primary,
        color: 'white',
        '&:hover': {
          backgroundColor: colors.primaryDark,
          boxShadow: shadows.md,
        },
        '&:active': {
          backgroundColor: colors.primaryDark,
          transform: 'translateY(1px)',
        },
        '&:disabled': {
          backgroundColor: colors.disabled,
          color: colors.textTertiary,
          cursor: 'not-allowed',
          boxShadow: 'none',
        },
      },
      secondary: {
        backgroundColor: colors.surface,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        '&:hover': {
          backgroundColor: colors.secondaryLight,
          borderColor: colors.borderDark,
        },
        '&:active': {
          backgroundColor: colors.border,
        },
        '&:disabled': {
          backgroundColor: colors.secondaryLight,
          borderColor: colors.border,
          color: colors.textTertiary,
          cursor: 'not-allowed',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.link,
        '&:hover': {
          backgroundColor: colors.primaryLight,
        },
        '&:active': {
          color: colors.primaryDark,
        },
        '&:disabled': {
          color: colors.disabled,
          cursor: 'not-allowed',
        },
      },
      danger: {
        backgroundColor: colors.danger,
        color: 'white',
        '&:hover': {
          backgroundColor: '#b91c1c',
          boxShadow: shadows.md,
        },
        '&:disabled': {
          backgroundColor: colors.disabled,
          color: colors.textTertiary,
          cursor: 'not-allowed',
        },
      },
    },
  },
  input: {
    base: {
      fontFamily: typography.fontFamily.base,
      fontSize: typography.base,
      padding: `${spacing.sm} ${spacing.md}`,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      color: colors.text,
      transition: `all ${transitions.fast}`,
      '&:focus': {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px ${colors.primaryLight}`,
        outline: 'none',
      },
      '&:disabled': {
        backgroundColor: colors.surface,
        color: colors.textSecondary,
        cursor: 'not-allowed',
      },
      '&::placeholder': {
        color: colors.textTertiary,
      },
    },
  },
  card: {
    base: {
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      padding: spacing.lg,
      transition: `box-shadow ${transitions.fast}`,
    },
    elevated: {
      boxShadow: shadows.md,
    },
    interactive: {
      '&:hover': {
        boxShadow: shadows.md,
        borderColor: colors.borderDark,
      },
    },
  },
};

export const getButtonStyle = (variant = 'primary', disabled = false) => {
  const base = componentStyles.button.base;
  const variantStyle = componentStyles.button.variants[variant] || componentStyles.button.variants.primary;

  return {
    ...base,
    ...variantStyle,
    opacity: disabled ? 0.6 : 1,
  };
};

export const getInputStyle = (error = false) => {
  const base = componentStyles.input.base;
  if (error) {
    return {
      ...base,
      borderColor: colors.danger,
      boxShadow: `0 0 0 3px ${colors.dangerLight}`,
    };
  }
  return base;
};

export const getCardStyle = (variant = 'base', interactive = false) => {
  const base = componentStyles.card.base;
  const variantStyle = componentStyles.card[variant] || {};
  const interactiveStyle = interactive ? componentStyles.card.interactive : {};

  return {
    ...base,
    ...variantStyle,
    ...interactiveStyle,
  };
};
