import type { BuiltInLocaleId, LocaleId } from '@deepseek-ai/dsh-client-locale/client'

export const NS = 'dsh-hide-signed-in-card'

const en = {
  sectionTitle: 'Account actions',
  signedInHint: 'Sidebar account card is hidden while signed in.',
  signedInReadOnlyHint: 'Sidebar account card is hidden while signed in.',
  feedbackHint: 'Opens the official questionnaire in your browser without account or device metadata.',
  openFeedback: 'Open',
} as const

export type LabelKey = keyof typeof en

const zh: Record<LabelKey, string> = {
  sectionTitle: '账号操作',
  signedInHint: '侧栏账号卡片已隐藏，可在此退出登录。',
  signedInReadOnlyHint: '已登录时自动隐藏侧栏账号卡片。',
  feedbackHint: '在浏览器中打开官方反馈问卷，不附带账号或设备信息。',
  openFeedback: '前往反馈',
}

const ja: Record<LabelKey, string> = {
  sectionTitle: 'アカウント操作',
  signedInHint: 'ログイン中はサイドバーのアカウントカードを非表示にしています。ここからログアウトできます。',
  signedInReadOnlyHint: 'ログイン中はサイドバーのアカウントカードを非表示にしています。',
  feedbackHint: 'アカウント情報やデバイス情報を送信せず、ブラウザで公式フィードバックフォームを開きます。',
  openFeedback: '開く',
}

const de: Record<LabelKey, string> = {
  sectionTitle: 'Kontoaktionen',
  signedInHint: 'Die Kontokarte in der Seitenleiste ist während der Anmeldung ausgeblendet.',
  signedInReadOnlyHint: 'Die Kontokarte in der Seitenleiste ist während der Anmeldung ausgeblendet.',
  feedbackHint: 'Öffnet den offiziellen Fragebogen im Browser ohne Konto- oder Gerätemetadaten.',
  openFeedback: 'Öffnen',
}

const es: Record<LabelKey, string> = {
  sectionTitle: 'Acciones de cuenta',
  signedInHint: 'La tarjeta de cuenta en la barra lateral está oculta mientras la sesión está iniciada.',
  signedInReadOnlyHint: 'La tarjeta de cuenta en la barra lateral está oculta mientras la sesión está iniciada.',
  feedbackHint: 'Abre el cuestionario oficial en el navegador sin metadatos de cuenta ni de dispositivo.',
  openFeedback: 'Abrir',
}

const fr: Record<LabelKey, string> = {
  sectionTitle: 'Actions du compte',
  signedInHint: 'La carte de compte de la barre latérale est masquée lorsque vous êtes connecté.',
  signedInReadOnlyHint: 'La carte de compte de la barre latérale est masquée lorsque vous êtes connecté.',
  feedbackHint: 'Ouvre le questionnaire officiel dans votre navigateur sans métadonnées de compte ni d’appareil.',
  openFeedback: 'Ouvrir',
}

const pt: Record<LabelKey, string> = {
  sectionTitle: 'Ações da conta',
  signedInHint: 'O cartão da conta na barra lateral fica oculto enquanto você estiver conectado.',
  signedInReadOnlyHint: 'O cartão da conta na barra lateral fica oculto enquanto você estiver conectado.',
  feedbackHint: 'Abre o questionário oficial no navegador sem metadados da conta ou do dispositivo.',
  openFeedback: 'Abrir',
}

const ru: Record<LabelKey, string> = {
  sectionTitle: 'Действия с аккаунтом',
  signedInHint: 'Карточка аккаунта на боковой панели скрыта, пока выполнен вход.',
  signedInReadOnlyHint: 'Карточка аккаунта на боковой панели скрыта, пока выполнен вход.',
  feedbackHint: 'Открывает официальную форму обратной связи в браузере без данных аккаунта и устройства.',
  openFeedback: 'Открыть',
}

export const LABELS: Record<BuiltInLocaleId, Record<LabelKey, string>> & Record<LocaleId, Record<LabelKey, string>> = {
  en,
  zh,
  ja,
  de,
  es,
  fr,
  pt,
  ru,
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    [NS]: LabelKey
  }
}
