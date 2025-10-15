# Исправления для графа философских концепций

## 1. Добавление переменных для независимого учёта весов в поиске пути

**Место вставки:** После строки `let respectDirection = true;` (около строки 1620)

```javascript
// Независимые настройки для поиска пути
let useWeightsInPathFinding = true;
let respectDirectionInPathFinding = true;
```

## 2. Добавление стилей для новых элементов

**Место вставки:** В секцию `<style>` перед закрывающим тегом `</style>`

```css
/* Модальное окно выбора анализа */
#selectiveAnalysisModal {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.97);
    padding: 25px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.7);
    max-width: 450px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 2000;
    border: 1px solid rgba(0,0,0,0.2);
}

#selectiveAnalysisModal.show {
    display: block;
}

#selectiveAnalysisModal h3 {
    margin: 0 0 15px 0;
    color: #1a1a2e;
    font-size: 18px;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
}

.analysis-option {
    display: flex;
    align-items: center;
    padding: 8px;
    margin: 5px 0;
    border-radius: 5px;
    transition: background 0.2s;
    cursor: pointer;
}

.analysis-option:hover {
    background: rgba(52, 152, 219, 0.1);
}

.analysis-option input[type="checkbox"] {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.analysis-option label {
    cursor: pointer;
    flex-grow: 1;
    font-size: 12px;
    color: #2d3436;
}

.modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.modal-buttons button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: background 0.3s;
}

.modal-buttons .primary-btn {
    background: #3498db;
    color: white;
}

.modal-buttons .primary-btn:hover {
    background: #2980b9;
}

.modal-buttons .secondary-btn {
    background: #95a5a6;
    color: white;
}

.modal-buttons .secondary-btn:hover {
    background: #7f8c8d;
}

/* Кнопка перехода к узлу */
.goto-node-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    margin-top: 10px;
    transition: background 0.3s;
}

.goto-node-btn:hover {
    background: #229954;
}

/* Секция связей узла */
.connections-section {
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 10px;
    border-left: 3px solid #3498db;
}

.connections-title {
    font-size: 15px;
    font-weight: 700;
    color: #a29bfe;
    margin-bottom: 10px;
}

.connection-item {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    margin: 5px 0;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.connection-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
}

.connection-arrow {
    font-size: 16px;
    margin: 0 10px;
    position: relative;
}

.connection-arrow-tooltip {
    visibility: hidden;
    background-color: rgba(0, 0, 0, 0.9);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 10px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 11px;
}

.connection-arrow:hover .connection-arrow-tooltip {
    visibility: visible;
}

.show-all-concepts-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    margin-top: 8px;
    transition: background 0.3s;
}

.show-all-concepts-btn:hover {
    background: #2980b9;
}

/* Режим одинаковой толщины связей */
.uniform-width-links .link {
    stroke-width: 2px !important;
}
```

## 3. Добавление HTML для модального окна выборочного анализа

**Место вставки:** После `<div id="detailModal">...</div>` (около строки 682)

```html
<!-- Модальное окно выборочного анализа -->
<div id="selectiveAnalysisModal">
    <h3> Выборочный анализ</h3>
    <div id="analysisOptions">
        <div class="analysis-option">
            <input type="checkbox" id="opt-pagerank" checked>
            <label for="opt-pagerank">PageRank</label>
        </div>
        <div class="analysis-option">
            <input type="checkbox" id="opt-betweenness" checked>
            <label for="opt-betweenness">Betweenness Centrality</label>
        </div>
        <div class="analysis-option">
            <input type="checkbox" id="opt-closeness" checked>
            <label for="opt-closeness">Closeness Centrality</label>
        </div>
        <div class="analysis-option">
            <input type="checkbox" id="opt-clustering" checked>
            <label for="opt-clustering">Clustering Coefficient</label>
        </div>
        <div class="analysis-option">
            <input type="checkbox" id="opt-eigenvector" checked>
            <label for="opt-eigenvector">Eigenvector Centrality</label>
        </div>
    </div>
    <div class="modal-buttons">
        <button class="primary-btn" onclick="runSelectiveAnalysis()">Запустить</button>
        <button class="secondary-btn" onclick="closeSelectiveAnalysisModal()">Отмена</button>
    </div>
</div>
```

## 4. Обновление HTML панели статистики

**Замена:** Найти секцию с кнопками запуска анализа и заменить на:

