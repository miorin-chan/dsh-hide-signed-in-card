import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'

let registration
const fakeWindow = { __ModuleLoader__: { load(entry) { registration = entry } } }
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true })
try {
  await import('../client.js')
} finally {
  Reflect.deleteProperty(globalThis, 'window')
}

const id = 'dsh-hide-signed-in-card'
assert.equal(registration.id, `@miorin/${id}`)
const plugin = registration.factory(name => {
  assert.equal(name, 'react')
  return { createElement }
})

function activate() {
  const entries = new Map()
  let dispose
  plugin.apply({
    effect(install) { dispose = install() },
    slots: {
      inject(owner, mount) {
        assert.equal(owner, 'shell.overlay')
        return mount()
      },
      register({ name, id }, component) {
        assert.equal(name, 'shell.overlay')
        entries.set(id, component)
        return () => { entries.delete(id) }
      },
    },
  })
  return { entries, dispose }
}

test('the client contributes only a removable stylesheet', () => {
  assert.deepEqual(plugin.inject, ['slots'])
  const { entries, dispose } = activate()
  assert.deepEqual([...entries.keys()], [id])
  assert.equal(entries.get(id)().type, 'style')
  dispose()
  assert.equal(entries.size, 0)
})

test('the sole CSS rule requires the native signed-in trigger and hides its card, not the footer', () => {
  const { entries, dispose } = activate()
  const { children } = entries.get(id)().props
  assert.equal(children.trim().replace(/\s+/g, ' '),
    '[data-slot="sidebar.settings"] [data-slot="settings.launcher"] > div[data-inset]:has(button[data-signed-out="false"][data-collapsed][aria-haspopup="menu"]) { display: none; }')
  dispose()
})
