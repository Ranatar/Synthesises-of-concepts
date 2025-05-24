# Оптимизация производительности и управление техническим долгом

## 1. Анализ производительности

### 1.1 Метрики производительности

#### Core Web Vitals
```typescript
// monitoring/web-vitals.ts
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  initialize() {
    // Largest Contentful Paint - загрузка основного контента
    getLCP(this.recordMetric('LCP'), { reportAllChanges: true });
    
    // First Input Delay - отзывчивость
    getFID(this.recordMetric('FID'));
    
    // Cumulative Layout Shift - визуальная стабильность
    getCLS(this.recordMetric('CLS'), { reportAllChanges: true });
    
    // First Contentful Paint
    getFCP(this.recordMetric('FCP'));
    
    // Time to First Byte
    getTTFB(this.recordMetric('TTFB'));
    
    // Custom метрики
    this.measureCustomMetrics();
  }
  
  private measureCustomMetrics() {
    // Время до интерактивности графа
    performance.mark('graph-interactive');
    
    // Время генерации тезисов
    this.measureAIOperations();
    
    // Время синхронизации данных
    this.measureDataSync();
  }
  
  private recordMetric(name: string) {
    return (metric: any) => {
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(metric.value);
      
      // Отправка метрик
      this.sendToAnalytics(name, metric);
      
      // Алерты при превышении порогов
      this.checkThresholds(name, metric.value);
    };
  }
  
  private checkThresholds(metric: string, value: number) {
    const thresholds = {
      LCP: 2500,    // 2.5s
      FID: 100,     // 100ms
      CLS: 0.1,     // 0.1
      TTFB: 600,    // 600ms
      'graph-render': 1000,  // 1s
      'ai-generation': 30000 // 30s
    };
    
    if (value > thresholds[metric]) {
      this.alertPoorPerformance(metric, value, thresholds[metric]);
    }
  }
}
```

### 1.2 Профилирование backend

#### Профилирование Node.js
```typescript
// profiling/cpu-profiler.ts
import * as v8Profiler from 'v8-profiler-next';
import * as fs from 'fs';
import { performance } from 'perf_hooks';

export class CPUProfiler {
  private profiles: Map<string, any> = new Map();
  
  async profileOperation(name: string, operation: () => Promise<any>) {
    // Начало профилирования
    v8Profiler.startProfiling(name, true);
    
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      // Выполнение операции
      const result = await operation();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      // Остановка профилирования
      const profile = v8Profiler.stopProfiling(name);
      
      // Анализ результатов
      const analysis = {
        name,
        duration: endTime - startTime,
        memory: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          rss: endMemory.rss - startMemory.rss
        },
        profile: profile.export()
      };
      
      // Сохранение для анализа
      this.saveProfile(name, analysis);
      
      // Обнаружение проблем
      this.detectBottlenecks(analysis);
      
      return result;
      
    } finally {
      v8Profiler.deleteAllProfiles();
    }
  }
  
  private detectBottlenecks(analysis: any) {
    const profile = analysis.profile;
    
    // Анализ горячих точек
    const hotNodes = profile.nodes
      .filter(node => node.hitCount > 100)
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10);
    
    if (hotNodes.length > 0) {
      console.warn('Hot spots detected:', hotNodes.map(n => ({
        function: n.functionName,
        file: n.url,
        line: n.lineNumber,
        hits: n.hitCount
      })));
    }
    
    // Memory leaks detection
    if (analysis.memory.heapUsed > 100 * 1024 * 1024) { // 100MB
      console.warn('High memory usage detected:', analysis.memory);
    }
  }
}
```