```html
<div class="stats-section">
    <h4>Запуск анализа:</h4>
    <div style="display: flex; flex-direction: column; gap: 5px;">
        <button onclick="runFullAnalysis()" style="width: 100%; background: #3498db; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
             Полный анализ
        </button>
        <button onclick="runQuickAnalysis()" style="width: 100%; background: #27ae60; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
            ⚡ Быстрый анализ
        </button>
        <button onclick="showSelectiveAnalysisModal()" style="width: 100%; background: #9b59b6; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
             Выборочный анализ
        </button>
        <button onclick="clearAllCache()" style="width: 100%; background: #95a5a6; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
             Сбросить кэш
        </button>
    </div>
</div>
```

## 5. Обновление секции режимов фильтрации в легенде

**Замена:** Найти секцию "Режим фильтрации:" и заменить на:

```html
<div class="legend-section">
    <h4>
        <span>Режим фильтрации:</span>
    </h4>
    <div class="legend-item">
        <input type="radio" id="filterAll" name="filterMode" value="all" checked onchange="changeFilterMode('all')">
        <label for="filterAll" style="font-size: 11px;">
            <span>Только выбранные философы</span>
        </label>
    </div>
    <div class="legend-item">
        <input type="radio" id="filterInternal" name="filterMode" value="internal" onchange="changeFilterMode('internal')">
        <label for="filterInternal" style="font-size: 11px;">
            <span>Только внутренние связи</span>
        </label>
    </div>
    <div class="legend-item">
        <input type="radio" id="filterContext" name="filterMode" value="context" onchange="changeFilterMode('context')">
        <label for="filterContext" style="font-size: 11px;">
            <span>С соседними узлами</span>
        </label>
    </div>
    <div class="legend-item">
        <input type="radio" id="filterExternal" name="filterMode" value="external" onchange="changeFilterMode('external')">
        <label for="filterExternal" style="font-size: 11px;">
            <span>Только внешние связи</span>
        </label>
    </div>
    <div style="font-size: 10px; color: #7f8c8d; margin-top: 8px; padding: 8px; background: rgba(108, 92, 231, 0.05); border-radius: 5px; line-height: 1.4;">
        <strong>Режимы:</strong><br>
        • <em>Только выбранные</em> - узлы и связи между ними<br>
        • <em>Только внутренние</em> - связи внутри систем<br>
        • <em>С соседними</em> - включая связанные узлы других философов<br>
        • <em>Только внешние</em> - узлы с внешними связями
    </div>
</div>

<div class="legend-section">
    <h4>
        <span>Отображение связей:</span>
    </h4>
    <div class="legend-item">
        <input type="checkbox" id="uniformLinkWidth" onchange="toggleUniformLinkWidth()">
        <label for="uniformLinkWidth" style="font-size: 11px;">
            <span>Одинаковая толщина связей</span>
        </label>
    </div>
</div>
```

## 6. Обновление панели поиска пути

**Замена:** Найти секцию с чекбоксами в pathFinder и заменить на:

```html
<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dfe6e9;">
    <div style="font-size: 11px; margin-bottom: 8px;">
        <label style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer;">
            <input type="checkbox" id="respectChronology" checked style="margin-right: 8px;">
            <span>Учитывать хронологию</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer;">
            <input type="checkbox" id="respectDirectionPath" checked style="margin-right: 8px;">
            <span>Учитывать направленность связей</span>
        </label>
        <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="useWeightsPath" checked style="margin-right: 8px;">
            <span>Учитывать веса связей</span>
        </label>
    </div>
</div>
```

## 7. Функция показа модального окна выборочного анализа

**Место вставки:** Перед функцией `runQuickAnalysis()` (около строки 2300)

