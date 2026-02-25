// Глава 1: Вводные статьи. Собирает статьи из отдельных файлов.
import article01 from './article01.js';
import article02 from './article02.js';
import article03 from './article03.js';
import article04 from './article04.js';
import article05 from './article05.js';
import article06 from './article06.js';

const chapter01 = {
  id: '1',
  title: 'Вводные статьи',
  articles: [
    article01,
    article02,
    article03,
    article04,
    article05,
    article06,
  ],
};

export default chapter01;
