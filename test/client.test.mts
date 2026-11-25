import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as React from 'react'
import * as runtime from 'react/jsx-runtime'
import { act, create } from 'react-test-renderer'

let registration
const fakeWindow = { __ModuleLoader__: { load(entry) { registration = entry } } }
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true })
try {
  await import('../client.js')
} finally {
  Reflect.deleteProperty(globalThis, 'window')
}

const id = 'dsh-hide-signed-in-card'
const pkg = `@miorin/${id}`
const slot = 'plugins.bundle.config'
assert.equal(registration.id, pkg)

const fakePrimitives = {
  Button({ variant, size, icon, className, children, ...rest }) {
    return React.createElement(
      'button',
      { type: 'button', 'data-variant': variant, 'data-size': size, className, ...rest },
      icon ?? null,
      children,
    )
  },
  Modal({ open, onClose, title, closeLabel, tone, description, children, footer }) {
    if (!open) return null
    return React.createElement(
      'div',
      { role: 'dialog', 'aria-modal': 'true', 'aria-label': title, 'data-tone': tone ?? '', 'data-close-label': closeLabel, onClose },
      React.createElement('h2', null, title),
      description ? React.createElement('p', { 'data-modal-description': '' }, description) : null,
      children ?? null,
      footer ? React.createElement('div', { 'data-modal-footer': '' }, footer) : null,
    )
  },
  StateDot({ state, size, className }) {
    return React.createElement('span', { 'data-state-dot': state, 'data-size': size ?? '', className, 'aria-hidden': 'true' })
  },
  IconUserOutlineMedium({ size, ...rest }) {
    return React.createElement('svg', { 'data-icon': 'user', width: size ?? 16, height: size ?? 16, 'aria-hidden': 'true', ...rest })
  },
  IconPaperPlaneOutlineMedium({ size, ...rest }) {
    return React.createElement('svg', { 'data-icon': 'paper-plane', width: size ?? 16, height: size ?? 16, 'aria-hidden': 'true', ...rest })
  },
  IconRightUpOutlineRegular({ size, ...rest }) {
    return React.createElement('svg', { 'data-icon': 'right-up', width: size ?? 16, height: size ?? 16, 'aria-hidden': 'true', ...rest })
  },
}

const plugin = registration.factory(name => {
  if (name === 'react') return React
  if (name === 'react/jsx-runtime') return runtime
  if (name === '@deepseek-ai/dsh-client-ui-primitives') return fakePrimitives
  throw new Error(`Unexpected module request: ${name}`)
})