```javascript
// Показать модальное окно выборочного анализа
function showSelectiveAnalysisModal() {
    const modal = document.getElementById('selectiveAnalysisModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Закрыть модальное окно выборочного анализа
function closeSelectiveAnalysisModal() {
    const modal = document.getElementById('selectiveAnalysisModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

// Выборочный анализ
async function runSelectiveAnalysis() {
    const selectedOptions = {
        pagerank: document.getElementById('opt-pagerank').checked,
        betweenness: document.getElementById('opt-betweenness').checked,
        closeness: document.getElementById('opt-closeness').checked,
        clustering: document.getElementById('opt-clustering').checked,
        eigenvector: document.getElementById('opt-eigenvector').checked
    };
    
    // Проверяем, выбран ли хотя бы один метод
    if (!Object.values(selectedOptions).some(v => v)) {
        alert('Выберите хотя бы один метод анализа');
        return;
    }
    
    closeSelectiveAnalysisModal();
    
    try {
        let progress = 0;
        const totalMethods = Object.values(selectedOptions).filter(v => v).length;
        const progressStep = 100 / (totalMethods + 1);
        
        // Общая статистика всегда
        const stats = await calculateGraphStatistics((current, total) => {
            const percent = Math.round((current / total) * progressStep);
            showProgress('Общая статистика...', percent);
        });
        displayGeneralStats(stats);
        progress += progressStep;
        
        // PageRank
        if (selectedOptions.pagerank) {
            showProgress('Расчёт PageRank...', progress);
            await calculatePageRank(20, 0.85, (current, total) => {
                const percent = progress + Math.round((current / total) * progressStep);
                showProgress('Расчёт PageRank...', percent);
            });
            progress += progressStep;
        }
        
        // Eigenvector
        if (selectedOptions.eigenvector) {
            showProgress('Расчёт Eigenvector...', progress);
            await calculateEigenvectorCentrality(100, (current, total) => {
                const percent = progress + Math.round((current / total) * progressStep);
                showProgress('Расчёт Eigenvector...', percent);
            });
            progress += progressStep;
        }
        
        // Betweenness
        if (selectedOptions.betweenness) {
            showProgress('Расчёт Betweenness...', progress);
            await calculateBetweennessAsync((current, total) => {
                const percent = progress + Math.round((current / total) * progressStep);
                showProgress('Расчёt Betweenness...', percent);
            });
            progress += progressStep;
        }
        
        // Closeness
        if (selectedOptions.closeness) {
            showProgress('Расчёт Closeness...', progress);
            await calculateClosenessCentrality((current, total) => {
                const percent = progress + Math.round((current / total) * progressStep);
                showProgress('Расчёт Closeness...', percent);
            });
            progress += progressStep;
        }
        
        // Clustering
        if (selectedOptions.clustering) {
            showProgress('Расчёт Clustering...', progress);
            await new Promise(resolve => setTimeout(resolve, 100));
            calculateClusteringCoefficient();
            progress = 100;
        }
        
        document.getElementById('generalStatsSection').style.display = 'block';
        document.getElementById('metricsSection').style.display = 'block';
        document.getElementById('visualizationSection').style.display = 'block';
        
        // Показываем первый доступный результат
        const firstAvailable = Object.keys(selectedOptions).find(key => selectedOptions[key]);
        if (firstAvailable) {
            switchMetric(firstAvailable);
        }
        
        showProgress('Анализ завершён!', 100);
        setTimeout(hideProgress, 1500);
        
        console.log('Выборочный анализ завершён');
        
    } catch (error) {
        console.error('Ошибка при выборочном анализе:', error);
        hideProgress();
        alert('Произошла ошибка при анализе');
    }
}
```

## 8. Обновленная функция findAndShowPath()

**Замена:** Найти функцию `findAndShowPath()` и заменить её на:

