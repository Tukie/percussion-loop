const keyMapping = (data: Array<{ key: string; function: () => void }> = []) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const binding = data.find((item) => item.key === event.code)
    binding?.function()
  }

  document.addEventListener('keydown', onKeyDown)
  return () => document.removeEventListener('keydown', onKeyDown)
}

export { keyMapping }
