// content/textbook/index.js — Учебник мнемотехники 2002
// Источник: https://mnemotexnika.narod.ru/uchebnik.htm
// Статьи разнесены по папкам глав (chapter01, ...) и по отдельным файлам; полный текст с сайта без сокращений.

import chapter01 from './chapter01/index.js';
import chapter02 from './chapter02/index.js';
import chapter03 from './chapter03/index.js';

/** Главы учебника */
export const textbookChapters = [
  chapter01,
  chapter02,
  chapter03,
];

export default textbookChapters;
