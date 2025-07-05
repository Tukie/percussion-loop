const keyMapping = (data: Array<{ key: string; function: () => void }> = []) => {
  document.addEventListener('keydown', (event) => {
    const key = event.code

    if (!data.length) return

    data.forEach((item) => {
      if (item.key === key) {
        item.function()
      }
    })
  })
}

export { keyMapping }
