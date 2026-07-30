## Accessibility

Here are some accessibility edge cases scenarios we identified and users should keep in mind while using the `Dialog` components.

1. NVDA reads dialog information twice
2. Talkback doesn't support dialog name/description
3. Talkback doesn't support `alertdialog`
4. Whenever including a `Menu`, `Combobox`, `Dropdown` or `Popover` inside a dialog the property `aria-modal` should be false otherwise VoiceOver on IOS will not be able to access the popup. This is needed as well for VoiceOver on macOS, otherwise these components are not narrated. Apply `aria-modal=false` on the `DialogSurface` slot.
5. For short dialogs whose entire body reads as a single description, it is recommended to set `aria-describedby="dialog-content-id"` on the `DialogSurface` slot so the content is announced automatically when a screen reader user opens the dialog (depending on their settings). This is not applied by default. Avoid it for long or complex `DialogContent` (for example on [with form](#with-form)), where announcing the whole body as a single unbroken string is not ideal.