#### Профилирование базы данных
```typescript
// profiling/db-profiler.ts
export class DatabaseProfiler {
  async profileQuery(query: string, params: any[] = []) {
    const queryId = this.generateQueryId(query);
    
    // PostgreSQL EXPLAIN ANALYZE
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
    
    const result = await this.db.query(explainQuery, params);
    const plan = result.rows[0]['QUERY PLAN'][0];
    
    const analysis = {
      queryId,
      query,
      executionTime: plan['Execution Time'],
      planningTime: plan['Planning Time'],
      totalCost: plan['Total Cost'],
      actualRows: plan['Actual Rows'],
      buffers: plan['Shared Hit Blocks'] + plan['Shared Read Blocks'],
      tempFiles: plan['Temp Written Blocks']
    };
    
    // Обнаружение проблем
    this.detectQueryIssues(analysis);
    
    return analysis;
  }
  
  private detectQueryIssues(analysis: any) {
    const issues = [];
    
    // Медленные запросы
    if (analysis.executionTime > 1000) {
      issues.push({
        type: 'SLOW_QUERY',
        severity: 'high',
        message: `Query takes ${analysis.executionTime}ms`
      });
    }
    
    // Отсутствие индексов
    if (analysis.actualRows > 1000 && analysis.buffers > 10000) {
      issues.push({
        type: 'MISSING_INDEX',
        severity: 'medium',
        message: 'Possible missing index'
      });
    }
    
    // Использование временных файлов
    if (analysis.tempFiles > 0) {
      issues.push({
        type: 'TEMP_FILES',
        severity: 'medium',
        message: 'Query uses temporary files'
      });
    }
    
    if (issues.length > 0) {
      this.reportIssues(analysis.queryId, issues);
    }
  }
}
```

## 2. Оптимизация Frontend

### 2.1 Bundle оптимизация

#### Webpack конфигурация
```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: { ecma: 8 },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true
          },
          mangle: { safari10: true },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        }
      })
    ],
    
    // Code splitting
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: 10
        },
        
        // Отдельный chunk для React
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: 'react',
          priority: 20
        },
        
        // Отдельный chunk для D3/визуализации
        visualization: {
          test: /[\\/]node_modules[\\/](d3|three|konva)[\\/]/,
          name: 'visualization',
          priority: 15
        },
        
        // Common chunks
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    // Module concatenation
    concatenateModules: true,
    
    // Tree shaking
    usedExports: true,
    sideEffects: false
  },
  
  plugins: [
    // Анализ bundle размера
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled'
    }),
    
    // Gzip компрессия
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Brotli компрессия
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
      filename: '[path][base].br'
    })
  ]
};
```

### 2.2 React оптимизация

#### Мемоизация и lazy loading
```typescript
// components/OptimizedConceptEditor.tsx
import React, { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Lazy loading тяжелых компонентов
const GraphCanvas = lazy(() => import('./GraphCanvas'));
const AIPanel = lazy(() => import('./AIPanel'));
const ThesisEditor = lazy(() => import('./ThesisEditor'));

// Мемоизированный компонент категории
const CategoryNode = memo(({ category, onUpdate, onDelete }) => {
  // Мемоизация обработчиков
  const handleUpdate = useCallback((updates) => {
    onUpdate(category.id, updates);
  }, [category.id, onUpdate]);
  
  const handleDelete = useCallback(() => {
    onDelete(category.id);
  }, [category.id, onDelete]);
  
  // Мемоизация вычислений
  const connectionPoints = useMemo(() => 
    calculateConnectionPoints(category.position, category.size),
    [category.position, category.size]
  );
  
  return (
    <div className="category-node" data-id={category.id}>
      {/* Оптимизированный рендеринг */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.position.x === nextProps.category.position.x &&
    prevProps.category.position.y === nextProps.category.position.y &&
    prevProps.category.weight === nextProps.category.weight
  );
});

// Виртуализация больших списков
export const ConceptList = ({ concepts }) => {
  const parentRef = React.useRef();
  
  const virtualizer = useVirtualizer({
    count: concepts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5
  });
  
  return (
    <div ref={parentRef} className="concept-list">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <ConceptCard concept={concepts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Оптимизация ререндеров с помощью контекста
const ConceptContext = React.createContext();
const CategoryContext = React.createContext();

export const OptimizedConceptEditor = () => {
  const [concept, setConcept] = useState(initialConcept);
  
  // Разделение контекстов для минимизации ререндеров
  const conceptValue = useMemo(() => ({
    id: concept.id,
    name: concept.name,
    description: concept.description
  }), [concept.id, concept.name, concept.description]);
  
  const categoryValue = useMemo(() => ({
    categories: concept.categories,
    updateCategory: (id, updates) => {
      setConcept(prev => ({
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === id ? { ...cat, ...updates } : cat
        )
      }));
    }
  }), [concept.categories]);
  
  return (
    <ConceptContext.Provider value={conceptValue}>
      <CategoryContext.Provider value={categoryValue}>
        <div className="concept-editor">
          <Suspense fallback={<GraphCanvasLoader />}>
            <GraphCanvas />
          </Suspense>
          
          <Suspense fallback={<PanelLoader />}>
            <AIPanel />
          </Suspense>
        </div>
      </CategoryContext.Provider>
    </ConceptContext.Provider>
  );
};
```

