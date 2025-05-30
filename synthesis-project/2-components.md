# Детальная структура основных React-компонентов для SPA сервиса философских концепций

## Общая иерархия компонентов

```
App
├── PageLayout
│   ├── Header
│   ├── Sidebar
│   ├── Content (маршрутизация)
│   └── Footer
│
├── Модуль работы с концепциями (ConceptsModule)
│   ├── ConceptsPage
│   │   ├── ConceptList
│   │   │   └── ConceptItem
│   │   └── FilterPanel
│   ├── ConceptDetailsPage
│   │   ├── ConceptDetails
│   │   │   ├── ConceptHeader
│   │   │   ├── ConceptContent
│   │   │   └── ConceptRelations
│   │   └── RelatedThesesPanel
│   └── ConceptEditorPage
│       └── ConceptForm
│
├── Модуль работы с графами концепций (GraphsModule)
│   ├── GraphsPage
│   │   ├── GraphList
│   │   │   └── GraphItem
│   │   └── FilterPanel
│   ├── GraphDetailsPage
│   │   ├── GraphVisualization
│   │   │   ├── GraphCanvas
│   │   │   └── GraphLegend
│   │   └── GraphControls
│   └── GraphEditorPage
│       ├── GraphEditor
│       │   ├── NodeEditor
│       │   └── EdgeEditor
│       └── GraphSettingsPanel
│
├── Модуль работы с тезисами (ThesesModule)
│   ├── ThesesPage
│   │   ├── ThesisList
│   │   │   └── ThesisItem
│   │   └── FilterPanel
│   ├── ThesisDetailsPage
│   │   ├── ThesisDetails
│   │   │   ├── ThesisHeader
│   │   │   ├── ThesisContent
│   │   │   └── ThesisMetadata
│   │   └── RelatedConceptsPanel
│   └── ThesisEditorPage
│       └── ThesisForm
│
├── Модуль синтеза концепций (SynthesisModule)
│   ├── SynthesisPage
│   │   ├── SynthesisForm
│   │   │   ├── ConceptSelector
│   │   │   └── SynthesisOptions
│   │   └── SynthesisHistory
│   │       └── SynthesisHistoryItem
│   └── SynthesisDetailsPage
│       ├── SynthesisResults
│       │   ├── SynthesisHeader
│       │   ├── SynthesisContent
│       │   └── SynthesisMetadata
│       └── ConceptComparisonPanel
│
└── Модуль взаимодействия с Claude API (ClaudeModule)
    ├── ClaudePage
    │   ├── ClaudeQueryForm
    │   │   ├── PromptEditor
    │   │   └── OptionsPanel
    │   └── QueryHistory
    │       └── QueryHistoryItem
    └── ClaudeResponsePage
        ├── ClaudeResponse
        │   ├── ResponseHeader
        │   ├── ResponseContent
        │   └── ResponseMetadata
        └── ActionPanel
```

## Детальное описание компонентов по модулям

### Модуль работы с концепциями

#### ConceptsPage
**Описание**: Страница списка всех концепций.  
**Пропсы**: нет (использует Redux)  
**Состояние**:  
- `filter` (строка): текущий текстовый фильтр  
- `sortBy` (строка): поле для сортировки  
- `sortOrder` (строка): порядок сортировки ('asc' | 'desc')  

**Хуки**:
- `useSelector` для получения списка концепций из Redux
- `useDispatch` для диспетчеризации действий
- `useEffect` для загрузки концепций при монтировании компонента

#### ConceptList
**Описание**: Компонент для отображения списка концепций с пагинацией.  
**Пропсы**:  
- `concepts` (массив): список концепций для отображения  
- `onSelectConcept` (функция): обработчик выбора концепции  

**Состояние**:  
- `page` (число): текущая страница  
- `itemsPerPage` (число): количество элементов на странице  

**Хуки**:
- `useMemo` для фильтрации и сортировки списка концепций
- `useCallback` для мемоизации обработчиков событий

#### ConceptItem
**Описание**: Компонент для отображения одной концепции в списке.  
**Пропсы**:  
- `concept` (объект): данные концепции  
- `onSelect` (функция): обработчик выбора  
- `isSelected` (boolean): выбрана ли концепция  

