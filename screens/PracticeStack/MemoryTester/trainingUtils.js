// Модули и генерация последовательностей для Тренировки

export const MODULES = [
  { id: 'twoDigit', name: 'Двузначные числа (00–99)', max: 100 },
  { id: 'threeDigit', name: 'Трёхзначные числа (000–999)', max: 1000 },
  { id: 'months', name: 'Месяцы', max: 12 },
  { id: 'days', name: 'Дни недели', max: 7 },
];

export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Элементы модуля в виде строк (для диапазона чисел — от min до max включительно). customElements — массив для своих модулей (moduleId вида custom_*). */
export function getModuleElements(moduleId, rangeMin, rangeMax, customElements) {
  if (moduleId.startsWith('custom_') && Array.isArray(customElements) && customElements.length > 0) {
    return customElements;
  }
  switch (moduleId) {
    case 'twoDigit': {
      const min = rangeMin != null ? Math.max(0, Math.min(99, rangeMin)) : 0;
      const max = rangeMax != null ? Math.max(0, Math.min(99, rangeMax)) : 99;
      const arr = [];
      for (let n = min; n <= max; n++) arr.push(n < 10 ? '0' + n : String(n));
      return arr;
    }
    case 'threeDigit': {
      const min = rangeMin != null ? Math.max(0, Math.min(999, rangeMin)) : 0;
      const max = rangeMax != null ? Math.max(0, Math.min(999, rangeMax)) : 999;
      const arr = [];
      for (let n = min; n <= max; n++) arr.push(n < 10 ? '00' + n : n < 100 ? '0' + n : String(n));
      return arr;
    }
    case 'months':
      return MONTHS;
    case 'days':
      return DAYS;
    default:
      return getModuleElements('twoDigit', 0, 99);
  }
}

/** Случайная последовательность длины count. Без повторов, если count <= размер пула; иначе с повторами. customElements — для своих модулей. */
export function generateTrainingSequence(moduleId, count, rangeMin, rangeMax, customElements) {
  const pool = getModuleElements(moduleId, rangeMin, rangeMax, customElements);
  if (count <= pool.length) {
    return shuffle(pool).slice(0, count);
  }
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}

export function isNumberModule(moduleId) {
  return moduleId === 'twoDigit' || moduleId === 'threeDigit';
}

/** Свой (пользовательский) модуль — выбор из списка, не числовой ввод. */
export function isCatalogModule(moduleId) {
  return moduleId === 'months' || moduleId === 'days' || (typeof moduleId === 'string' && moduleId.startsWith('custom_'));
}