```javascript
function findAndShowPath() {
    const sourceId = document.getElementById('sourceSelect').value;
    const targetId = document.getElementById('targetSelect').value;
    const resultDiv = document.getElementById('pathResult');
    
    const respectChronology = document.getElementById('respectChronology').checked;
    const respectDirectionPath = document.getElementById('respectDirectionPath').checked;
    const useWeightsPath = document.getElementById('useWeightsPath').checked;
    
    if (!sourceId || !targetId) {
        alert('Выберите обе концепции');
        return;
    }
    
    if (sourceId === targetId) {
        alert('Выберите разные концепции');
        return;
    }
    
    // Временно меняем глобальные переменные для поиска пути
    const originalWeights = useWeightedPaths;
    const originalDirection = respectDirection;
    
    useWeightedPaths = useWeightsPath;
    respectDirection = respectDirectionPath;
    
    const path = findShortestPath(sourceId, targetId, respectChronology, respectDirectionPath);
    
    // Восстанавливаем глобальные переменные
    useWeightedPaths = originalWeights;
    respectDirection = originalDirection;
    
    if (!path) {
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        
        let message = 'Эти концепции не связаны';
        if (respectChronology && respectDirectionPath) {
            message += ' хронологически корректным путём с учётом направленности связей.';
        } else if (respectChronology) {
            message += ' хронологически корректным путём.';
        } else if (respectDirectionPath) {
            message += ' с учётом направленности связей.';
        } else {
            message += ' в графе.';
        }
        
        resultDiv.innerHTML = `
            <div class="path-length">❌ Путь не найден</div>
            <div class="path-chain">${message}<br><br>
            <small style="color: #95a5a6;">Попробуйте снять ограничения ниже.</small></div>
            <button onclick="clearPathHighlight()" style="width: 100%; margin-top: 10px; background: #95a5a6; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                Очистить
            </button>
        `;
        resultDiv.classList.add('show');
        resetHighlight();
        return;
    }
    
    // Формируем визуальное представление пути
    const pathNodes = path.map(id => nodes.find(n => n.id === id));
    
    // Создаём HTML с узлами и стрелками
    let pathHTML = '';
    
    for (let i = 0; i < pathNodes.length; i++) {
        const node = pathNodes[i];
        const philosopherColor = philosopherConcepts[node.concept].color;
        
        // Добавляем узел с философом
        pathHTML += `
            <span class="path-node-container">
                <span class="path-philosopher">${node.concept}</span>
                <span class="path-node" style="border-color: ${philosopherColor};" title="${node.concept}: ${node.description}">
                    ${node.label}
                </span>
            </span>
        `;
        
        // Добавляем стрелку, если это не последний узел
        if (i < pathNodes.length - 1) {
            const currentNode = pathNodes[i];
            const nextNode = pathNodes[i + 1];
            
            // Находим связь между текущим и следующим узлом
            const link = links.find(l => {
                const src = l.source.id || l.source;
                const tgt = l.target.id || l.target;
                
                if (respectDirectionPath) {
                    return (src === currentNode.id && tgt === nextNode.id) ||
                           (l.bidirectional && src === nextNode.id && tgt === currentNode.id);
                } else {
                    return (src === currentNode.id && tgt === nextNode.id) ||
                           (src === nextNode.id && tgt === currentNode.id);
                }
            });
            
            if (link) {
                const linkColor = relationTypesObj[link.type].color;
                const linkLabel = relationTypesObj[link.type].label;
                const src = link.source.id || link.source;
                const tgt = link.target.id || link.target;
                
                // Определяем направление стрелки
                let arrow;
                if (link.bidirectional) {
                    arrow = '↔';
                } else if (src === currentNode.id && tgt === nextNode.id) {
                    arrow = '→';
                } else {
                    arrow = '←';
                }
                
                pathHTML += `
                    <span class="path-arrow ${link.bidirectional ? 'bidirectional' : ''}" 
                          style="color: ${linkColor};" 
                          title="${linkLabel}">
                        ${arrow}
                    </span>
                `;
            } else {
                pathHTML += `<span class="path-arrow" style="color: #95a5a6;">→</span>`;
            }
        }
    }
    
    // Добавляем информацию о хронологии
    const years = pathNodes.map(n => philosopherConcepts[n.concept].years);
    const chronologyInfo = respectChronology ? 
        `<div style="margin-top: 8px; font-size: 10px; color: #7f8c8d;">
            Хронология: ${years[0]} → ${years[years.length - 1]}
        </div>` : '';
    
    resultDiv.innerHTML = `
        <div class="path-length">✅ Длина пути: ${path.length} концепций</div>
        <div class="path-chain" style="line-height: 2;">${pathHTML}</div>
        ${chronologyInfo}
        <button onclick="clearPathHighlight()" style="width: 100%; margin-top: 10px; background: #e74c3c; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: background 0.3s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
             Сбросить подсветку
        </button>
    `;
    resultDiv.classList.add('show');
    
    // Подсвечиваем путь на графе
    highlightPath(path, respectDirectionPath);
}
```

## 9. Обновленная функция showMetric()

**Замена:** Найти функцию `showMetric()` и заменить её на:

```javascript
function showMetric(metricName) {
    const contentDiv = document.getElementById('metricContent');
    
    // Показать описание метрики
    let html = showMetricDescription(metricName);
    
    switch(metricName) {
        case 'degree':
            const degree = calculateWeightedDegree();
            html += formatMetricResults(
                degree.slice(0, 10), 
                'totalWeight',
                useWeightedPaths ? 'Взвешенная степень' : 'Степень узла'
            );
            break;
            
        case 'pagerank':
            if (pageRankCache) {
                html += formatMetricResults(
                    pageRankCache.slice(0, 10), 
                    'value',
                    'PageRank',
                    true
                );
            } else {
                html += `
                    <div style="font-size: 11px; color: #95a5a6; padding: 10px; background: rgba(52, 152, 219, 0.05); border-radius: 5px;">
                        Метрика не рассчитана
                    </div>
                    <button onclick="runSingleMetric('pagerank')" style="width: 100%; margin-top: 10px; background: #3498db; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        Рассчитать PageRank
                    </button>
                `;
            }
            break;
            
        case 'betweenness':
            if (betweennessCache) {
                html += formatMetricResults(
                    betweennessCache.slice(0, 10), 
                    'value',
                    'Betweenness',
                    true
                );
            } else {
                html += `
                    <div style="font-size: 11px; color: #95a5a6; padding: 10px; background: rgba(52, 152, 219, 0.05); border-radius: 5px;">
                        Метрика не рассчитана
                    </div>
                    <button onclick="runSingleMetric('betweenness')" style="width: 100%; margin-top: 10px; background: #3498db; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        Рассчитать Betweenness
                    </button>
                `;
            }
            break;
            
        case 'closeness':
            if (closenessCache) {
                html += formatMetricResults(
                    closenessCache.slice(0, 10), 
                    'value',
                    'Closeness',
                    true
                );
            } else {
                html += `
                    <div style="font-size: 11px; color: #95a5a6; padding: 10px; background: rgba(52, 152, 219, 0.05); border-radius: 5px;">
                        Метрика не рассчитана
                    </div>
                    <button onclick="runSingleMetric('closeness')" style="width: 100%; margin-top: 10px; background: #3498db; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        Рассчитать Closeness
                    </button>
                `;
            }
            break;
            
        case 'clustering':
            if (clusteringCache) {
                html += formatMetricResults(
                    clusteringCache.slice(0, 10), 
                    'value',
                    'Коэффициент кластеризации',
                    true
                );
            } else {
                const clustering = calculateClusteringCoefficient();
                html += formatMetricResults(
                    clustering.slice(0, 10), 
                    'value',
                    'Коэффициент кластеризации',
                    true
                );
            }
            break;
            
        case 'eigenvector':
            if (eigenvectorCache) {
                html += formatMetricResults(
                    eigenvectorCache.slice(0, 10), 
                    'value',
                    'Eigenvector Centrality',
                    true
                );
            } else {
                html += `
                    <div style="font-size: 11px; color: #95a5a6; padding: 10px; background: rgba(52, 152, 219, 0.05); border-radius: 5px;">
                        Метрика не рассчитана
                    </div>
                    <button onclick="runSingleMetric('eigenvector')" style="width: 100%; margin-top: 10px; background: #3498db; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        Рассчитать Eigenvector
                    </button>
                `;
            }
            break;
    }
    
    contentDiv.innerHTML = html;
}
```

## 10. Функция расчёта одной метрики

**Место вставки:** После функции `showMetric()` (около строки 2700)

```javascript
// Расчёт одной метрики
async function runSingleMetric(metricName) {
    try {
        showProgress(`Расчёт ${metricName}...`, 0);
        
        switch(metricName) {
            case 'pagerank':
                await calculatePageRank(20, 0.85, (current, total) => {
                    const percent = Math.round((current / total) * 100);
                    showProgress('Расчёт PageRank...', percent);
                });
                break;
                
            case 'betweenness':
                await calculateBetweennessAsync((current, total) => {
                    const percent = Math.round((current / total) * 100);
                    showProgress('Расчёт Betweenness...', percent);
                });
                break;
                
            case 'closeness':
                await calculateClosenessCentrality((current, total) => {
                    const percent = Math.round((current / total) * 100);
                    showProgress('Расчёт Closeness...', percent);
                });
                break;
                
            case 'eigenvector':
                await calculateEigenvectorCentrality(100, (current, total) => {
                    const percent = Math.round((current / total) * 100);
                    showProgress('Расчёт Eigenvector...', percent);
                });
                break;
        }
        
        document.getElementById('generalStatsSection').style.display = 'block';
        document.getElementById('metricsSection').style.display = 'block';
        document.getElementById('visualizationSection').style.display = 'block';
        
        showProgress('Готово!', 100);
        setTimeout(() => {
            hideProgress();
            switchMetric(metricName);
        }, 500);
        
    } catch (error) {
        console.error('Ошибка при расчёте метрики:', error);
        hideProgress();
        alert('Произошла ошибка при расчёте');
    }
}
```

## 11. ИСПРАВЛЕНИЕ: Удалить дублирующую функцию showMetricDescription

**Действие:** Найти вторую (дублирующую) функцию `showMetricDescription` (около строки 2620) и **УДАЛИТЬ ЕЁ ПОЛНОСТЬЮ**. Оставить только первую версию (около строки 2580), которая правильно вызывает функции interpretation и formula.

