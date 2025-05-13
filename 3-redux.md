# Архитектура Redux для SPA сервиса философских концепций

## Основные принципы

При проектировании архитектуры Redux для сервиса философских концепций используются следующие принципы:

1. **Использование Redux Toolkit** для упрощения работы с Redux и уменьшения шаблонного кода
2. **Доменное разделение состояния** на логические слайсы по функциональным областям
3. **Нормализация данных** для эффективной работы с взаимосвязанными сущностями
4. **Использование Thunks** для обработки асинхронных операций
5. **Мемоизация селекторов** для оптимизации выборки данных
6. **Иммутабельность** всех обновлений состояния
7. **Предсказуемая обработка ошибок** с использованием стандартных паттернов

## Структура Redux Store

```
store/
├── index.js                  # Конфигурация Redux store
├── rootReducer.js            # Корневой редьюсер
├── middleware.js             # Настройка middleware
└── slices/                   # Слайсы Redux
    ├── concepts/             # Слайс концепций
    │   ├── slice.js          # Основной слайс
    │   ├── selectors.js      # Селекторы
    │   └── thunks.js         # Асинхронные функции
    ├── graphs/               # Слайс графов концепций
    │   ├── slice.js
    │   ├── selectors.js
    │   └── thunks.js
    ├── theses/               # Слайс тезисов
    │   ├── slice.js
    │   ├── selectors.js
    │   └── thunks.js
    ├── synthesis/            # Слайс синтеза концепций
    │   ├── slice.js
    │   ├── selectors.js
    │   └── thunks.js
    ├── claudeInteractions/   # Слайс взаимодействия с Claude
    │   ├── slice.js
    │   ├── selectors.js
    │   └── thunks.js
    ├── ui/                   # Слайс UI состояния
    │   ├── slice.js
    │   └── selectors.js
    └── auth/                 # Слайс авторизации
        ├── slice.js
        ├── selectors.js
        └── thunks.js
```

## Конфигурация Redux Store

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import middleware from './middleware';
import { loadState, saveState } from '../services/localStorage';

const preloadedState = loadState();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
  preloadedState,
  devTools: process.env.NODE_ENV !== 'production',
});

// Сохранение состояния при изменении
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
```

```javascript
// store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import conceptsReducer from './slices/concepts/slice';
import graphsReducer from './slices/graphs/slice';
import thesesReducer from './slices/theses/slice';
import synthesisReducer from './slices/synthesis/slice';
import claudeInteractionsReducer from './slices/claudeInteractions/slice';
import uiReducer from './slices/ui/slice';
import authReducer from './slices/auth/slice';

const rootReducer = combineReducers({
  concepts: conceptsReducer,
  graphs: graphsReducer,
  theses: thesesReducer,
  synthesis: synthesisReducer,
  claudeInteractions: claudeInteractionsReducer,
  ui: uiReducer,
  auth: authReducer,
});

export default rootReducer;
```

```javascript
// store/middleware.js
import logger from 'redux-logger';
import { localStorageMiddleware } from '../services/localStorage/middleware';

const middleware = [
  localStorageMiddleware,
];

// Добавляем logger только в режиме разработки
if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
}

export default middleware;
```

## Детальное описание слайсов

### 1. Слайс концепций (concepts)

#### Структура состояния

```javascript
{
  // Нормализованное хранение концепций
  entities: {
    // Объект с концепциями, где ключ - id концепции
    byId: {
      'concept-1': {
        id: 'concept-1',
        name: 'Категорический императив',
        description: 'Моральный принцип Канта...',
        created: '2025-04-15T10:30:00Z',
        updated: '2025-04-16T14:20:00Z',
        author: 'user-1',
        tags: ['ethics', 'philosophy'],
        relatedThesesIds: ['thesis-1', 'thesis-2'],
        // Метаданные для синтеза
        synthesisMetadata: {
          certainty: 0.85,
          centrality: 0.75,
          tradition: 'german idealism'
        }
      },
      'concept-2': {
        // ...другая концепция
      }
    },
    // Массив всех ID концепций для поддержания порядка
    allIds: ['concept-1', 'concept-2', 'concept-3']
  },
  // Состояние загрузки
  loading: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // Данные для фильтрации и пагинации в UI
  filter: {
    searchQuery: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  },
  // Активная концепция (для детального просмотра/редактирования)
  activeConceptId: null
}
```

#### Slice

```javascript
// slices/concepts/slice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchConcepts, fetchConceptById, createConcept, updateConcept, deleteConcept } from './thunks';

