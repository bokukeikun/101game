import { ref, watch } from 'vue'

export const MAX_NAME_LENGTH = 6

export function useNameInput() {
  const name = ref('')
  const isNameLength = ref(false)
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  const showLengthError = () => {
    isNameLength.value = true
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      isNameLength.value = false
    }, 2500)
  }

  const onBeforeInput = (e: InputEvent) => {
    if (e.isComposing) return
    if (!e.data && e.inputType?.startsWith('delete')) return

    const el = e.target as HTMLInputElement
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const next = el.value.slice(0, start) + (e.data ?? '') + el.value.slice(end)

    if (next.length > MAX_NAME_LENGTH) {
      e.preventDefault()
      showLengthError()
    }
  }

  const onPaste = (e: ClipboardEvent) => {
    const el = e.target as HTMLInputElement
    const paste = e.clipboardData?.getData('text') ?? ''
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const next = el.value.slice(0, start) + paste + el.value.slice(end)

    if (next.length > MAX_NAME_LENGTH) {
      e.preventDefault()
      name.value = next.slice(0, MAX_NAME_LENGTH)
      showLengthError()
    }
  }

  watch(name, (value) => {
    if (value.length > MAX_NAME_LENGTH) {
      name.value = value.slice(0, MAX_NAME_LENGTH)
      showLengthError()
    }
  })

  return {
    name,
    isNameLength,
    onBeforeInput,
    onPaste,
  }
}
