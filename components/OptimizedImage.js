/**
 * Обёртка над Image для веба: loading="lazy" и decoding="async"
 * ускоряют прогрузку — картинки подгружаются по мере скролла и не блокируют рендер.
 * На нативе ведёт себя как обычный Image.
 */
import React from 'react';
import { Image, Platform } from 'react-native';

export default function OptimizedImage({ source, style, resizeMode, ...rest }) {
  const webProps = Platform.OS === 'web'
    ? { loading: 'lazy', decoding: 'async' }
    : {};

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      {...webProps}
      {...rest}
    />
  );
}