### 2.3 Оптимизация рендеринга графа

```typescript
// optimization/graph-renderer.ts
import { CanvasRenderer } from './canvas-renderer';
import { WebGLRenderer } from './webgl-renderer';

export class OptimizedGraphRenderer {
  private renderer: CanvasRenderer | WebGLRenderer;
  private renderQueue: Set<string> = new Set();
  private rafId: number | null = null;
  
  constructor(canvas: HTMLCanvasElement, nodeCount: number) {
    // Выбор рендерера в зависимости от размера графа
    if (nodeCount > 100) {
      this.renderer = new WebGLRenderer(canvas);
    } else {
      this.renderer = new CanvasRenderer(canvas);
    }
  }
  
  // Батчинг обновлений
  scheduleUpdate(nodeId: string) {
    this.renderQueue.add(nodeId);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.performUpdate();
      });
    }
  }
  
  private performUpdate() {
    const updates = Array.from(this.renderQueue);
    this.renderQueue.clear();
    this.rafId = null;
    
    // Оптимизированный рендеринг только измененных элементов
    this.renderer.updateNodes(updates);
  }
  
  // Level of Detail (LOD)
  setViewport(zoom: number, center: Point) {
    const lod = this.calculateLOD(zoom);
    
    this.renderer.setLOD(lod);
    this.renderer.setViewport(zoom, center);
  }
  
  private calculateLOD(zoom: number): number {
    if (zoom < 0.5) return 0; // Минимальная детализация
    if (zoom < 1.0) return 1; // Средняя детализация
    return 2; // Полная детализация
  }
}

// WebGL рендерер для больших графов
export class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private shaderProgram: WebGLProgram;
  private buffers: Map<string, WebGLBuffer> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')!;
    this.initializeShaders();
  }
  
  private initializeShaders() {
    const vertexShader = `
      attribute vec2 a_position;
      attribute vec4 a_color;
      uniform mat3 u_matrix;
      varying vec4 v_color;
      
      void main() {
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        gl_Position = vec4(position, 0, 1);
        v_color = a_color;
        gl_PointSize = 10.0;
      }
    `;
    
    const fragmentShader = `
      precision mediump float;
      varying vec4 v_color;
      
      void main() {
        gl_FragColor = v_color;
      }
    `;
    
    this.shaderProgram = this.createShaderProgram(vertexShader, fragmentShader);
  }
  
  updateNodes(nodeIds: string[]) {
    // Оптимизированное обновление через буферы
    nodeIds.forEach(nodeId => {
      const buffer = this.buffers.get(nodeId);
      if (buffer) {
        this.updateNodeBuffer(nodeId, buffer);
      }
    });
    
    this.render();
  }
}
```

## 3. Оптимизация Backend

### 3.1 Кэширование стратегии