**Состояние**: нет (полностью управляемый компонент)

#### ConceptDetailsPage
**Описание**: Страница для отображения деталей концепции.  
**Пропсы**: нет (использует параметры URL и Redux)  
**Состояние**:  
- `isEditing` (boolean): режим редактирования  
- `loadingStatus` (строка): статус загрузки ('idle' | 'loading' | 'succeeded' | 'failed')  

**Хуки**:
- `useParams` для получения ID концепции из URL
- `useSelector` для получения данных концепции из Redux
- `useDispatch` для диспетчеризации действий
- `useEffect` для загрузки данных концепции

#### ConceptDetails
**Описание**: Компонент для отображения всех деталей концепции.  
**Пропсы**:  
- `concept` (объект): данные концепции  
- `onEdit` (функция): обработчик редактирования  
- `onDelete` (функция): обработчик удаления  

**Состояние**: нет (полностью управляемый компонент)

#### ConceptEditorPage
**Описание**: Страница для создания/редактирования концепции.  
**Пропсы**: нет (использует параметры URL и Redux)  
**Состояние**:  
- `formData` (объект): данные формы  
- `errors` (объект): ошибки валидации  
- `isSubmitting` (boolean): идет ли отправка формы  

**Хуки**:
- `useParams` для получения ID концепции из URL (если редактирование)
- `useSelector` для получения данных концепции из Redux (если редактирование)
- `useDispatch` для диспетчеризации действий
- `useFormValidation` для валидации формы

#### ConceptForm
**Описание**: Форма для создания/редактирования концепции.  
**Пропсы**:  
- `initialData` (объект): начальные данные формы  
- `onSubmit` (функция): обработчик отправки формы  
- `onCancel` (функция): обработчик отмены  

**Состояние**:  
- `formData` (объект): данные формы  
- `errors` (объект): ошибки валидации  
- `touched` (объект): отмечает поля, которые были изменены  

**Хуки**:
- `useFormValidation` для валидации формы
- `useEffect` для обновления данных формы при изменении initialData

### Модуль работы с графами концепций

#### GraphsPage
**Описание**: Страница списка всех графов концепций.  
**Пропсы**: нет (использует Redux)  
**Состояние**:  
- `filter` (строка): текущий текстовый фильтр  
- `sortBy` (строка): поле для сортировки  
- `sortOrder` (строка): порядок сортировки ('asc' | 'desc')  

**Хуки**:
- `useSelector` для получения списка графов из Redux
- `useDispatch` для диспетчеризации действий
- `useEffect` для загрузки графов при монтировании компонента

#### GraphVisualization
**Описание**: Компонент для визуализации графа концепций.  
**Пропсы**:  
- `graph` (объект): данные графа  
- `options` (объект): опции визуализации  
- `onNodeClick` (функция): обработчик клика по узлу  
- `onEdgeClick` (функция): обработчик клика по ребру  

**Состояние**:  
- `selectedNode` (объект): выбранный узел  
- `selectedEdge` (объект): выбранное ребро  
- `zoom` (число): текущий масштаб  
- `pan` (объект): текущее смещение {x, y}  

**Хуки**:
- `useRef` для получения доступа к DOM-элементу canvas
- `useEffect` для инициализации и обновления визуализации
- `useCallback` для мемоизации обработчиков событий
- `useGraphLayout` для работы с макетом графа

#### GraphControls
**Описание**: Элементы управления для графа концепций.  
**Пропсы**:  
- `onZoomIn` (функция): обработчик увеличения масштаба  
- `onZoomOut` (функция): обработчик уменьшения масштаба  
- `onReset` (функция): обработчик сброса масштаба и смещения  
- `onLayoutChange` (функция): обработчик изменения макета  
- `currentLayout` (строка): текущий макет  

**Состояние**: нет (полностью управляемый компонент)

#### GraphEditor
**Описание**: Компонент для редактирования графа концепций.  
**Пропсы**:  
- `graph` (объект): данные графа  
- `onSave` (функция): обработчик сохранения  
- `onCancel` (функция): обработчик отмены  

