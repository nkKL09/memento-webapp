/**
 * Заглушка для expo-font/build/server на нативных платформах.
 * Font.js в expo-font 14 импортирует ./server; резолвер Metro иногда не находит
 * этот файл в пакете — подставляем эту заглушку (no-op), чтобы сборка проходила.
 */
export function registerStaticFont() {}
export function getServerResources() {
  return [];
}
export function resetServerContext() {}