```typescript
// caching/multi-layer-cache.ts
export class MultiLayerCache {
  private l1Cache: LRUCache<string, any>; // In-memory
  private l2Cache: RedisCache;            // Redis
  private l3Cache: CDNCache;              // CDN edge
  
  constructor(config: CacheConfig) {
    this.l1Cache = new LRUCache({
      max: config.l1MaxSize || 1000,
      ttl: config.l1TTL || 60 * 1000, // 1 минута
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });
    
    this.l2Cache = new RedisCache(config.redis);
    this.l3Cache = new CDNCache(config.cdn);
  }
  
  async get<T>(key: string, options?: GetOptions): Promise<T | null> {
    // L1: Memory cache
    const l1Result = this.l1Cache.get(key);
    if (l1Result !== undefined) {
      this.metrics.incrementHit('l1');
      return l1Result;
    }
    
    // L2: Redis
    const l2Result = await this.l2Cache.get(key);
    if (l2Result !== null) {
      this.metrics.incrementHit('l2');
      this.l1Cache.set(key, l2Result); // Promote to L1
      return l2Result;
    }
    
    // L3: CDN edge cache
    if (options?.useCDN) {
      const l3Result = await this.l3Cache.get(key);
      if (l3Result !== null) {
        this.metrics.incrementHit('l3');
        // Promote to L1 and L2
        this.l1Cache.set(key, l3Result);
        await this.l2Cache.set(key, l3Result, options.ttl);
        return l3Result;
      }
    }
    
    this.metrics.incrementMiss();
    return null;
  }
  
  // Интеллектуальная инвалидация
  async invalidate(pattern: string): Promise<void> {
    // Использование Pub/Sub для распределенной инвалидации
    await this.publishInvalidation(pattern);
    
    // Локальная инвалидация
    this.invalidateLocal(pattern);
    
    // Redis инвалидация
    await this.l2Cache.invalidatePattern(pattern);
    
    // CDN purge (осторожно с rate limits)
    if (this.shouldPurgeCDN(pattern)) {
      await this.l3Cache.purge(pattern);
    }
  }
  
  // Предзагрузка критичных данных
  async warmup(keys: string[]): Promise<void> {
    const batchSize = 50;
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      const results = await Promise.all(
        batch.map(key => this.loadAndCache(key))
      );
      
      // Небольшая задержка между батчами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Декоратор для автоматического кэширования
export function Cacheable(options: CacheableOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cache = this.cacheService;
      const key = options.keyGenerator 
        ? options.keyGenerator(propertyName, args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Проверка кэша
      const cached = await cache.get(key);
      if (cached !== null && !options.skipCache?.(args)) {
        return cached;
      }
      
      // Выполнение метода
      const result = await originalMethod.apply(this, args);
      
      // Сохранение в кэш
      const ttl = options.ttl || 300; // 5 минут по умолчанию
      await cache.set(key, result, { ttl, tags: options.tags });
      
      return result;
    };
    
    return descriptor;
  };
}
```

### 3.2 Оптимизация запросов к БД