## 12. Обновленная функция changeFilterMode()

**Замена:** Найти функцию `changeFilterMode()` и заменить на:

```javascript
function changeFilterMode(mode) {
    filterMode = mode;
    applyFilters();
}

// Применение фильтров с взаимосвязанной логикой
function applyFiltersImmediate() {
    const allRelationsSelected = selectedRelations.size === Object.keys(relationTypesObj).length;
    
    if (filterMode === 'all') {
        // Режим 1: Только выбранные философы
        const validLinks = links.filter(l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            return typeSelected && sourcePhilosopherSelected && targetPhilosopherSelected;
        });
        
        const nodesInValidLinks = new Set();
        validLinks.forEach(l => {
            nodesInValidLinks.add(l.source.id || l.source);
            nodesInValidLinks.add(l.target.id || l.target);
        });
        
        node.style("display", d => {
            const philosopherSelected = selectedPhilosophers.has(d.concept);
            const inValidLinks = allRelationsSelected || nodesInValidLinks.has(d.id);
            return (philosopherSelected && inValidLinks) ? null : "none";
        });
        
        link.style("display", l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            const sourceInValidLinks = allRelationsSelected || nodesInValidLinks.has(l.source.id);
            const targetInValidLinks = allRelationsSelected || nodesInValidLinks.has(l.target.id);
            
            return (typeSelected && sourcePhilosopherSelected && targetPhilosopherSelected && 
                    sourceInValidLinks && targetInValidLinks) ? null : "none";
        });
        
    } else if (filterMode === 'internal') {
        // Режим 2: Только внутренние связи
        const validLinks = links.filter(l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            const samePhilosopher = l.source.concept === l.target.concept;
            return typeSelected && sourcePhilosopherSelected && targetPhilosopherSelected && samePhilosopher;
        });
        
        const nodesInValidLinks = new Set();
        validLinks.forEach(l => {
            nodesInValidLinks.add(l.source.id || l.source);
            nodesInValidLinks.add(l.target.id || l.target);
        });
        
        node.style("display", d => {
            const philosopherSelected = selectedPhilosophers.has(d.concept);
            const inValidLinks = allRelationsSelected || nodesInValidLinks.has(d.id);
            return (philosopherSelected && inValidLinks) ? null : "none";
        });
        
        link.style("display", l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            const samePhilosopher = l.source.concept === l.target.concept;
            const sourceInValidLinks = allRelationsSelected || nodesInValidLinks.has(l.source.id);
            const targetInValidLinks = allRelationsSelected || nodesInValidLinks.has(l.target.id);
            
            return (typeSelected && sourcePhilosopherSelected && targetPhilosopherSelected && 
                    samePhilosopher && sourceInValidLinks && targetInValidLinks) ? null : "none";
        });
        
    } else if (filterMode === 'context') {
        // Режим 3: С соседними узлами
        const validLinks = links.filter(l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            return typeSelected && (sourcePhilosopherSelected || targetPhilosopherSelected);
        });
        
        const visibleNodes = new Set();
        validLinks.forEach(l => {
            visibleNodes.add(l.source.id || l.source);
            visibleNodes.add(l.target.id || l.target);
        });
        
        node.style("display", d => {
            return visibleNodes.has(d.id) ? null : "none";
        });
        
        link.style("display", l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            const sourceVisible = visibleNodes.has(l.source.id);
            const targetVisible = visibleNodes.has(l.target.id);
            
            return (typeSelected && (sourcePhilosopherSelected || targetPhilosopherSelected) && 
                    sourceVisible && targetVisible) ? null : "none";
        });
        
    } else if (filterMode === 'external') {
        // Режим 4: Только внешние связи (новый)
        // Показываем только те узлы выбранных философов, которые имеют внешние связи
        const validLinks = links.filter(l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            // Связь валидна, если один конец - выбранный философ, другой - нет
            const isExternal = (sourcePhilosopherSelected && !targetPhilosopherSelected) ||
                              (!sourcePhilosopherSelected && targetPhilosopherSelected);
            return typeSelected && isExternal;
        });
        
        const visibleNodes = new Set();
        validLinks.forEach(l => {
            visibleNodes.add(l.source.id || l.source);
            visibleNodes.add(l.target.id || l.target);
        });
        
        node.style("display", d => {
            return visibleNodes.has(d.id) ? null : "none";
        });
        
        link.style("display", l => {
            const typeSelected = selectedRelations.has(l.type);
            const sourcePhilosopherSelected = selectedPhilosophers.has(l.source.concept);
            const targetPhilosopherSelected = selectedPhilosophers.has(l.target.concept);
            const isExternal = (sourcePhilosopherSelected && !targetPhilosopherSelected) ||
                              (!sourcePhilosopherSelected && targetPhilosopherSelected);
            const sourceVisible = visibleNodes.has(l.source.id);
            const targetVisible = visibleNodes.has(l.target.id);
            
            return (typeSelected && isExternal && sourceVisible && targetVisible) ? null : "none";
        });
    }
    
    // Обновляем статистику
    updateFilterStats();
    
    // Сбрасываем подсветку для скрытых узлов
    const visibleNodeIds = new Set();
    node.each(function(d) {
        if (this.style.display !== "none") {
            visibleNodeIds.add(d.id);
        }
    });
    
    selectedNodes.forEach(node => {
        if (!visibleNodeIds.has(node.id)) {
            selectedNodes.delete(node);
        }
    });

    if (selectedNodes.size === 0) {
        resetHighlight();
    } else {
        highlightConnected(Array.from(selectedNodes));
    }
}
```

