// Portaled Modal styles live outside [data-knobs-scope] when the dialog renders.
export const styles = `
.dsh-hsic-confirm-danger {
  --dsw-alias-button-primary-fill: var(--dsw-alias-state-error-primary);
  --dsw-alias-button-primary-hover: color-mix(in srgb, var(--dsw-alias-state-error-primary) 88%, var(--dsw-alias-label-primary));
}
.dsh-hsic-error {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-state-error-primary);
}
`