```typescript
// optimization/query-optimizer.ts
export class QueryOptimizer {
  private queryStats: Map<string, QueryStats> = new Map();
  
  // Автоматическое создание индексов
  async analyzeAndOptimize() {
    const slowQueries = await this.getSlowQueries();
    
    for (const query of slowQueries) {
      const suggestions = await this.suggestOptimizations(query);
      
      if (suggestions.missingIndexes.length > 0) {
        await this.createIndexes(suggestions.missingIndexes);
      }
      
      if (suggestions.rewriteSuggestions.length > 0) {
        this.logSuggestions(query, suggestions.rewriteSuggestions);
      }
    }
  }
  
  private async getSlowQueries(): Promise<SlowQuery[]> {
    const result = await this.db.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        max_time
      FROM pg_stat_statements
      WHERE mean_time > 1000 -- более 1 секунды
      ORDER BY mean_time DESC
      LIMIT 20
    `);
    
    return result.rows;
  }
  
  private async suggestOptimizations(query: SlowQuery): Promise<Suggestions> {
    const suggestions: Suggestions = {
      missingIndexes: [],
      rewriteSuggestions: []
    };
    
    // Анализ плана выполнения
    const explainResult = await this.db.query(`EXPLAIN (FORMAT JSON) ${query.query}`);
    const plan = explainResult.rows[0]['QUERY PLAN'][0]['Plan'];
    
    // Поиск Seq Scan на больших таблицах
    this.findSeqScans(plan, suggestions);
    
    // Поиск неэффективных JOIN
    this.findInefficientJoins(plan, suggestions);
    
    // Проверка на N+1 проблемы
    if (this.detectNPlusOne(query)) {
      suggestions.rewriteSuggestions.push({
        type: 'N_PLUS_ONE',
        suggestion: 'Consider using JOIN or batch loading'
      });
    }
    
    return suggestions;
  }
  
  private findSeqScans(plan: any, suggestions: Suggestions) {
    if (plan['Node Type'] === 'Seq Scan' && plan['Actual Rows'] > 1000) {
      const tableName = plan['Relation Name'];
      const filter = plan['Filter'];
      
      if (filter) {
        // Извлечение колонок из фильтра
        const columns = this.extractColumns(filter);
        
        suggestions.missingIndexes.push({
          table: tableName,
          columns: columns,
          type: 'btree'
        });
      }
    }
    
    // Рекурсивный обход плана
    if (plan['Plans']) {
      plan['Plans'].forEach(subPlan => this.findSeqScans(subPlan, suggestions));
    }
  }
}

// Оптимизация N+1 запросов
export class DataLoader<K, V> {
  private batch: Array<{ key: K; resolve: (value: V) => void; reject: (error: any) => void }> = [];
  private batchScheduled = false;
  
  constructor(
    private batchLoadFn: (keys: K[]) => Promise<V[]>,
    private options: DataLoaderOptions = {}
  ) {}
  