**Состояние**:  
- `currentGraph` (объект): текущее состояние графа  
- `selectedElement` (объект): выбранный элемент (узел или ребро)  
- `mode` (строка): текущий режим ('view' | 'edit' | 'add-node' | 'add-edge')  

**Хуки**:
- `useEffect` для инициализации редактора при изменении graph
- `useCallback` для мемоизации обработчиков событий
- `useGraphOperations` для выполнения операций с графом

### Модуль работы с тезисами

#### ThesesPage
**Описание**: Страница списка всех тезисов.  
**Пропсы**: нет (использует Redux)  
**Состояние**:  
- `filter` (строка): текущий текстовый фильтр  
- `conceptFilter` (строка): фильтр по концепции  
- `sortBy` (строка): поле для сортировки  
- `sortOrder` (строка): порядок сортировки ('asc' | 'desc')  

**Хуки**:
- `useSelector` для получения списка тезисов из Redux
- `useDispatch` для диспетчеризации действий
- `useEffect` для загрузки тезисов при монтировании компонента

#### ThesisList
**Описание**: Компонент для отображения списка тезисов с пагинацией.  
**Пропсы**:  
- `theses` (массив): список тезисов для отображения  
- `onSelectThesis` (функция): обработчик выбора тезиса  

**Состояние**:  
- `page` (число): текущая страница  
- `itemsPerPage` (число): количество элементов на странице  

**Хуки**:
- `useMemo` для фильтрации и сортировки списка тезисов
- `useCallback` для мемоизации обработчиков событий

#### ThesisForm
**Описание**: Форма для создания/редактирования тезиса.  
**Пропсы**:  
- `initialData` (объект): начальные данные формы  
- `availableConcepts` (массив): доступные концепции для связывания  
- `onSubmit` (функция): обработчик отправки формы  
- `onCancel` (функция): обработчик отмены  

**Состояние**:  
- `formData` (объект): данные формы  
- `errors` (объект): ошибки валидации  
- `touched` (объект): отмечает поля, которые были изменены  
- `selectedConcepts` (массив): выбранные концепции  

**Хуки**:
- `useFormValidation` для валидации формы
- `useEffect` для обновления данных формы при изменении initialData
- `useThesisValidation` для специфичной валидации тезисов

### Модуль синтеза концепций

#### SynthesisPage
**Описание**: Страница для синтеза концепций.  
**Пропсы**: нет (использует Redux)  
**Состояние**:  
- `selectedConcepts` (массив): выбранные концепции для синтеза  
- `synthesisOptions` (объект): опции синтеза  
- `isProcessing` (boolean): идет ли процесс синтеза  

**Хуки**:
- `useSelector` для получения списка концепций из Redux
- `useDispatch` для диспетчеризации действий
- `useSynthesisOperations` для операций синтеза

#### SynthesisForm
**Описание**: Форма для настройки и запуска синтеза концепций.  
**Пропсы**:  
- `availableConcepts` (массив): доступные концепции  
- `onSubmit` (функция): обработчик отправки формы  
- `isProcessing` (boolean): идет ли процесс синтеза  

**Состояние**:  
- `selectedConcepts` (массив): выбранные концепции  
- `synthesisType` (строка): тип синтеза  
- `options` (объект): дополнительные опции синтеза  
- `errors` (объект): ошибки валидации  

**Хуки**:
- `useFormValidation` для валидации формы
- `useCallback` для мемоизации обработчиков событий

#### SynthesisResults
**Описание**: Компонент для отображения результатов синтеза.  
**Пропсы**:  
- `synthesis` (объект): результаты синтеза  
- `onSave` (функция): обработчик сохранения результатов  
- `onDiscard` (функция): обработчик отмены результатов  

**Состояние**:  
- `activeTab` (строка): активная вкладка ('result' | 'comparison' | 'details')  

**Хуки**:
- `useEffect` для обработки данных синтеза при их изменении

### Модуль взаимодействия с Claude API

#### ClaudeQueryForm
**Описание**: Форма для отправки запросов к Claude API.  
**Пропсы**:  
- `initialPrompt` (строка): начальный текст запроса  
- `onSubmit` (функция): обработчик отправки формы  
- `isProcessing` (boolean): идет ли обработка запроса  

