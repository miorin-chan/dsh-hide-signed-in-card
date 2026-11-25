export const styles = `
.dsh-hsic-actions, .dsh-hsic-dialog-actions {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
}
.dsh-hsic-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 32px; padding: 4px 10px; box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
  color: var(--dsw-alias-label-primary); background: transparent;
  font: inherit; font-size: 13px; text-decoration: none; cursor: pointer;
}
.dsh-hsic-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
.dsh-hsic-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.dsh-hsic-button:disabled { opacity: .6; cursor: default; }
.dsh-hsic-dialog {
  width: min(420px, calc(100vw - 32px)); box-sizing: border-box; padding: 20px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
}
.dsh-hsic-dialog::backdrop { background: var(--dsw-alias-bg-overlay); }
.dsh-hsic-dialog h2 { margin: 0; font: inherit; font-size: 16px; font-weight: 600; }
.dsh-hsic-dialog p { margin: 8px 0 16px; color: var(--dsw-alias-label-secondary); }
.dsh-hsic-dialog p.dsh-hsic-error { color: var(--dsw-alias-state-error-primary); }
.dsh-hsic-dialog-actions { justify-content: flex-end; }
.dsh-hsic-button.dsh-hsic-primary {
  background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); border-color: transparent;
}
.dsh-hsic-button.dsh-hsic-primary:hover:not(:disabled) { filter: brightness(.9); }
`
