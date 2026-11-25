import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remote-access/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import {
  Button,
  IconPaperPlaneOutlineMedium,
  IconRightUpOutlineRegular,
  IconUserOutlineMedium,
  Modal,
  StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-account/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-deepseek-account/remote'
import { useState } from 'react'
import { styles } from './account-action-styles'
import { LABELS, NS } from './labels'

const slot = 'plugins.bundle.config'
const key = '@miorin/dsh-hide-signed-in-card'
const locale = 'settings.account'
const prefix = 'dsh-hsic'
// Default official questionnaire in DSH 0.2.2-rc.5, @deepseek-ai/dsh-client-ui-settings-account/src/contact-config.ts.
// No profile or device metadata is sent by this link.
const DEFAULT_FEEDBACK_URL = 'https://trtgsjkv6r.feishu.cn/share/base/form/shrcnlCoGElW7MQznGy9r3YYXcg?hide_uid=1&hide_device_info=1&hide_harness_version=1'

type Impact = 'signOutDescription' | 'signOutRunningDescription' | 'signOutUnknownDescription'
type Props = PropsRuntime<typeof slot> & PropsLocale<typeof locale>

/**
 * Resolve the feedback questionnaire URL without any prefilled profile or device metadata.
 */
export function resolveFeedbackUrl(): string {
  const configured = (globalThis as { __DSH_CONTACT_CONFIG__?: { contactFormUrl?: unknown } })
    .__DSH_CONTACT_CONFIG__?.contactFormUrl
  if (typeof configured !== 'string') return DEFAULT_FEEDBACK_URL
  try {
    const parsed = new URL(configured)
    if (parsed.protocol !== 'https:') return DEFAULT_FEEDBACK_URL
    for (const param of [...parsed.searchParams.keys()]) {
      if (param.startsWith('prefill_')) parsed.searchParams.delete(param)
    }
    return parsed.href
  } catch {
    return DEFAULT_FEEDBACK_URL
  }
}

// Upstream: @deepseek-ai/dsh-client-ui-settings-account 0.2.2-rc.5,
// src/client/LogoutIcon.tsx (symbol `LogoutIcon`). See LICENSE.deepseek-harness (MIT).
function LogoutIcon() {
  return (
    <span style={{ width: 16, height: 16, position: 'relative' }} aria-hidden="true">
      <svg style={{ position: 'absolute', left: 1.168, top: 1.214 }} width="13.664" height="13.571" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.9961 1.40039C3.37842 1.40039 2.96028 1.40039 2.63867 1.42871C2.32631 1.45627 2.17171 1.50666 2.06641 1.56543C1.85606 1.68288 1.68189 1.85605 1.56446 2.06641C1.50569 2.17173 1.45625 2.32627 1.42871 2.63867C1.40036 2.9603 1.39942 3.37827 1.39942 3.9961L1.39942 9.5752C1.39942 10.193 1.40036 10.611 1.42871 10.9326C1.45625 11.245 1.50569 11.3996 1.56445 11.5049C1.68188 11.7153 1.85605 11.8884 2.06641 12.0059C2.17171 12.0646 2.32631 12.115 2.63867 12.1426C2.96028 12.1709 3.37842 12.1709 3.9961 12.1709V13.5713C3.4033 13.5713 2.91297 13.5721 2.51563 13.5371C2.10906 13.5013 1.73277 13.4233 1.38379 13.2285C0.946838 12.9845 0.585697 12.6235 0.341799 12.1865C0.14725 11.8377 0.0700118 11.4621 0.0341815 11.0557C-0.000847399 10.6583 1.58129e-06 10.1681 1.85029e-06 9.5752L2.09416e-06 3.9961C1.83027e-06 3.40325 -0.000846367 2.91297 0.0341818 2.51563C0.0700164 2.10924 0.147239 1.73362 0.341799 1.38477C0.585703 0.947758 0.946825 0.586744 1.38379 0.342775C1.73277 0.148001 2.10906 0.0700381 2.51563 0.0341813C2.91297 -0.000823893 3.40331 1.37805e-06 3.9961 1.71712e-06L3.9961 1.40039Z" fill="currentColor" />
        <path d="M13.6426 6.51953C13.6705 6.6957 13.6705 6.8756 13.6426 7.05176C13.5902 7.38188 13.4302 7.64112 13.2539 7.86035C13.0857 8.06937 12.8546 8.29971 12.6006 8.55371L9.3086 11.8447L8.31836 10.8545L11.6104 7.56348C11.637 7.53681 11.6628 7.51104 11.6875 7.48633H3.74317V6.08594H11.6885C11.6635 6.06088 11.6374 6.03487 11.6104 6.00781L8.31836 2.7168L9.3086 1.72656L12.6006 5.01758C12.8547 5.27169 13.0857 5.50185 13.2539 5.71094C13.4303 5.93018 13.5902 6.18939 13.6426 6.51953Z" fill="currentColor" />
      </svg>
    </span>
  )
}

export function registerAccountActions(ctx: Context): () => void {
  const disposeLocale = ctx.locale.register(NS, LABELS)
  const tPlugin = ctx.locale.bind(NS)

  function AccountActions(props: Props) {
    return props.view === 'page' ? <AccountActionRow {...props} /> : null
  }

  function AccountActionRow({ t, useRemoteAccess }: Props) {
    const canSignOut = useRemoteAccess('account/signOut')
    const canCheck = useRemoteAccess('account/hasRunningAccountTasks')
    const [checking, setChecking] = useState(false)
    const [impact, setImpact] = useState<Impact>()
    const [busy, setBusy] = useState(false)
    const [failed, setFailed] = useState(false)

    const requestSignOut = async () => {
      if (!canSignOut || checking) return
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

    const dismiss = () => {
      if (!busy) setImpact(undefined)
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

    const feedbackUrl = resolveFeedbackUrl()
    const isWarning = impact !== undefined && impact !== 'signOutDescription'

    return (
      <div className={`${prefix}-panel`} data-dsh-hide-signed-in-card-settings="">
        <style>{styles}</style>
        <div className={`${prefix}-head`}>
          <h4 className={`${prefix}-heading`}>{tPlugin('sectionTitle')}</h4>
        </div>
        <div className={`${prefix}-card`}>
          <div className={`${prefix}-row`}>
            <span className={`${prefix}-icon`} aria-hidden="true">
              <IconUserOutlineMedium size={16} />
            </span>
            <div className={`${prefix}-copy`}>
              <div className={`${prefix}-title-line`}>
                <span className={`${prefix}-title`}>{t('signedIn')}</span>
                <StateDot state="done" className={`${prefix}-status-dot`} />
              </div>
              <p className={`${prefix}-desc`}>
                {tPlugin(canSignOut ? 'signedInHint' : 'signedInReadOnlyHint')}
              </p>
            </div>
            {canSignOut && (
              <div className={`${prefix}-control`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${prefix}-danger`}
                  icon={checking ? <StateDot state="ongoing" size={14} /> : <LogoutIcon />}
                  disabled={checking}
                  aria-busy={checking || undefined}
                  onClick={() => { void requestSignOut() }}
                >
                  {t('signOut')}
                </Button>
              </div>
            )}
          </div>
          <div className={`${prefix}-row`}>
            <span className={`${prefix}-icon`} aria-hidden="true">
              <IconPaperPlaneOutlineMedium size={16} />
            </span>
            <div className={`${prefix}-copy`}>
              <div className={`${prefix}-title-line`}>
                <span className={`${prefix}-title`}>{t('contactUs')}</span>
              </div>
              <p className={`${prefix}-desc`}>{tPlugin('feedbackHint')}</p>
            </div>
            <div className={`${prefix}-control`}>
              <a
                className={`${prefix}-link-button`}
                href={feedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('contactUs')} — ${tPlugin('openFeedback')}`}
              >
                <span>{tPlugin('openFeedback')}</span>
                <IconRightUpOutlineRegular size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        {canSignOut && impact !== undefined && (
          <Modal
            open
            title={t('signOut')}
            closeLabel={t('close')}
            tone={isWarning ? 'warning' : undefined}
            description={t(impact)}
            onClose={dismiss}
            footer={(
              <>
                <Button variant="outline" disabled={busy} data-modal-autofocus="" onClick={dismiss}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="primary"
                  className={isWarning ? `${prefix}-confirm-danger` : undefined}
                  disabled={busy}
                  onClick={() => { void signOut() }}
                >
                  {t('signOut')}
                </Button>
              </>
            )}
          >
            {failed ? <p className={`${prefix}-error`} role="alert">{t('failed')}</p> : undefined}
          </Modal>
        )}
      </div>
    )
  }

  function signedIn() {
    return ctx.accountUi.getSnapshot().view?.status === 'credential-stored'
  }

  const disposeSlot = ctx.slots.inject(slot, () => {
    let unregister: (() => void) | undefined
    const sync = () => {
      if (signedIn()) unregister ??= ctx.slots.register({ name: slot, key, locale }, AccountActions)
      else { unregister?.(); unregister = undefined }
    }
    const unsub = ctx.on('account-ui/change', sync)
    sync()
    return () => { unsub(); unregister?.() }
  })

  return () => {
    disposeSlot()
    disposeLocale()
  }
}