  async load(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      this.batch.push({ key, resolve, reject });
      
      if (!this.batchScheduled) {
        this.batchScheduled = true;
        
        process.nextTick(() => {
          this.executeBatch();
        });
      }
    });
  }
  
  private async executeBatch() {
    const batch = this.batch;
    this.batch = [];
    this.batchScheduled = false;
    
    try {
      const keys = batch.map(item => item.key);
      const values = await this.batchLoadFn(keys);
      
      // Раздача результатов
      batch.forEach((item, index) => {
        item.resolve(values[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}
```

### 3.3 Connection pooling оптимизация

```typescript
// optimization/connection-pool.ts
export class OptimizedConnectionPool {
  private pools: Map<string, Pool> = new Map();
  private stats: PoolStats = new PoolStats();
  
  createPool(name: string, config: PoolConfig): Pool {
    const optimizedConfig = this.optimizeConfig(config);
    
    const pool = new Pool({
      ...optimizedConfig,
      
      // Динамическое управление размером пула
      min: this.calculateMinConnections(name),
      max: this.calculateMaxConnections(name),
      
      // Оптимизация времени жизни соединений
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      
      // Statement pooling
      statement_cache_size: 100,
      
      // Переиспользование prepared statements
      prepare_threshold: 5
    });
    
    // Мониторинг пула
    this.monitorPool(name, pool);
    
    this.pools.set(name, pool);
    return pool;
  }
  
  private calculateMinConnections(poolName: string): number {
    const baseMin = 2;
    const trafficMultiplier = this.getTrafficMultiplier();
    
    return Math.floor(baseMin * trafficMultiplier);
  }
  
  private calculateMaxConnections(poolName: string): number {
    const baseMax = 20;
    const cpuCount = os.cpus().length;
    
    // Формула: (cpu_count * 2) + effective_spindle_count
    return Math.min(baseMax, cpuCount * 2 + 1);
  }
  
  private monitorPool(name: string, pool: Pool) {
    pool.on('connect', () => {
      this.stats.incrementConnections(name);
    });
    
    pool.on('acquire', () => {
      this.stats.recordAcquisition(name);
    });
    
    pool.on('release', () => {
      this.stats.recordRelease(name);
    });
    
    pool.on('remove', () => {
      this.stats.decrementConnections(name);
    });
    
    // Периодическая проверка здоровья пула
    setInterval(() => {
      this.checkPoolHealth(name, pool);
    }, 30000);
  }
  
  private async checkPoolHealth(name: string, pool: Pool) {
    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };
    
    // Автоматическое масштабирование
    if (stats.waiting > 0 && stats.idle === 0) {
      // Увеличиваем размер пула
      const newMax = Math.min(pool.options.max + 5, 50);
      pool.options.max = newMax;
      
      this.logger.info(`Increased pool size for ${name} to ${newMax}`);
    }
    
    // Обнаружение утечек соединений
    if (stats.total === stats.idle && this.stats.hasLongRunningQueries(name)) {
      this.logger.warn(`Possible connection leak in pool ${name}`);
    }
  }
}
```

## 4. Управление техническим долгом

### 4.1 Автоматическое обнаружение

```typescript
// tech-debt/debt-analyzer.ts
export class TechDebtAnalyzer {
  async analyzeCodbase(): Promise<TechDebtReport> {
    const report: TechDebtReport = {
      totalDebt: 0,
      categories: {},
      hotspots: [],
      trends: []
    };
    
    // Анализ сложности кода
    await this.analyzeComplexity(report);
    
    // Обнаружение дублирования
    await this.detectDuplication(report);
    
    // Анализ зависимостей
    await this.analyzeDependencies(report);
    
    // Проверка покрытия тестами
    await this.analyzeTestCoverage(report);
    
    // Анализ производительности
    await this.analyzePerformanceIssues(report);
    
    // Расчет технического долга в человеко-часах
    report.totalDebt = this.calculateTotalDebt(report);
    
    return report;
  }
  
  private async analyzeComplexity(report: TechDebtReport) {
    const files = await this.getSourceFiles();
    
    for (const file of files) {
      const ast = this.parseFile(file);
      const complexity = this.calculateCyclomaticComplexity(ast);
      
      if (complexity > 10) {
        report.hotspots.push({
          file,
          type: 'HIGH_COMPLEXITY',
          severity: complexity > 20 ? 'critical' : 'high',
          complexity,
          estimatedHours: Math.floor(complexity / 5)
        });
      }
    }
  }
  
  private async detectDuplication(report: TechDebtReport) {
    const detector = new DuplicationDetector({
      minTokens: 50,
      minLines: 5
    });
    
    const duplicates = await detector.analyze('./src');
    
    duplicates.forEach(dup => {
      report.hotspots.push({
        type: 'DUPLICATION',
        files: dup.files,
        lines: dup.lines,
        severity: dup.lines > 20 ? 'high' : 'medium',
        estimatedHours: Math.ceil(dup.lines / 10)
      });
    });
  }
}

// Автоматический рефакторинг
export class AutoRefactorer {
  async refactorHighComplexityFunctions() {
    const complexFunctions = await this.findComplexFunctions();
    
    for (const func of complexFunctions) {
      // Извлечение методов
      const extractedMethods = this.extractMethods(func);
      
      // Применение паттернов
      const refactored = this.applyPatterns(func, extractedMethods);
      
      // Проверка что тесты все еще проходят
      if (await this.runTests(func.file)) {
        await this.applyRefactoring(func.file, refactored);
      }
    }
  }
  
  private extractMethods(func: ComplexFunction): ExtractedMethod[] {
    const methods: ExtractedMethod[] = [];
    
    // Анализ AST для поиска логических блоков
    const blocks = this.findLogicalBlocks(func.ast);
    
    blocks.forEach(block => {
      if (block.complexity > 5) {
        methods.push({
          name: this.generateMethodName(block),
          body: block.code,
          parameters: this.extractParameters(block)
        });
      }
    });
    
    return methods;
  }
}
```

### 4.2 Метрики и мониторинг долга

```typescript
// tech-debt/debt-metrics.ts
export class TechDebtMetrics {
  private metrics = new Map<string, DebtMetric>();
  
  collectMetrics() {
    // SQALE (Software Quality Assessment based on Lifecycle Expectations)
    this.collectSQALEMetrics();
    
    // Метрики поддерживаемости
    this.collectMaintainabilityIndex();
    
    // Метрики изменений
    this.collectCodeChurn();
    
    // Финансовые метрики
    this.calculateFinancialImpact();
  }
  
  private collectSQALEMetrics() {
    const characteristics = [
      'reliability',
      'security',
      'efficiency',
      'changeability',
      'testability'
    ];
    
    characteristics.forEach(char => {
      const debt = this.calculateCharacteristicDebt(char);
      
      this.metrics.set(`sqale_${char}`, {
        value: debt,
        unit: 'hours',
        trend: this.calculateTrend(char)
      });
    });
  }
  
  private collectMaintainabilityIndex() {
    // MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
    // HV = Halstead Volume, CC = Cyclomatic Complexity, LOC = Lines of Code
    
    const files = this.getSourceFiles();
    let totalMI = 0;
    
    files.forEach(file => {
      const hv = this.calculateHalsteadVolume(file);
      const cc = this.calculateCyclomaticComplexity(file);
      const loc = this.countLinesOfCode(file);
      
      const mi = Math.max(0, 
        171 - 5.2 * Math.log(hv) - 0.23 * cc - 16.2 * Math.log(loc)
      );
      
      totalMI += mi;
    });
    
    const averageMI = totalMI / files.length;
    
    this.metrics.set('maintainability_index', {
      value: averageMI,
      unit: 'index',
      interpretation: this.interpretMI(averageMI)
    });
  }
  
  private calculateFinancialImpact() {
    const hourlyRate = 100; // $/hour
    const totalDebtHours = Array.from(this.metrics.values())
      .filter(m => m.unit === 'hours')
      .reduce((sum, m) => sum + m.value, 0);
    
    const financialImpact = {
      totalCost: totalDebtHours * hourlyRate,
      monthlyInterest: this.calculateMonthlyInterest(totalDebtHours),
      paybackTime: this.estimatePaybackTime(totalDebtHours)
    };
    
    this.metrics.set('financial_impact', {
      value: financialImpact.totalCost,
      unit: 'USD',
      breakdown: financialImpact
    });
  }
}
```

## 5. Performance Budget

### 5.1 Определение бюджетов

```javascript
// performance/budget.js
module.exports = {
  budgets: [
    {
      resourceSizes: [
        {
          resourceType: 'script',
          budget: 300 // 300KB для JS
        },
        {
          resourceType: 'stylesheet',
          budget: 100 // 100KB для CSS
        },
        {
          resourceType: 'image',
          budget: 500 // 500KB для изображений
        },
        {
          resourceType: 'font',
          budget: 100 // 100KB для шрифтов
        },
        {
          resourceType: 'total',
          budget: 1000 // 1MB общий размер
        }
      ],
      
      resourceCounts: [
        {
          resourceType: 'script',
          budget: 10 // Максимум 10 JS файлов
        },
        {
          resourceType: 'stylesheet',
          budget: 5 // Максимум 5 CSS файлов
        }
      ]
    },
    
    {
      timings: [
        {
          metric: 'firstContentfulPaint',
          budget: 1000 // 1 секунда
        },
        {
          metric: 'largestContentfulPaint',
          budget: 2500 // 2.5 секунды
        },
        {
          metric: 'totalBlockingTime',
          budget: 300 // 300ms
        },
        {
          metric: 'cumulativeLayoutShift',
          budget: 0.1
        }
      ]
    }
  ]
};
```

### 5.2 Автоматическая проверка

```typescript
// performance/budget-checker.ts
export class PerformanceBudgetChecker {
  async checkBudget(url: string): Promise<BudgetReport> {
    const lighthouse = await import('lighthouse');
    const chromeLauncher = await import('chrome-launcher');
    
    // Запуск Chrome
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    // Запуск Lighthouse
    const result = await lighthouse.default(url, {
      port: chrome.port,
      budgets: require('./budget.js').budgets
    });
    
    await chrome.kill();
    
    // Анализ результатов
    return this.analyzeResults(result.lhr);
  }
  
  private analyzeResults(lhr: any): BudgetReport {
    const report: BudgetReport = {
      passed: true,
      violations: [],
      warnings: [],
      metrics: {}
    };
    
    // Проверка бюджетов
    lhr.audits['performance-budget'].details.items.forEach(item => {
      if (item.sizeOverBudget > 0) {
        report.passed = false;
        report.violations.push({
          type: item.resourceType,
          overBudget: item.sizeOverBudget,
          actual: item.size,
          budget: item.budget
        });
      }
    });
    
    // Сбор метрик
    report.metrics = {
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      TBT: lhr.audits['total-blocking-time'].numericValue,
      CLS: lhr.audits['cumulative-layout-shift'].numericValue,
      TTI: lhr.audits['interactive'].numericValue
    };
    
    return report;
  }
}
```

## 6. Continuous Performance Monitoring

### 6.1 Real User Monitoring (RUM)

```typescript
// monitoring/rum.ts
export class RealUserMonitoring {
  private buffer: PerformanceEntry[] = [];
  private flushInterval = 5000; // 5 секунд
  
  initialize() {
    // Наблюдение за производительностью
    this.observePerformance();
    
    // Отслеживание ошибок
    this.trackErrors();
    
    // Отслеживание пользовательских взаимодействий
    this.trackInteractions();
    
    // Периодическая отправка данных
    setInterval(() => this.flush(), this.flushInterval);
  }
  
  private observePerformance() {
    // Navigation Timing
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.buffer.push({
          type: entry.entryType,
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
          ...this.enrichWithContext(entry)
        });
      }
    });
    
    observer.observe({ 
      entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] 
    });
    
    // Long Tasks
    if ('PerformanceLongTaskTiming' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.reportLongTask(entry);
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }
  
  private trackInteractions() {
    // First Input Delay
    let firstInputDelay = null;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (!firstInputDelay) {
          firstInputDelay = entry.processingStart - entry.startTime;
          
          this.reportMetric('first-input-delay', firstInputDelay);
        }
        
        // Interaction to Next Paint
        const inp = entry.processingStart - entry.startTime + entry.duration;
        this.reportMetric('interaction-to-next-paint', inp);
      });
    });
    
    observer.observe({ type: 'first-input', buffered: true });
  }
  
  private enrichWithContext(entry: PerformanceEntry) {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        rtt: (navigator as any).connection.rtt,
        downlink: (navigator as any).connection.downlink
      } : null,
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    };
  }
  
  private async flush() {
    if (this.buffer.length === 0) return;
    
    const data = [...this.buffer];
    this.buffer = [];
    
    try {
      await fetch('/api/rum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: data })
      });
    } catch (error) {
      // Возвращаем данные в буфер при ошибке
      this.buffer.unshift(...data);
    }
  }
}
```

Эта документация по оптимизации производительности охватывает:

1. **Анализ производительности** - метрики, профилирование frontend и backend
2. **Оптимизация Frontend** - bundle optimization, React оптимизации, рендеринг графов
3. **Оптимизация Backend** - кэширование, оптимизация запросов, connection pooling
4. **Управление техническим долгом** - автоматическое обнаружение, метрики, рефакторинг
5. **Performance Budget** - определение и проверка бюджетов производительности
6. **Continuous Monitoring** - Real User Monitoring для отслеживания производительности в production

Система оптимизации обеспечивает высокую производительность и поддерживаемость кода.