**Состояние**:  
- `prompt` (строка): текст запроса  
- `options` (объект): опции запроса к API  
- `errors` (объект): ошибки валидации  

**Хуки**:
- `useFormValidation` для валидации формы
- `useDebounce` для откладывания проверки длины промпта
- `useClaudeQuery` для работы с запросами к Claude API

#### ClaudeResponse
**Описание**: Компонент для отображения ответа от Claude API.  
**Пропсы**:  
- `response` (объект): ответ от API  
- `query` (объект): исходный запрос  
- `onSaveAsConcept` (функция): сохранить ответ как концепцию  
- `onSaveAsThesis` (функция): сохранить ответ как тезис  

**Состояние**:  
- `isExpanded` (boolean): развернут ли ответ полностью  
- `selectedFormat` (строка): выбранный формат для сохранения  

**Хуки**:
- `useMemo` для форматирования ответа API
- `useCallback` для мемоизации обработчиков событий

## Переиспользуемые компоненты

### Компоненты интерфейса (UI)

#### Button
**Описание**: Универсальная кнопка с различными стилями.  
**Пропсы**:  
- `variant` (строка): вариант оформления ('primary' | 'secondary' | 'outline' | 'text')  
- `size` (строка): размер ('sm' | 'md' | 'lg')  
- `disabled` (boolean): отключена ли кнопка  
- `loading` (boolean): показывать ли индикатор загрузки  
- `icon` (элемент): иконка  
- `onClick` (функция): обработчик клика  
- `className` (строка): дополнительные классы  
- `children` (элемент): содержимое кнопки  

**Состояние**: нет (полностью управляемый компонент)

#### Input
**Описание**: Универсальное текстовое поле ввода.  
**Пропсы**:  
- `type` (строка): тип поля ('text' | 'password' | 'email' | 'number')  
- `value` (строка/число): значение поля  
- `placeholder` (строка): плейсхолдер  
- `disabled` (boolean): отключено ли поле  
- `error` (строка): текст ошибки  
- `label` (строка): подпись к полю  
- `onChange` (функция): обработчик изменения  
- `onBlur` (функция): обработчик потери фокуса  
- `className` (строка): дополнительные классы  

**Состояние**: нет (полностью управляемый компонент)

#### Dropdown
**Описание**: Выпадающий список с поддержкой поиска.  
**Пропсы**:  
- `options` (массив): варианты выбора [{label, value}]  
- `value` (любой тип): выбранное значение  
- `placeholder` (строка): плейсхолдер  
- `disabled` (boolean): отключен ли компонент  
- `error` (строка): текст ошибки  
- `label` (строка): подпись к компоненту  
- `searchable` (boolean): возможность поиска  
- `multi` (boolean): множественный выбор  
- `onChange` (функция): обработчик изменения  
- `className` (строка): дополнительные классы  

**Состояние**:  
- `isOpen` (boolean): открыт ли список  
- `searchQuery` (строка): текст поиска  
- `filteredOptions` (массив): отфильтрованные опции  

**Хуки**:
- `useOutsideClick` для закрытия списка при клике вне компонента
- `useMemo` для фильтрации опций

#### Modal
**Описание**: Модальное окно.  
**Пропсы**:  
- `isOpen` (boolean): открыто ли окно  
- `onClose` (функция): обработчик закрытия  
- `title` (строка): заголовок окна  
- `size` (строка): размер ('sm' | 'md' | 'lg' | 'xl')  
- `closeOnOutsideClick` (boolean): закрывать ли при клике вне окна  
- `footer` (элемент): содержимое футера  
- `children` (элемент): содержимое окна  

**Состояние**:  
- `animation` (строка): текущая анимация ('entering' | 'entered' | 'exiting' | 'exited')  

**Хуки**:
- `useOutsideClick` для закрытия при клике вне окна
- `useEffect` для управления анимацией и блокировки прокрутки body

### Компоненты для работы с данными

#### DataTable
**Описание**: Универсальная таблица данных с сортировкой и пагинацией.  
**Пропсы**:  
- `data` (массив): данные для отображения  
- `columns` (массив): описание колонок [{id, header, accessor, Cell}]  
- `sortable` (boolean): возможность сортировки  
- `pagination` (boolean): наличие пагинации  
- `pageSize` (число): размер страницы  
- `onRowClick` (функция): обработчик клика по строке  
- `className` (строка): дополнительные классы  
- `emptyMessage` (строка): сообщение при отсутствии данных  

