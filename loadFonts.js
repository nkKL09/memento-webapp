/**
 * Native (Expo Go, Android, iOS): иконки уже доступны, предзагрузка не нужна.
 * Использование expo-font здесь избегает ошибки "Unable to resolve module ./server"
 * в expo-font 14 на нативных платформах.
 */
export function useFontsLoaded() {
  return [true]; // шрифты иконок уже доступны в нативной сборке
}
