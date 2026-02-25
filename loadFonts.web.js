/**
 * Web: предзагрузка шрифтов иконок через expo-font, чтобы иконки отображались
 * в Telegram WebView и браузере.
 */
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export function useFontsLoaded() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  // При ошибке загрузки всё равно показываем приложение (иконки могут не отобразиться)
  return [loaded || !!error];
}
