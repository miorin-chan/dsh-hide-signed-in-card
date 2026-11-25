# Hide signed-in card

[简体中文](README.zh.md)

Hides the entire account card at the bottom of the sidebar when signed in.
The native launcher stays visible when signed out.

Build the source with `pnpm install`, then choose this directory under **Plugins** → **Add plugin**.
The bundle requires DeepSeek Harness 0.2.2-rc.5 or later with the native account launcher.

The Settings shortcut still works.
To use the native account menu while signed in, including its **Sign out** action, disable this plugin in **Plugins**.
The card returns immediately.

[Project documentation](docs/README.md)