**Состояние**:  
- `sortBy` (строка): поле для сортировки  
- `sortOrder` (строка): порядок сортировки ('asc' | 'desc')  
- `page` (число): текущая страница  
- `processedData` (массив): обработанные данные для отображения  

**Хуки**:
- `useMemo` для обработки данных (сортировка, пагинация)
- `useCallback` для мемоизации обработчиков событий

#### Pagination
**Описание**: Компонент пагинации.  
**Пропсы**:  
- `currentPage` (число): текущая страница  
- `totalPages` (число): общее количество страниц  
- `onPageChange` (функция): обработчик изменения страницы  
- `siblingCount` (число): количество видимых соседних страниц  
- `className` (строка): дополнительные классы  

**Состояние**: нет (полностью управляемый компонент)

#### SearchBar
**Описание**: Строка поиска с задержкой ввода.  
**Пропсы**:  
- `value` (строка): значение поиска  
- `placeholder` (строка): плейсхолдер  
- `onChange` (функция): обработчик изменения  
- `onSearch` (функция): обработчик поиска  
- `debounceTime` (число): время задержки в мс  
- `className` (строка): дополнительные классы  

**Состояние**:  
- `inputValue` (строка): текущее значение ввода  

**Хуки**:
- `useDebounce` для откладывания выполнения поиска

#### FilterPanel
**Описание**: Панель фильтров.  
**Пропсы**:  
- `filters` (массив): описание фильтров [{id, label, type, options}]  
- `values` (объект): текущие значения фильтров  
- `onChange` (функция): обработчик изменения фильтров  
- `onReset` (функция): обработчик сброса фильтров  
- `className` (строка): дополнительные классы  

**Состояние**:  
- `expanded` (boolean): развернута ли панель  
- `localValues` (объект): локальные значения фильтров  

**Хуки**:
- `useEffect` для синхронизации локальных значений с пропсами
- `useCallback` для мемоизации обработчиков событий

## Компоненты для оптимизации производительности

### MemoizedList
**Описание**: Обертка для списков с мемоизацией элементов.  
**Пропсы**:  
- `items` (массив): элементы списка  
- `renderItem` (функция): функция рендеринга элемента  
- `getItemKey` (функция): функция получения ключа элемента  
- `className` (строка): дополнительные классы  

**Хуки**:
- `useMemo` для мемоизации списка элементов
- `useCallback` для мемоизации функции рендеринга

### VirtualizedList
**Описание**: Список с виртуализацией для оптимизации производительности при большом количестве элементов.  
**Пропсы**:  
- `items` (массив): элементы списка  
- `height` (число): высота списка  
- `itemHeight` (число): высота элемента  
- `renderItem` (функция): функция рендеринга элемента  
- `getItemKey` (функция): функция получения ключа элемента  
- `overscan` (число): количество дополнительно отрисовываемых элементов  
- `className` (строка): дополнительные классы  

**Состояние**:  
- `scrollTop` (число): текущая позиция прокрутки  
- `visibleItems` (массив): видимые элементы  

**Хуки**:
- `useRef` для получения доступа к DOM-элементу списка
- `useEffect` для обработки прокрутки
- `useMemo` для расчета видимых элементов

### LazyGraphVisualization
**Описание**: Ленивая загрузка компонента визуализации графа.  
**Пропсы**: (те же, что и у GraphVisualization)  
**Состояние**:  
- `isVisible` (boolean): виден ли компонент в области просмотра  

**Хуки**:
- `useIntersectionObserver` для определения видимости компонента
- `useMemo` для оптимизации обновлений

## Пользовательские хуки

### useConceptOperations
**Описание**: Хук для работы с операциями над концепциями.  
**Параметры**: нет  
**Возвращает**:  
- `getConcept(id)`: функция получения концепции по ID  
- `createConcept(data)`: функция создания концепции  
- `updateConcept(id, data)`: функция обновления концепции  
- `deleteConcept(id)`: функция удаления концепции  
- `getRelatedConcepts(id)`: функция получения связанных концепций  
- `getRelatedTheses(id)`: функция получения связанных тезисов  
- `isLoading`: индикатор загрузки  
- `error`: ошибка (если есть)  

