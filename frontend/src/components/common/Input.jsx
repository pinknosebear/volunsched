import { colors, spacing, typography, borderRadius, transitions } from '../../theme';

export default function Input({
  label,
  error,
  helpText,
  required = false,
  disabled = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  name,
  ...props
}) {
  const style = {
    display: 'block',
    width: '100%',
    fontFamily: typography.fontFamily.base,
    fontSize: typography.base,
    padding: `${spacing.sm} ${spacing.md}`,
    border: `1px solid ${error ? colors.danger : colors.border}`,
    borderRadius: borderRadius.md,
    backgroundColor: disabled ? colors.surface : colors.background,
    color: colors.text,
    transition: `all ${transitions.fast}`,
    boxSizing: 'border-box',
    '&:focus': {
      borderColor: error ? colors.danger : colors.primary,
      boxShadow: error
        ? `0 0 0 3px ${colors.dangerLight}`
        : `0 0 0 3px ${colors.primaryLight}`,
      outline: 'none',
    },
  };

  const inputStyle = {
    ...style,
    cursor: disabled ? 'not-allowed' : 'auto',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: spacing.xs,
    fontWeight: typography.semibold,
    fontSize: typography.sm,
    color: colors.text,
  };

  const errorStyle = {
    display: 'block',
    marginTop: spacing.xs,
    fontSize: typography.xs,
    color: colors.danger,
  };

  const helpTextStyle = {
    display: 'block',
    marginTop: spacing.xs,
    fontSize: typography.xs,
    color: colors.textSecondary,
  };

  return (
    <div style={{ marginBottom: spacing.md }}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: colors.danger, marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyle}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
      {helpText && !error && <span style={helpTextStyle}>{helpText}</span>}
    </div>
  );
}
