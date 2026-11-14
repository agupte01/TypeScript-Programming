/**
 * AmountInput.tsx
 * ---------------
 * Controlled numeric input for the conversion amount.
 * Handles the empty-string → 0 edge case so the parent always receives a number.
 */

interface AmountInputProps {
  value:     number;
  onChange:  (amount: number) => void;
  disabled?: boolean;
}

/** Renders a labelled number input for entering the conversion amount. */
export function AmountInput({ value, onChange, disabled = false }: AmountInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label
        htmlFor="amount-input"
        style={{ fontSize: '0.8rem', color: '#8888aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Amount
      </label>
      <input
        id="amount-input"
        type="number"
        min={0}
        step={0.01}
        value={value === 0 ? '' : value}
        onChange={e => {
          // Parse the string value; fall back to 0 for empty input
          const parsed = parseFloat(e.target.value);
          onChange(isNaN(parsed) ? 0 : parsed);
        }}
        disabled={disabled}
        placeholder="0.00"
        style={{
          padding: '0.6rem 0.75rem',
          background: '#1e1e2e',
          border: '1.5px solid #3a3a5c',
          borderRadius: '8px',
          color: '#e0e0f0',
          fontSize: '1.1rem',
          fontWeight: 600,
          outline: 'none',
          width: '100%',
        }}
        aria-label="Amount to convert"
      />
    </div>
  );
}
