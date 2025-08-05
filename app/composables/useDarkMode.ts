export const useDarkMode = () => {
  const colorMode = useColorMode()
  
  const isDark = computed(() => colorMode.value === 'dark')
  
  const toggleDarkMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
  
  const setDarkMode = (dark: boolean) => {
    colorMode.preference = dark ? 'dark' : 'light'
  }
  
  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    colorMode: readonly(colorMode)
  }
} 