### useGraphOperations
**Описание**: Хук для работы с графами концепций.  
**Параметры**: нет  
**Возвращает**:  
- `getGraph(id)`: функция получения графа по ID  
- `createGraph(data)`: функция создания графа  
- `updateGraph(id, data)`: функция обновления графа  
- `deleteGraph(id)`: функция удаления графа  
- `addNode(graphId, nodeData)`: функция добавления узла в граф  
- `updateNode(graphId, nodeId, nodeData)`: функция обновления узла  
- `deleteNode(graphId, nodeId)`: функция удаления узла  
- `addEdge(graphId, edgeData)`: функция добавления ребра в граф  
- `updateEdge(graphId, edgeId, edgeData)`: функция обновления ребра  
- `deleteEdge(graphId, edgeId)`: функция удаления ребра  
- `isLoading`: индикатор загрузки  
- `error`: ошибка (если есть)  

### useThesisOperations
**Описание**: Хук для работы с тезисами.  
**Параметры**: нет  
**Возвращает**:  
- `getThesis(id)`: функция получения тезиса по ID  
- `createThesis(data)`: функция создания тезиса  
- `updateThesis(id, data)`: функция обновления тезиса  
- `deleteThesis(id)`: функция удаления тезиса  
- `getRelatedConcepts(id)`: функция получения связанных концепций  
- `linkToConcept(thesisId, conceptId)`: функция связывания с концепцией  
- `unlinkFromConcept(thesisId, conceptId)`: функция удаления связи с концепцией  
- `isLoading`: индикатор загрузки  
- `error`: ошибка (если есть)  

### useSynthesisOperations
**Описание**: Хук для операций синтеза концепций.  
**Параметры**: нет  
**Возвращает**:  
- `synthesizeConcepts(conceptIds, options)`: функция синтеза концепций  
- `getSynthesis(id)`: функция получения результата синтеза по ID  
- `saveSynthesisResult(synthesisId, data)`: функция сохранения результата  
- `getSynthesisHistory()`: функция получения истории синтеза  
- `isProcessing`: индикатор обработки  
- `result`: результат синтеза  
- `error`: ошибка (если есть)  

### useClaudeQuery
**Описание**: Хук для запросов к Claude API.  
**Параметры**: нет  
**Возвращает**:  
- `sendQuery(prompt, options)`: функция отправки запроса  
- `getQueryHistory()`: функция получения истории запросов  
- `getQueryStatus(queryId)`: функция получения статуса запроса  
- `cancelQuery(queryId)`: функция отмены запроса  
- `isProcessing`: индикатор обработки  
- `response`: ответ API  
- `error`: ошибка (если есть)  

## Рекомендации по реализации

1. **Использование TypeScript**:
   - Определить интерфейсы для пропсов компонентов
   - Определить интерфейсы для возвращаемых значений хуков
   - Использовать generics для переиспользуемых компонентов

2. **Мемоизация компонентов**:
   - Использовать React.memo для оптимизации списков
   - Использовать useMemo для вычисления производных данных
   - Использовать useCallback для мемоизации обработчиков событий

3. **Виртуализация**:
   - Использовать виртуализацию для списков с большим количеством элементов
   - Рассмотреть библиотеки react-window или react-virtualized

4. **Стилизация компонентов**:
   - Использовать CSS Modules или styled-components для инкапсуляции стилей
   - Разработать единую систему дизайна для обеспечения согласованности интерфейса

5. **Обработка ошибок**:
   - Использовать ErrorBoundary для обработки ошибок в компонентах
   - Предусмотреть состояния загрузки, успеха и ошибки для всех асинхронных операций

6. **Проверка типов пропсов**:
   - Использовать PropTypes или TypeScript для проверки типов пропсов
   - Указывать defaultProps для опциональных пропсов

7. **Тестирование компонентов**:
   - Писать модульные тесты для всех компонентов
   - Использовать React Testing Library для тестирования компонентов
   - Тестировать различные состояния компонентов