function activate(options = {}) {
  const entries = new Map()
  const effects = []
  const listeners = new Set()
  const registeredLocales = new Map()
  let status = options.status
  let activeLocale = options.activeLocale ?? 'zh'
  const calls = []
  plugin.apply({
    effect(install) { effects.push(install()) },
    on(event, listener) {
      assert.equal(event, 'account-ui/change')
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    accountUi: {
      getSnapshot() { return { view: status === undefined ? undefined : { status } } },
      clientMetadata(locale) { return { locale } },
    },
    locale: {
      getLocale: () => ({ active: activeLocale }),
      register(ns, dicts) {
        assert.equal(ns, id)
        assert.deepEqual(Object.keys(dicts).sort(), ['de', 'en', 'es', 'fr', 'ja', 'pt', 'ru', 'zh'])
        registeredLocales.set(ns, dicts)
        return () => { registeredLocales.delete(ns) }
      },
      bind(ns) {
        assert.equal(ns, id)
        return key => registeredLocales.get(ns)?.[activeLocale]?.[key] ?? registeredLocales.get(ns)?.en?.[key] ?? key
      },
    },
    remote: { account: {
      async hasRunningAccountTasks() {
        calls.push('check')
        if (options.checkFails) throw new Error('disconnected')
        return { ok: true, value: options.running ?? false }
      },
      async signOut(metadata) {
        calls.push(['signOut', metadata])
        return { ok: !options.failFirst || calls.filter(Array.isArray).length > 1 }
      },
    } },
    slots: {
      inject(owner, mount) {
        assert.ok(['shell.overlay', slot].includes(owner))
        return mount()
      },
      register({ name, id: entryId, key, locale }, component) {
        assert.equal(name, key === pkg ? slot : 'shell.overlay')
        if (name === slot) assert.equal(locale, 'settings.account')
        entries.set(entryId ?? key, component)
        return () => { entries.delete(entryId ?? key) }
      },
    },
  })
  return {
    entries,
    calls,
    registeredLocales,
    setLocale(next) { activeLocale = next },
    setStatus(next) { status = next; for (const listener of listeners) listener() },
    dispose() {
      for (const dispose of effects.reverse()) dispose()
      assert.equal(listeners.size, 0)
      assert.equal(registeredLocales.size, 0)
    },
  }
}

function render(Component, view = 'page', can = () => true) {
  let tree
  act(() => {
    tree = create(React.createElement(Component, { view, t: key => key, useRemoteAccess: can }))
  })
  return tree
}

const click = async button => { await act(async () => { button.props.onClick() }) }

test('settings actions and plugin locales register only while signed in, and unload removes all contributions', () => {
  const app = activate()
  assert.equal(app.registeredLocales.has(id), true)
  assert.deepEqual([...app.entries.keys()], [id])
  app.setStatus('credential-stored')
  assert.deepEqual([...app.entries.keys()], [id, pkg])
  app.setStatus('signed-out')
  assert.deepEqual([...app.entries.keys()], [id])
  app.setStatus('credential-stored')
  app.dispose()
  assert.equal(app.entries.size, 0)
})

test('shell.overlay CSS contains only the signed-in launcher hiding rule', () => {
  const app = activate()
  const style = app.entries.get(id)()
  assert.equal(style.type, 'style')
  const normalized = style.props.children.trim().replace(/\s+/g, ' ')
  assert.equal(
    normalized,
    '[data-slot="sidebar.settings"] [data-slot="settings.launcher"] > div[data-inset]:has(button[data-signed-out="false"][data-collapsed][aria-haspopup="menu"]) { display: none; }',
  )
  assert.equal(normalized.includes('dsh-hsic'), false)
  app.dispose()
})

test('settings page renders component-scoped card, native primitives, safe feedback link, and omits sign-out when refused', () => {
  const originalConfig = globalThis.__DSH_CONTACT_CONFIG__
  try {
    globalThis.__DSH_CONTACT_CONFIG__ = {
      contactFormUrl: 'https://example.com/form?prefill_uid=123&prefill_device_info=mac&hide_uid=1',
    }
    const app = activate({ status: 'credential-stored', activeLocale: 'zh' })
    const Component = app.entries.get(pkg)
    const summary = render(Component, 'summary')
    assert.equal(summary.toJSON(), null)

    const denied = render(Component, 'page', endpoint => endpoint !== 'account/signOut')
    assert.equal(denied.root.findAllByType('button').length, 0)
    assert.equal(denied.root.findAllByProps({ className: 'dsh-hsic-desc' })[0].props.children, '已登录时自动隐藏侧栏账号卡片。')

    const page = render(Component)
    const styleEl = page.root.findByType('style')
    const cssText = styleEl.props.children
    assert.equal(cssText.includes('--dsw-alias-bg-overlay'), false)
    assert.equal(cssText.includes('.dsh-hsic-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }'), false)
    assert.match(cssText, /@media \(hover: hover\)/)
    assert.match(cssText, /--dsw-focus-ring-color/)
    assert.match(cssText, /@container \(max-width: 440px\)/)

    const dot = page.root.findByProps({ 'data-state-dot': 'done' })
    assert.equal(dot.props['aria-hidden'], 'true')

    const link = page.root.findByType('a')
    assert.equal(link.props.href, 'https://example.com/form?hide_uid=1')
    assert.equal(link.props.target, '_blank')
    assert.equal(link.props.rel, 'noopener noreferrer')
    assert.equal(link.findByProps({ 'data-icon': 'right-up' }).props['aria-hidden'], 'true')

    const button = page.root.findByType('button')
    assert.equal(button.props['data-variant'], 'outline')
    assert.equal(button.props['data-size'], 'sm')
    assert.equal(button.props.className, 'dsh-hsic-danger')
    assert.equal(button.props.children.at(-1), 'signOut')

    // Non-HTTPS override falls back to the default Feishu questionnaire.
    globalThis.__DSH_CONTACT_CONFIG__ = { contactFormUrl: 'http://insecure.example.com/form' }
    const fallbackPage = render(Component)
    assert.equal(new URL(fallbackPage.root.findByType('a').props.href).hostname, 'trtgsjkv6r.feishu.cn')

    act(() => { summary.unmount(); denied.unmount(); page.unmount(); fallbackPage.unmount() })
    app.dispose()
  } finally {
    if (originalConfig === undefined) delete globalThis.__DSH_CONTACT_CONFIG__
    else globalThis.__DSH_CONTACT_CONFIG__ = originalConfig
  }
})

test('sign-out checks task impact, opens native Modal with warning tone when active, lets user cancel, and keeps failures retryable', async () => {
  const app = activate({ status: 'credential-stored', running: true, failFirst: true })
  const page = render(app.entries.get(pkg))
  const buttons = () => page.root.findAllByType('button')

  await click(buttons()[0])
  assert.deepEqual(app.calls, ['check'])
  const modal = () => page.root.findByProps({ role: 'dialog' })
  assert.equal(modal().props['data-tone'], 'warning')
  assert.equal(page.root.findByProps({ 'data-modal-description': '' }).props.children, 'signOutRunningDescription')

  await click(buttons()[1])
  assert.equal(page.root.findAllByProps({ role: 'dialog' }).length, 0)
  assert.deepEqual(app.calls, ['check'])

  await click(buttons()[0])
  await click(buttons()[2])
  assert.equal(page.root.findByProps({ role: 'alert' }).props.children, 'failed')
  await click(buttons()[2])
  assert.equal(page.root.findAllByProps({ role: 'dialog' }).length, 0)
  assert.deepEqual(app.calls, ['check', 'check', ['signOut', { locale: 'zh' }], ['signOut', { locale: 'zh' }]])

  act(() => page.unmount())
  app.dispose()
})

test('idle sign-out omits warning tone and unavailable task check shows warning confirmation', async () => {
  const idleApp = activate({ status: 'credential-stored', running: false })
  const idlePage = render(idleApp.entries.get(pkg))
  await click(idlePage.root.findByType('button'))
  assert.equal(idlePage.root.findByProps({ role: 'dialog' }).props['data-tone'], '')
  assert.equal(idlePage.root.findByProps({ 'data-modal-description': '' }).props.children, 'signOutDescription')
  act(() => idlePage.unmount())
  idleApp.dispose()

  const unknownApp = activate({ status: 'credential-stored', checkFails: true })
  const unknownPage = render(unknownApp.entries.get(pkg))
  await click(unknownPage.root.findByType('button'))
  assert.equal(unknownPage.root.findByProps({ role: 'dialog' }).props['data-tone'], 'warning')
  assert.equal(unknownPage.root.findByProps({ 'data-modal-description': '' }).props.children, 'signOutUnknownDescription')
  assert.deepEqual(unknownApp.calls, ['check'])
  act(() => unknownPage.unmount())
  unknownApp.dispose()
})