## 13. Функция переключения одинаковой толщины связей

**Место вставки:** После функции `applyFiltersImmediate()` (около строки 1890)

```javascript
// Переключение режима одинаковой толщины связей
function toggleUniformLinkWidth() {
    const isUniform = document.getElementById('uniformLinkWidth').checked;
    
    if (isUniform) {
        svg.classed('uniform-width-links', true);
    } else {
        svg.classed('uniform-width-links', false);
    }
}
```

## 14. Обновленная функция showDetailModal()

**Замена:** Найти функцию `showDetailModal()` и заменить на:

```javascript
function showDetailModal(conceptData) {
    const modal = document.getElementById('detailModal');
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    // Получаем рубрики этой концепции
    const conceptRubrics = conceptToRubrics[conceptData.id] || [];
    
    let html = `
        <h2>${conceptData.label}</h2>
        <div class="philosopher-tag" style="background: ${philosopherConcepts[conceptData.concept].color}">
            ${conceptData.concept}
        </div>
        <div class="description">${conceptData.extendedDescription}</div>
        <button class="goto-node-btn" onclick="gotoNodeFromModal('${conceptData.id}')">
             Перейти к узлу
        </button>
    `;
    
    // Секция связей узла
    const nodeConnections = links.filter(l => {
        const src = l.source.id || l.source;
        const tgt = l.target.id || l.target;
        return src === conceptData.id || tgt === conceptData.id;
    });
    
    if (nodeConnections.length > 0) {
        html += `
            <div class="connections-section">
                <div class="connections-title"> Связи узла (${nodeConnections.length})</div>
        `;
        
        nodeConnections.forEach(conn => {
            const src = conn.source.id || conn.source;
            const tgt = conn.target.id || conn.target;
            const isSource = src === conceptData.id;
            const connectedNodeId = isSource ? tgt : src;
            const connectedNode = nodes.find(n => n.id === connectedNodeId);
            
            if (!connectedNode) return;
            
            const linkColor = relationTypesObj[conn.type].color;
            const linkLabel = relationTypesObj[conn.type].label;
            const linkType = conn.type;
            
            // Определяем направление стрелки
            let arrow = '';
            if (conn.bidirectional) {
                arrow = '↔';
            } else if (isSource) {
                arrow = '→';
            } else {
                arrow = '←';
            }
            
            html += `
                <div class="connection-item" onclick="closeDetailModal(); setTimeout(() => showDetailModal(nodes.find(n => n.id === '${connectedNode.id}')), 100);">
                    <div class="concept-color" style="background: ${philosopherConcepts[connectedNode.concept].color}"></div>
                    <div class="connection-arrow" style="color: ${linkColor};">
                        ${arrow}
                        <span class="connection-arrow-tooltip">${linkLabel}</span>
                    </div>
                    <div style="flex-grow: 1;">
                        <div class="concept-name">${connectedNode.label}</div>
                        <div class="concept-philosopher">${connectedNode.concept}</div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // Секция рубрик
    if (conceptRubrics.length > 0) {
        const rubricDataArray = conceptRubrics.map(rubricId => 
            rubrics.find(r => r.id === rubricId)
        ).filter(r => r !== undefined);
        
        rubricDataArray.forEach(rubricData => {
            const relatedConcepts = nodes.filter(n => {
                const nRubrics = conceptToRubrics[n.id] || [];
                return nRubrics.includes(rubricData.id) && n.id !== conceptData.id;
            });
            
            const showAllId = `show-all-${rubricData.id}`;
            const initialDisplay = 10;
            const hasMore = relatedConcepts.length > initialDisplay;
            
            html += `
                <div class="rubric-section">
                    <div class="rubric-title"> Рубрика: ${rubricData.name}</div>
                    <div class="rubric-description">${rubricData.description}</div>
                    
                    ${relatedConcepts.length > 0 ? `
                        <div class="related-concepts">
                            <div class="related-title">Также в этой рубрике (${relatedConcepts.length}):</div>
                            <div id="${showAllId}-container">
                                ${relatedConcepts.slice(0, initialDisplay).map(c => `
                                    <div class="concept-item" onclick="closeDetailModal(); setTimeout(() => showDetailModal(nodes.find(n => n.id === '${c.id}')), 100);">
                                        <div class="concept-color" style="background: ${philosopherConcepts[c.concept].color}"></div>
                                        <div class="concept-name">${c.label}</div>
                                        <div class="concept-philosopher">${c.concept}</div>
                                    </div>
                                `).join('')}
                            </div>
                            ${hasMore ? `
                                <button class="show-all-concepts-btn" id="${showAllId}" onclick="showAllConcepts('${rubricData.id}', '${conceptData.id}')">
                                    Показать все (${relatedConcepts.length})
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        });
    } else {
        html += `<div class="rubric-section">
            <div class="rubric-description" style="color: #95a5a6;">
                Эта концепция пока не отнесена к какой-либо рубрике.
            </div>
        </div>`;
    }
    
    content.innerHTML = html;
    modal.classList.add('show');
    overlay.classList.add('show');
}
```

## 15. Функции для работы с детальным окном

**Место вставки:** После функции `showDetailModal()` (около строки 3450)

```javascript
// Функция перехода к узлу из модального окна
function gotoNodeFromModal(nodeId) {
    closeDetailModal();
    
    setTimeout(() => {
        const nodeData = nodes.find(n => n.id === nodeId);
        if (nodeData) {
            // Выделяем узел
            selectedNodes.clear();
            selectedNodes.add(nodeData);
            highlightConnected([nodeData]);
            
            // Центрируем на узле
            const nodeElement = node.filter(d => d.id === nodeId);
            if (nodeElement.size() > 0) {
                const d = nodeElement.datum();
                const transform = d3.zoomIdentity
                    .translate(width / 2 - d.x, height / 2 - d.y)
                    .scale(1.5);
                svg.transition().duration(750).call(zoom.transform, transform);
            }
        }
    }, 100);
}

// Функция показа всех концепций в рубрике
function showAllConcepts(rubricId, currentConceptId) {
    const rubricData = rubrics.find(r => r.id === rubricId);
    if (!rubricData) return;
    
    const relatedConcepts = nodes.filter(n => {
        const nRubrics = conceptToRubrics[n.id] || [];
        return nRubrics.includes(rubricId) && n.id !== currentConceptId;
    });
    
    const containerId = `show-all-${rubricId}-container`;
    const buttonId = `show-all-${rubricId}`;
    const container = document.getElementById(containerId);
    const button = document.getElementById(buttonId);
    
    if (container && button) {
        // Показываем все концепции
        container.innerHTML = relatedConcepts.map(c => `
            <div class="concept-item" onclick="closeDetailModal(); setTimeout(() => showDetailModal(nodes.find(n => n.id === '${c.id}')), 100);">
                <div class="concept-color" style="background: ${philosopherConcepts[c.concept].color}"></div>
                <div class="concept-name">${c.label}</div>
                <div class="concept-philosopher">${c.concept}</div>
            </div>
        `).join('');
        
        // Скрываем кнопку
        button.style.display = 'none';
    }
}
```

## Инструкции по применению

1. **Откройте исходный HTML-файл** в текстовом редакторе
2. **Найдите и удалите** вторую (дублирующую) функцию `showMetricDescription` (пункт 11)
3. **Примените остальные изменения** в указанных местах:
   - Добавьте новые стили в секцию `<style>`
   - Добавьте HTML для модального окна выборочного анализа
   - Обновите HTML панели статистики, легенды и поиска пути
   - Замените/добавьте JavaScript функции
4. **Сохраните файл** и протестируйте все новые функции

Все исправления совместимы с существующим кодом и не нарушают текущую функциональность.