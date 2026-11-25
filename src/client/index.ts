import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { createElement } from 'react'
import { registerAccountActions } from './account-actions'
import { styles } from './account-action-styles'

const SLOT = 'shell.overlay'
const ID = 'dsh-hide-signed-in-card'

// DSH 0.2.2-rc.5, @deepseek-ai/dsh-client-ui-settings-account/src/client/AccountMenu.tsx
// (AccountMenu): data-inset identifies the root in both rail and wide modes, while
// data-signed-out reflects credential-stored. Match positively so an unknown
// layout or state leaves the launcher visible. Do not hide the settings footer,
// which also owns the connection and update indicators.
const css = `
[data-slot="sidebar.settings"] [data-slot="settings.launcher"] > div[data-inset]:has(button[data-signed-out="false"][data-collapsed][aria-haspopup="menu"]) {
  display: none;
}
`

function AccountCardStyle() {
  return createElement('style', { 'data-dsh-hide-signed-in-card': '' }, css + styles)
}

export const inject = ['slots', 'locale', 'remote', 'remote.account', 'accountUi']

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.slots.inject(SLOT, () => ctx.slots.register({ name: SLOT, id: ID }, AccountCardStyle)))
  ctx.effect(() => registerAccountActions(ctx))
}
