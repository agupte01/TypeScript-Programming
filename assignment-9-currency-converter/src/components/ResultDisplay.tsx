/**
 * ResultDisplay.tsx
 * -----------------
 * Shows the converted amount, exchange rate, and last-updated timestamp.
 * Handles loading, error, and empty states.
 */

import type { ConversionResult, LoadingState } from '../types/currency.types';

interface ResultDisplayProps {
  result:       ConversionResult | null;
  loadingState: LoadingState;
  error:        string | null;
}

/** Displays the conversion result with appropriate state handling. */
export function ResultDisplay({ result, loadingState, error }: ResultDisplayProps) {
  // Loading state
  if (loadingState === 'loading') {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: '#8888aa' }}>Loading rates…</p>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error' && error) {
    return (
      <div style={{ ...containerStyle, background: 'rgba(248,81,73,0.12)', border: '1px solid rgba(248,81,73,0.3)' }}>
        <p style={{ color: '#ff8080' }}>⚠️ {error}</p>
      </div>
    );
  }

  // Idle state (no result yet)
  if (!result) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#8888aa', fontSize: '0.95rem' }}>
          Enter an amount and select currencies to convert.
        </p>
      </div>
    );
  }

  // Success state — show the result
  return (
    <div style={containerStyle}>
      {/* Converted amount — the primary output */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#8888aa', marginBottom: '0.3rem' }}>
          {result.amount.toLocaleString()} {result.from} =
        </p>
        <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#64d8a0', lineHeight: 1 }}>
          {result.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          <span style={{ fontSize: '1.2rem', marginLeft: '0.4rem', color: '#aaaacc' }}>{result.to}</span>
        </p>
      </div>

      {/* Exchange rate */}
      <p style={{ fontSize: '0.85rem', color: '#8888aa', textAlign: 'center' }}>
        1 {result.from} = {result.rate.toFixed(6)} {result.to}
      </p>

      {/* Last updated */}
      {result.lastUpdated && (
        <p style={{ fontSize: '0.75rem', color: '#555570', textAlign: 'center' }}>
          Rates updated: {result.lastUpdated}
        </p>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  background: '#1a1a2e',
  border: '1px solid #2a2a4e',
  borderRadius: '12px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  minHeight: '120px',
  justifyContent: 'center',
};

const spinnerStyle: React.CSSProperties = {
  width: 32, height: 32,
  border: '3px solid #2a2a4e',
  borderTopColor: '#64d8a0',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