const initialState = {
  entities: {
    byId: {},
    allIds: []
  },
  loading: 'idle',
  error: null,
  filter: {
    searchQuery: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  },
  activeConceptId: null
};

const conceptsSlice = createSlice({
  name: 'concepts',
  initialState,
  reducers: {
    // Синхронные редьюсеры
    setActiveConceptId(state, action) {
      state.activeConceptId = action.payload;
    },
    
    setConceptFilter(state, action) {
      state.filter = {
        ...state.filter,
        ...action.payload
      };
    },
    
    resetFilters(state) {
      state.filter = initialState.filter;
    },
    
    addRelatedThesis(state, action) {
      const { conceptId, thesisId } = action.payload;
      const concept = state.entities.byId[conceptId];
      
      if (concept && !concept.relatedThesesIds.includes(thesisId)) {
        concept.relatedThesesIds.push(thesisId);
      }
    },
    
    removeRelatedThesis(state, action) {
      const { conceptId, thesisId } = action.payload;
      const concept = state.entities.byId[conceptId];
      
      if (concept) {
        concept.relatedThesesIds = concept.relatedThesesIds.filter(id => id !== thesisId);
      }
    }
  },
  extraReducers: (builder) => {
    // Обработка асинхронных действий
    
    // Загрузка списка концепций
    builder.addCase(fetchConcepts.pending, (state) => {
      state.loading = 'loading';
    })
    builder.addCase(fetchConcepts.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      // Нормализация данных
      const byId = {};
      const allIds = [];
      
      action.payload.forEach(concept => {
        byId[concept.id] = concept;
        allIds.push(concept.id);
      });
      
      state.entities.byId = byId;
      state.entities.allIds = allIds;
    })
    builder.addCase(fetchConcepts.rejected, (state, action) => {
      state.loading = 'failed';
      state.error = action.error.message;
    })
    
    // Загрузка одной концепции
    builder.addCase(fetchConceptById.pending, (state) => {
      state.loading = 'loading';
    })
    builder.addCase(fetchConceptById.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      state.entities.byId[action.payload.id] = action.payload;
      
      if (!state.entities.allIds.includes(action.payload.id)) {
        state.entities.allIds.push(action.payload.id);
      }
      
      state.activeConceptId = action.payload.id;
    })
    builder.addCase(fetchConceptById.rejected, (state, action) => {
      state.loading = 'failed';
      state.error = action.error.message;
    })
    
    // Создание концепции
    builder.addCase(createConcept.fulfilled, (state, action) => {
      const newConcept = action.payload;
      state.entities.byId[newConcept.id] = newConcept;
      state.entities.allIds.push(newConcept.id);
      state.activeConceptId = newConcept.id;
    })
    
    // Обновление концепции
    builder.addCase(updateConcept.fulfilled, (state, action) => {
      const updatedConcept = action.payload;
      state.entities.byId[updatedConcept.id] = updatedConcept;
    })
    
    // Удаление концепции
    builder.addCase(deleteConcept.fulfilled, (state, action) => {
      const deletedId = action.payload;
      delete state.entities.byId[deletedId];
      state.entities.allIds = state.entities.allIds.filter(id => id !== deletedId);
      
      if (state.activeConceptId === deletedId) {
        state.activeConceptId = null;
      }
    })
  }
});

export const { 
  setActiveConceptId, 
  setConceptFilter, 
  resetFilters,
  addRelatedThesis,
  removeRelatedThesis
} = conceptsSlice.actions;

export default conceptsSlice.reducer;
```

#### Thunks

```javascript
// slices/concepts/thunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { localStorageService } from '../../services/localStorage';

