export const styles = `
.dsh-hsic-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  container-type: inline-size;
  color: var(--dsw-alias-label-primary);
}
[data-dsh-aggregate-member] .dsh-hsic-head {
  display: none;
}
.dsh-hsic-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.dsh-hsic-heading {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
.dsh-hsic-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-lg, 16px);
  background: var(--dsw-alias-card-fill);
  overflow: hidden;
}
.dsh-hsic-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px;
}
.dsh-hsic-row + .dsh-hsic-row {
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}
.dsh-hsic-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
}
.dsh-hsic-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.dsh-hsic-title-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
.dsh-hsic-title {
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
.dsh-hsic-status-dot {
  flex: none;
}
.dsh-hsic-desc {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
  overflow-wrap: anywhere;
}
.dsh-hsic-control {
  display: inline-flex;
  flex: none;
  align-items: center;
}
.dsh-hsic-link-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border: 0.5px solid transparent;
  border-radius: var(--dsw-radius-sm, 8px);
  background: transparent;
  box-shadow: inset 0 0 0 var(--dsh-hairline-width, 0.5px) var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}
.dsh-hsic-link-button:active {
  background: var(--dsw-alias-interactive-bg-active);
}
@media (hover: hover) {
  .dsh-hsic-link-button:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}
.dsh-hsic-link-button:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}
.dsh-hsic-danger {
  color: var(--dsw-alias-state-error-primary);
  --dsh-button-outline-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent);
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
}
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
@container (max-width: 440px) {
  .dsh-hsic-row {
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .dsh-hsic-copy {
    flex: 1 1 calc(100% - 44px);
  }
  .dsh-hsic-control {
    width: 100%;
    box-sizing: border-box;
    padding-inline-start: 44px;
  }
}
`
