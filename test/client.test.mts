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
const plugin = registration.factory(name => {
  assert.ok(['react', 'react/jsx-runtime'].includes(name), name)
  return name === 'react' ? React : runtime
})

function activate(options = {}) {
  const entries = new Map()
  const effects = []
  const listeners = new Set()
  let status = options.status
  let calls = []
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
    locale: { getLocale: () => ({ active: 'zh' }) },
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
      register({ name, id, key, locale }, component) {
        assert.equal(name, key === pkg ? slot : 'shell.overlay')
        if (name === slot) assert.equal(locale, 'settings.account')
        entries.set(id ?? key, component)
        return () => { entries.delete(id ?? key) }
      },
    },
  })
  return {
    entries, calls,
    setStatus(next) { status = next; for (const listener of listeners) listener() },
    dispose() { for (const dispose of effects.reverse()) dispose(); assert.equal(listeners.size, 0) },
  }
}

function render(Component, view = 'page', can = () => true) {
  let tree
  act(() => {
    tree = create(React.createElement(Component, { view, t: key => key, useRemoteAccess: can }), {
      createNodeMock: node => node.type === 'dialog' ? {
        open: false, showModal() { this.open = true }, close() { this.open = false },
      } : null,
    })
  })
  return tree
}

const click = async button => { await act(async () => { button.props.onClick() }) }

test('settings actions register only while signed in, and unload removes all contributions', () => {
  const app = activate()
  assert.deepEqual([...app.entries.keys()], [id])
  app.setStatus('credential-stored')
  assert.deepEqual([...app.entries.keys()], [id, pkg])
  app.setStatus('signed-out')
  assert.deepEqual([...app.entries.keys()], [id])
  app.setStatus('credential-stored')
  app.dispose()
  assert.equal(app.entries.size, 0)
})

test('the CSS still hides only the signed-in launcher, not the footer', () => {
  const app = activate()
  const style = app.entries.get(id)()
  assert.equal(style.type, 'style')
  assert.match(style.props.children.trim().replace(/\s+/g, ' '),
    /^\[data-slot="sidebar.settings"\] \[data-slot="settings.launcher"\] > div\[data-inset\]:has\(button\[data-signed-out="false"\]\[data-collapsed\]\[aria-haspopup="menu"\]\) \{ display: none; \}/)
  app.dispose()
})

test('the settings page renders icon and text, and omits sign-out when refused', () => {
  const app = activate({ status: 'credential-stored' })
  const Component = app.entries.get(pkg)
  const summary = render(Component, 'summary')
  assert.equal(summary.toJSON(), null)
  const denied = render(Component, 'page', endpoint => endpoint !== 'account/signOut')
  assert.equal(denied.root.findAllByType('button').length, 0)
  const page = render(Component)
  const link = page.root.findByType('a')
  assert.equal(new URL(link.props.href).hostname, 'trtgsjkv6r.feishu.cn')
  assert.equal(link.props.target, '_blank')
  assert.equal(link.findByType('svg').props['aria-hidden'], 'true')
  assert.equal(link.props.children.at(-1), 'contactUs')
  const button = page.root.findByType('button')
  assert.equal(button.findByType('svg').props['aria-hidden'], 'true')
  assert.equal(button.props.children.at(-1), 'signOut')
  act(() => { summary.unmount(); denied.unmount(); page.unmount() })
  app.dispose()
})

test('sign-out checks task impact, lets the user cancel, and keeps failures retryable', async () => {
  const app = activate({ status: 'credential-stored', running: true, failFirst: true })
  const page = render(app.entries.get(pkg))
  const buttons = () => page.root.findAllByType('button')
  await click(buttons()[0])
  assert.deepEqual(app.calls, ['check'])
  assert.equal(page.root.findByType('p').props.children, 'signOutRunningDescription')
  await click(buttons()[1])
  assert.equal(page.root.findAllByType('dialog').length, 0)
  assert.deepEqual(app.calls, ['check'])
  await click(buttons()[0])
  await click(buttons()[2])
  assert.equal(page.root.findByProps({ role: 'alert' }).props.children, 'failed')
  await click(buttons()[2])
  assert.equal(page.root.findAllByType('dialog').length, 0)
  assert.deepEqual(app.calls, ['check', 'check', ['signOut', { locale: 'zh' }], ['signOut', { locale: 'zh' }]])
  act(() => page.unmount())
  app.dispose()
})

test('an unavailable task check shows an explicit unknown-impact confirmation', async () => {
  const app = activate({ status: 'credential-stored', checkFails: true })
  const page = render(app.entries.get(pkg))
  await click(page.root.findByType('button'))
  assert.equal(page.root.findByType('p').props.children, 'signOutUnknownDescription')
  assert.deepEqual(app.calls, ['check'])
  act(() => page.unmount())
  app.dispose()
})