export const fetchConcepts = createAsyncThunk(
  'concepts/fetchConcepts',
  async (_, { rejectWithValue }) => {
    try {
      const concepts = await localStorageService.getConcepts();
      return concepts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConceptById = createAsyncThunk(
  'concepts/fetchConceptById',
  async (conceptId, { rejectWithValue }) => {
    try {
      const concept = await localStorageService.getConceptById(conceptId);
      
      if (!concept) {
        throw new Error(`Concept with id ${conceptId} not found`);
      }
      
      return concept;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConcept = createAsyncThunk(
  'concepts/createConcept',
  async (conceptData, { rejectWithValue }) => {
    try {
      const newConcept = await localStorageService.createConcept(conceptData);
      return newConcept;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateConcept = createAsyncThunk(
  'concepts/updateConcept',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updatedConcept = await localStorageService.updateConcept(id, data);
      return updatedConcept;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteConcept = createAsyncThunk(
  'concepts/deleteConcept',
  async (conceptId, { rejectWithValue }) => {
    try {
      await localStorageService.deleteConcept(conceptId);
      return conceptId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

#### Selectors

```javascript
// slices/concepts/selectors.js
import { createSelector } from '@reduxjs/toolkit';

// Базовые селекторы
export const selectConceptsState = state => state.concepts;
export const selectConceptEntities = state => state.concepts.entities.byId;
export const selectConceptIds = state => state.concepts.entities.allIds;
export const selectActiveConceptId = state => state.concepts.activeConceptId;
export const selectConceptFilter = state => state.concepts.filter;
export const selectConceptsLoading = state => state.concepts.loading;
export const selectConceptsError = state => state.concepts.error;

// Мемоизированные селекторы
export const selectAllConcepts = createSelector(
  [selectConceptEntities, selectConceptIds],
  (entities, ids) => ids.map(id => entities[id])
);

export const selectActiveConcept = createSelector(
  [selectConceptEntities, selectActiveConceptId],
  (entities, activeId) => activeId ? entities[activeId] : null
);

// Селектор для отфильтрованных концепций
export const selectFilteredConcepts = createSelector(
  [selectAllConcepts, selectConceptFilter],
  (concepts, filter) => {
    let result = [...concepts];
    
    // Применяем текстовый поиск
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(concept => 
        concept.name.toLowerCase().includes(query) || 
        concept.description.toLowerCase().includes(query)
      );
    }
    
    // Фильтрация по тегам
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter(concept => 
        filter.tags.some(tag => concept.tags.includes(tag))
      );
    }
    
    // Сортировка
    result.sort((a, b) => {
      let aValue = a[filter.sortBy];
      let bValue = b[filter.sortBy];
      
      // Преобразование для строковых значений
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }
);

// Селектор для пагинированных концепций
export const selectPaginatedConcepts = createSelector(
  [selectFilteredConcepts, selectConceptFilter],
  (filteredConcepts, filter) => {
    const { page, limit } = filter;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      concepts: filteredConcepts.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredConcepts.length / limit),
      currentPage: page,
      totalItems: filteredConcepts.length
    };
  }
);

// Селектор для получения связанных тезисов
export const selectRelatedThesesIds = createSelector(
  [selectConceptEntities, (_, conceptId) => conceptId],
  (entities, conceptId) => {
    const concept = entities[conceptId];
    return concept ? concept.relatedThesesIds : [];
  }
);
```

### 2. Слайс графов концепций (graphs)

#### Структура состояния

```javascript
{
  // Нормализованное хранение графов
  entities: {
    // Объект с графами, где ключ - id графа
    byId: {
      'graph-1': {
        id: 'graph-1',
        name: 'Основные этические концепции',
        description: 'Граф взаимосвязей основных этических концепций...',
        created: '2025-04-17T09:15:00Z',
        updated: '2025-04-18T11:25:00Z',
        author: 'user-1',
        // Категории (узлы графа)
        categories: {
          'category-1': {
            id: 'category-1',
            name: 'Утилитаризм',
            description: 'Этическая теория, основанная на...',
            position: { x: 100, y: 150 },
            color: '#FF5733',
            metadata: {
              centrality: 0.85,
              certainty: 0.9
            },
            associatedConceptIds: ['concept-3', 'concept-4']
          },
          'category-2': {
            // ...другая категория
          }
        },
        // Связи между категориями (рёбра графа)
        relationships: {
          'rel-1': {
            id: 'rel-1',
            sourceId: 'category-1',
            targetId: 'category-2',
            type: 'opposition',
            strength: 0.75,
            description: 'Противопоставление по принципу...'
          },
          'rel-2': {
            // ...другая связь
          }
        },
        // Настройки визуализации графа
        visualSettings: {
          layout: 'force',
          theme: 'light',
          nodeSizeBy: 'centrality',
          edgeWidthBy: 'strength'
        }
      },
      'graph-2': {
        // ...другой граф
      }
    },
    // Массив всех ID графов для поддержания порядка
    allIds: ['graph-1', 'graph-2']
  },
  // Состояние загрузки
  loading: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // Данные для фильтрации и пагинации в UI
  filter: {
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 5
  },
  // Активный граф (для детального просмотра/редактирования)
  activeGraphId: null,
  // Выбранные элементы в активном графе
  selectedElements: {
    categoryIds: [],
    relationshipIds: []
  }
}
```

### 3. Слайс тезисов (theses)

#### Структура состояния

```javascript
{
  // Нормализованное хранение тезисов
  entities: {
    // Объект с тезисами, где ключ - id тезиса
    byId: {
      'thesis-1': {
        id: 'thesis-1',
        content: 'Категорический императив предписывает действовать так, чтобы...',
        type: 'principle', // 'principle' | 'argument' | 'definition' | 'example'
        created: '2025-04-15T14:30:00Z',
        updated: '2025-04-16T10:20:00Z',
        author: 'user-1',
        tags: ['ethics', 'kant'],
        // Связанные концепции
        relatedConceptIds: ['concept-1'],
        // Метаданные генерации тезиса
        generationMetadata: {
          source: 'claude', // 'claude' | 'user' | 'synthesis'
          prompt: 'Сформулируйте основной принцип категорического императива',
          timestamp: '2025-04-15T14:25:00Z'
        }
      },
      'thesis-2': {
        // ...другой тезис
      }
    },
    // Массив всех ID тезисов для поддержания порядка
    allIds: ['thesis-1', 'thesis-2', 'thesis-3']
  },
  // Состояние загрузки
  loading: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // Данные для фильтрации и пагинации в UI
  filter: {
    searchQuery: '',
    conceptId: null, // Фильтр по связанной концепции
    type: null,      // Фильтр по типу тезиса
    tags: [],
    sortBy: 'created',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  },
  // Активный тезис (для детального просмотра/редактирования)
  activeThesisId: null
}
```

### 4. Слайс синтеза концепций (synthesis)

#### Структура состояния

```javascript
{
  // История синтеза концепций
  history: {
    // Объект с результатами синтеза, где ключ - id синтеза
    byId: {
      'synthesis-1': {
        id: 'synthesis-1',
        name: 'Синтез утилитаризма и деонтологии',
        // Исходные концепции
        sourceConceptIds: ['concept-1', 'concept-2'],
        // Результирующая концепция (если была сохранена)
        resultConceptId: 'concept-5',
        // Параметры синтеза
        parameters: {
          method: 'dialectical', // 'dialectical' | 'integrative' | 'comparative'
          focus: 'principles',   // 'principles' | 'applications' | 'history'
          depth: 'deep'          // 'basic' | 'standard' | 'deep'
        },
        // Результаты синтеза
        result: {
          content: 'Синтез категорического императива и принципа полезности приводит к...',
          analysis: {
            commonalities: ['Оба подхода стремятся к универсализации...'],
            differences: ['Утилитаризм фокусируется на последствиях, в то время как...'],
            tensions: ['Напряжение возникает при рассмотрении...'],
            resolution: 'Возможный синтез этих подходов заключается в...'
          }
        },
        // Метаданные
        created: '2025-04-19T15:30:00Z',
        author: 'user-1',
        status: 'completed' // 'pending' | 'processing' | 'completed' | 'failed'
      },
      'synthesis-2': {
        // ...другой синтез
      }
    },
    // Массив всех ID синтеза для поддержания порядка
    allIds: ['synthesis-1', 'synthesis-2']
  },
  // Текущий процесс синтеза
  current: {
    // Выбранные для синтеза концепции
    selectedConceptIds: [],
    // Параметры синтеза
    parameters: {
      method: 'dialectical',
      focus: 'principles',
      depth: 'standard'
    },
    // Состояние процесса
    status: 'idle', // 'idle' | 'selecting' | 'configuring' | 'processing' | 'reviewing'
    progress: 0,    // Прогресс от 0 до 100
    // Результаты (если есть)
    result: null,
    error: null
  },
  // Активный синтез из истории (для просмотра)
  activeHistoryId: null
}
```

### 5. Слайс взаимодействия с Claude (claudeInteractions)

#### Структура состояния

```javascript
{
  // История запросов к Claude API
  history: {
    // Объект с запросами, где ключ - id запроса
    byId: {
      'query-1': {
        id: 'query-1',
        prompt: 'Объясните основные принципы утилитаризма и его критику',
        // Параметры запроса
        parameters: {
          temperature: 0.7,
          maxTokens: 1000,
          model: 'claude-3'
        },
        // Результат
        response: {
          content: 'Утилитаризм — это этическая теория, согласно которой...',
          usage: {
            promptTokens: 15,
            completionTokens: 450,
            totalTokens: 465
          }
        },
        // Метаданные
        timestamp: '2025-04-14T11:20:00Z',
        status: 'completed', // 'pending' | 'processing' | 'completed' | 'failed'
        error: null,
        // Связь с сущностями (если запрос был использован для создания)
        linkedEntities: {
          conceptIds: ['concept-3'],
          thesisIds: ['thesis-4', 'thesis-5']
        }
      },
      'query-2': {
        // ...другой запрос
      }
    },
    // Массив всех ID запросов для поддержания порядка
    allIds: ['query-1', 'query-2']
  },
  // Текущий запрос
  current: {
    prompt: '',
    parameters: {
      temperature: 0.7,
      maxTokens: 1000,
      model: 'claude-3'
    },
    status: 'idle', // 'idle' | 'processing' | 'completed' | 'failed'
    response: null,
    error: null,
    isEditing: false // Редактирует ли пользователь текущий запрос
  },
  // Активный запрос из истории (для просмотра)
  activeHistoryId: null,
  // Состояние очереди запросов
  queue: {
    pending: [], // ID запросов в очереди
    isProcessing: false
  }
}
```

### 6. Слайс UI состояния (ui)

#### Структура состояния

```javascript
{
  // Состояния модальных окон
  modals: {
    createConcept: false,
    editConcept: false,
    deleteConcept: false,
    createThesis: false,
    // ... другие модальные окна
  },
  // Состояния боковых панелей
  sidebars: {
    main: true,
    details: false,
    history: false
  },
  // Состояния предупреждений и уведомлений
  notifications: {
    list: [
      {
        id: 'notif-1',
        type: 'success', // 'success' | 'error' | 'warning' | 'info'
        message: 'Концепция успешно создана',
        dismissed: false,
        timestamp: '2025-04-15T14:30:00Z'
      }
    ],
    isDismissed: false
  },
  // Общие настройки интерфейса
  settings: {
    theme: 'light', // 'light' | 'dark' | 'system'
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    language: 'ru', // 'ru' | 'en'
    sidebar: {
      expanded: true,
      width: 250
    }
  },
  // Состояние навигации
  navigation: {
    currentModule: 'concepts', // 'concepts' | 'graphs' | 'theses' | 'synthesis' | 'claude'
    breadcrumbs: [
      { label: 'Концепции', path: '/concepts' },
      { label: 'Категорический императив', path: '/concepts/concept-1' }
    ],
    history: [
      // История навигации
    ]
  }
}
```

### 7. Слайс авторизации (auth)

#### Структура состояния

```javascript
{
  // Данные пользователя
  user: {
    id: 'user-1',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    avatar: 'https://example.com/avatar.jpg',
    preferences: {
      defaultTheme: 'dark',
      defaultLanguage: 'ru'
    }
  },
  // Статус авторизации
  status: 'authenticated', // 'idle' | 'pending' | 'authenticated' | 'failed'
  error: null,
  // Токен авторизации (если используется)
  token: 'eyJhbGciOiJIUzI1...',
  // Состояние сессии
  session: {
    expires: '2025-05-15T14:30:00Z',
    isActive: true,
    lastActivity: '2025-04-15T14:30:00Z'
  }
}
```

## Взаимодействие с сервисом локального хранилища

Для взаимосвязи Redux с сервисом локального хранилища создается специальный middleware:

```javascript
// services/localStorage/middleware.js
import { saveConcept, saveGraph, saveThesis, saveSynthesis } from './actions';

// Список действий, которые должны сохраняться в локальное хранилище
const actionTypesToSync = [
  'concepts/createConcept/fulfilled',
  'concepts/updateConcept/fulfilled',
  'concepts/deleteConcept/fulfilled',
  'graphs/createGraph/fulfilled',
  'graphs/updateGraph/fulfilled',
  'graphs/deleteGraph/fulfilled',
  // ...и другие
];

export const localStorageMiddleware = store => next => action => {
  // Вызываем следующий middleware в цепочке
  const result = next(action);
  
  // Проверяем, нужно ли сохранять изменения в localStorage
  if (actionTypesToSync.includes(action.type)) {
    const state = store.getState();
    
    // В зависимости от типа действия сохраняем соответствующие данные
    if (action.type.startsWith('concepts/')) {
      saveConcept(state.concepts);
    } else if (action.type.startsWith('graphs/')) {
      saveGraph(state.graphs);
    } else if (action.type.startsWith('theses/')) {
      saveThesis(state.theses);
    } else if (action.type.startsWith('synthesis/')) {
      saveSynthesis(state.synthesis);
    }
  }
  
  return result;
};
```

## Асинхронная обработка операций с использованием Thunks

Для наглядности приведем пример более сложного thunk для операции синтеза концепций:

```javascript
// slices/synthesis/thunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { localStorageService } from '../../services/localStorage';
import { claudeApiService } from '../../api/claudeApi';

export const performSynthesis = createAsyncThunk(
  'synthesis/performSynthesis',
  async ({ conceptIds, parameters }, { rejectWithValue, getState, dispatch }) => {
    try {
      // Обновляем состояние текущего синтеза
      dispatch(setSynthesisStatus('processing'));
      dispatch(setSynthesisProgress(10));
      
      // Получаем концепции из состояния
      const state = getState();
      const concepts = conceptIds.map(id => state.concepts.entities.byId[id]);
      
      if (!concepts.every(Boolean)) {
        throw new Error('One or more concepts not found');
      }
      
      // Формируем запрос к Claude API
      const prompt = constructSynthesisPrompt(concepts, parameters);
      
      dispatch(setSynthesisProgress(30));
      
      // Отправляем запрос к Claude API через прокси
      const claudeResponse = await claudeApiService.sendQuery({
        prompt,
        parameters: {
          temperature: 0.7,
          maxTokens: 2000,
          model: 'claude-3'
        }
      });
      
      dispatch(setSynthesisProgress(70));
      
      // Обрабатываем ответ
      const parsedResponse = parseSynthesisResponse(claudeResponse);
      
      // Создаем запись в истории синтеза
      const synthesisRecord = {
        id: `synthesis-${Date.now()}`,
        name: `Синтез: ${concepts.map(c => c.name).join(' и ')}`,
        sourceConceptIds: conceptIds,
        parameters,
        result: parsedResponse,
        created: new Date().toISOString(),
        author: state.auth.user?.id || 'anonymous',
        status: 'completed'
      };
      
      // Сохраняем в локальное хранилище
      await localStorageService.saveSynthesis(synthesisRecord);
      
      dispatch(setSynthesisProgress(100));
      
      return {
        synthesisRecord,
        result: parsedResponse
      };
    } catch (error) {
      dispatch(setSynthesisStatus('failed'));
      return rejectWithValue(error.message);
    }
  }
);

// Вспомогательные функции
function constructSynthesisPrompt(concepts, parameters) {
  // Логика формирования промпта для синтеза
  const conceptDescriptions = concepts.map(c => 
    `Концепция: ${c.name}\nОписание: ${c.description}`
  ).join('\n\n');
  
  return `Выполните ${parameters.method} синтез следующих философских концепций,
    фокусируясь на их ${parameters.focus} с ${parameters.depth} глубиной анализа:
    
    ${conceptDescriptions}
    
    Проанализируйте общие черты, различия и напряжения между этими концепциями.
    Предложите возможное разрешение противоречий и синтетическую позицию.`;
}

function parseSynthesisResponse(response) {
  // Логика парсинга ответа от Claude API
  // ...
  return {
    content: response.content,
    analysis: {
      commonalities: [], // Парсинг из ответа
      differences: [],   // Парсинг из ответа
      tensions: [],      // Парсинг из ответа
      resolution: ''     // Парсинг из ответа
    }
  };
}
```

## Нормализация данных и организация связей

Для обеспечения эффективной работы с взаимосвязанными сущностями все данные нормализуются. Связи между сущностями организуются через ID:

1. **Концепции и тезисы**:
   - Концепция хранит массив ID связанных тезисов
   - Тезис хранит массив ID связанных концепций
   
2. **Графы и категории**:
   - Граф хранит объект категорий по их ID
   - Категории хранят массив ID связанных концепций
   
3. **Синтез и концепции**:
   - Синтез хранит массив ID исходных концепций и ID результирующей концепции (если сохранена)

## Селекторы с денормализацией

Для получения полных данных с учетом связей используются селекторы, выполняющие денормализацию:

```javascript
// Пример селектора для получения полных данных концепции с тезисами
export const selectConceptWithTheses = createSelector(
  [
    selectConceptEntities,
    state => state.theses.entities.byId,
    (_, conceptId) => conceptId
  ],
  (conceptEntities, thesisEntities, conceptId) => {
    const concept = conceptEntities[conceptId];
    
    if (!concept) return null;
    
    // Получаем связанные тезисы
    const relatedTheses = concept.relatedThesesIds.map(id => thesisEntities[id]).filter(Boolean);
    
    return {
      ...concept,
      theses: relatedTheses
    };
  }
);
```

## Рекомендации по использованию

1. **Использование нормализованной структуры данных**:
   - Всегда хранить сущности в формате `byId` с массивом `allIds`
   - Использовать селекторы для денормализации данных при отображении
   
2. **Обработка асинхронных операций**:
   - Использовать стандартные состояния `idle`, `loading`, `succeeded`, `failed`
   - Обрабатывать ошибки в каждом слайсе
   
3. **Оптимизация производительности**:
   - Использовать мемоизированные селекторы с библиотекой reselect
   - Минимизировать размер состояния Redux и количество обновлений
   
4. **Обновления состояния**:
   - Использовать иммутабельные обновления через createSlice
   - Группировать связанные обновления в одном reducer
   
5. **Тестирование**:
   - Писать модульные тесты для reducers, selectors и thunks
   - Использовать мокирование сервисов для тестирования thunks

## Масштабирование архитектуры

Для дальнейшего масштабирования приложения можно рассмотреть следующие подходы:

1. **Динамическая загрузка редьюсеров** - загружать редьюсеры только при необходимости
2. **Разделение состояния** - хранить часть состояния только в localStorage без Redux
3. **Оптимизация запросов** - реализовать кэширование и контроль уникальности запросов
4. **Дополнительная нормализация** - использовать библиотеку normalizr для сложных связей
5. **Управление middleware** - добавлять middleware в зависимости от конфигурации приложения
