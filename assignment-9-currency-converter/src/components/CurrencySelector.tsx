/**
 * CurrencySelector.tsx
 * --------------------
 * Controlled <select> dropdown for picking a currency code.
 * Purely presentational — all state lives in the parent (App).
 */

interface CurrencySelectorProps {
  label:      string;
  value:      string;
  currencies: string[];
  onChange:   (code: string) => void;
  disabled?:  boolean;
}

/** Renders a labelled dropdown of currency codes. */
export function CurrencySelector({
  label,
  value,
  currencies,
  onChange,
  disabled = false,
}: CurrencySelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
      <label style={{ fontSize: '0.8rem', color: '#8888aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: '0.6rem 0.75rem',
          background: '#1e1e2e',
          border: '1.5px solid #3a3a5c',
          borderRadius: '8px',
          color: '#e0e0f0',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
        aria-label={label}
      >
        {currencies.map(code => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
    </div>
  );
}
