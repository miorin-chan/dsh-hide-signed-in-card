import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remote-access/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-account/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-deepseek-account/remote'
import { useEffect, useId, useRef, useState } from 'react'

const slot = 'plugins.bundle.config'
const key = '@miorin/dsh-hide-signed-in-card'
const locale = 'settings.account'
const prefix = 'dsh-hsic'
// Default official questionnaire in DSH 0.2.2-rc.5, ui-settings-account/src/contact-config.ts.
// No profile or device metadata is sent by this link.
const feedback = 'https://trtgsjkv6r.feishu.cn/share/base/form/shrcnlCoGElW7MQznGy9r3YYXcg?hide_uid=1&hide_device_info=1&hide_harness_version=1'

type Impact = 'signOutDescription' | 'signOutRunningDescription' | 'signOutUnknownDescription'
type Props = PropsRuntime<typeof slot> & PropsLocale<typeof locale>

function ActionIcon({ kind }: { kind: 'feedback' | 'signOut' }) {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={kind === 'feedback' ? 'm3 11 17-7-6 17-3-8-8-2Zm8 2 9-9' : 'M10 4H5v16h5m4-12 4 4-4 4m-4-4h11'} />
  </svg>
}

export function registerAccountActions(ctx: Context): () => void {
  function AccountActions(props: Props) {
    return props.view === 'page' ? <AccountActionRow {...props} /> : null
  }

  function AccountActionRow({ t, useRemoteAccess }: Props) {
    const canSignOut = useRemoteAccess('account/signOut')
    const canCheck = useRemoteAccess('account/hasRunningAccountTasks')
    const dialog = useRef<HTMLDialogElement>(null)
    const title = useId()
    const description = useId()
    const [checking, setChecking] = useState(false)
    const [impact, setImpact] = useState<Impact>()
    const [busy, setBusy] = useState(false)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
      const element = dialog.current
      if (element === null) return
      element.showModal()
      return () => { if (element.open) element.close() }
    }, [impact, canSignOut])

    const requestSignOut = async () => {
      setChecking(true)
      let next: Impact = 'signOutUnknownDescription'
      try {
        if (canCheck) {
          const result = await ctx.remote.account.hasRunningAccountTasks()
          if (result.ok) next = result.value ? 'signOutRunningDescription' : 'signOutDescription'
        }
      } catch { /* Unavailable impact is shown explicitly in the confirmation. */ }
      finally { setChecking(false) }
      setFailed(false)
      setImpact(next)
    }

    const signOut = async () => {
      if (!canSignOut || busy || impact === undefined || !signedIn()) return
      setBusy(true)
      setFailed(false)
      try {
        const result = await ctx.remote.account.signOut(ctx.accountUi.clientMetadata(ctx.locale.getLocale().active))
        if (result.ok) setImpact(undefined)
        else setFailed(true)
      } catch { setFailed(true) }
      finally { setBusy(false) }
    }

    return <div className={`${prefix}-actions`}>
      <a className={`${prefix}-button`} href={feedback} target="_blank" rel="noopener noreferrer">
        <ActionIcon kind="feedback" />{t('contactUs')}
      </a>
      {canSignOut && <button type="button" className={`${prefix}-button`} disabled={checking} onClick={() => { void requestSignOut() }}>
        <ActionIcon kind="signOut" />{t('signOut')}
      </button>}
      {canSignOut && impact !== undefined && <dialog ref={dialog} className={`${prefix}-dialog`}
        aria-labelledby={title} aria-describedby={description}
        onCancel={event => { event.preventDefault(); if (!busy) setImpact(undefined) }}>
        <h2 id={title}>{t('signOut')}</h2>
        <p id={description}>{t(impact)}</p>
        {failed && <p className={`${prefix}-error`} role="alert">{t('failed')}</p>}
        <div className={`${prefix}-dialog-actions`}>
          <button type="button" className={`${prefix}-button`} disabled={busy} autoFocus
            onClick={() => setImpact(undefined)}>{t('cancel')}</button>
          <button type="button" className={`${prefix}-button ${prefix}-primary`} disabled={busy}
            onClick={() => { void signOut() }}>{t('signOut')}</button>
        </div>
      </dialog>}
    </div>
  }

  function signedIn() {
    return ctx.accountUi.getSnapshot().view?.status === 'credential-stored'
  }

  return ctx.slots.inject(slot, () => {
    let unregister: (() => void) | undefined
    const sync = () => {
      if (signedIn()) unregister ??= ctx.slots.register({ name: slot, key, locale }, AccountActions)
      else { unregister?.(); unregister = undefined }
    }
    const unsub = ctx.on('account-ui/change', sync)
    sync()
    return () => { unsub(); unregister?.() }
  })
}
