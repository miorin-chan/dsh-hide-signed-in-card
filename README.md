# Hide signed-in card

[简体中文](README.zh.md)

Hides the entire account card at the bottom of the sidebar when signed in.
The native launcher stays visible when signed out.

Build the source with `pnpm install`, then choose this directory under **Plugins** → **Add plugin**.
The bundle requires DeepSeek Harness 0.2.2-rc.5 or later with the native account launcher.

The Settings shortcut still works.
While signed in, open this plugin's settings in **Plugins** for **Feedback** and **Sign out**.
Sign-out asks for confirmation and warns about running account tasks.
Disabling the plugin restores the native account card.

[Project documentation](docs/README.md)

## Screenshots

The Chinese-language plugin settings show sign-out and feedback controls.
The signed-in state was simulated without a real account.

![Sign-out and feedback controls in the plugin settings](docs/assets/screenshots/main-light.png)

[Dark theme](docs/assets/screenshots/main-dark.png)
