# Детальная схема данных для локального JSON-хранилища

## Общая структура JSON-хранилища

Локальное JSON-хранилище организовано как структурированный набор данных, включающий все необходимые сущности и их взаимосвязи. Хранилище состоит из нескольких разделов, соответствующих основным доменным областям приложения.

```json
{
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2025-05-13T10:15:30Z",
    "appVersion": "1.0.0"
  },
  "users": {
    // Пользователи системы
  },
  "concepts": {
    // Философские концепции
  },
  "graphs": {
    // Графы концепций
  },
  "theses": {
    // Тезисы
  },
  "claudeInteractions": {
    // История взаимодействий с Claude API
  },
  "synthesis": {
    // История синтеза концепций
  },
  "settings": {
    // Настройки приложения
  },
  "indexes": {
    // Индексы для оптимизации поиска
  }
}
```

## JSON Schema для каждой сущности

### Метаданные хранилища

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Metadata",
  "type": "object",
  "required": ["version", "lastUpdated", "appVersion"],
  "properties": {
    "version": {
      "type": "string",
      "description": "Версия схемы данных"
    },
    "lastUpdated": {
      "type": "string",
      "format": "date-time",
      "description": "Дата и время последнего обновления хранилища"
    },
    "appVersion": {
      "type": "string",
      "description": "Версия приложения"
    },
    "dataCreated": {
      "type": "string",
      "format": "date-time",
      "description": "Дата и время создания хранилища"
    },
    "migrationHistory": {
      "type": "array",
      "description": "История миграций схемы данных",
      "items": {
        "type": "object",
        "required": ["version", "date", "description"],
        "properties": {
          "version": {
            "type": "string",
            "description": "Версия схемы после миграции"
          },
          "date": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время миграции"
          },
          "description": {
            "type": "string",
            "description": "Описание изменений в миграции"
          }
        }
      }
    }
  }
}
```

### Пользователи (users)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Users",
  "type": "object",
  "required": ["byId", "allIds"],
  "properties": {
    "byId": {
      "type": "object",
      "description": "Объект с пользователями по ID",
      "additionalProperties": {
        "type": "object",
        "required": ["id", "name", "created"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Уникальный идентификатор пользователя"
          },
          "name": {
            "type": "string",
            "description": "Имя пользователя"
          },
          "email": {
            "type": "string",
            "format": "email",
            "description": "Электронная почта пользователя"
          },
          "avatar": {
            "type": "string",
            "format": "uri",
            "description": "URL аватара пользователя"
          },
          "created": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время создания пользователя"
          },
          "lastActive": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время последней активности пользователя"
          },
          "preferences": {
            "type": "object",
            "description": "Предпочтения пользователя",
            "properties": {
              "theme": {
                "type": "string",
                "enum": ["light", "dark", "system"],
                "default": "system",
                "description": "Предпочитаемая тема оформления"
              },
              "language": {
                "type": "string",
                "enum": ["ru", "en"],
                "default": "ru",
                "description": "Предпочитаемый язык интерфейса"
              },
              "fontSize": {
                "type": "string",
                "enum": ["small", "medium", "large"],
                "default": "medium",
                "description": "Предпочитаемый размер шрифта"
              }
            }
          },
          "conceptIds": {
            "type": "array",
            "description": "ID концепций, созданных пользователем",
            "items": {
              "type": "string"
            }
          },
          "graphIds": {
            "type": "array",
            "description": "ID графов, созданных пользователем",
            "items": {
              "type": "string"
            }
          },
          "thesisIds": {
            "type": "array",
            "description": "ID тезисов, созданных пользователем",
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "allIds": {
      "type": "array",
      "description": "Массив всех ID пользователей",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Концепции (concepts)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Concepts",
  "type": "object",
  "required": ["byId", "allIds"],
  "properties": {
    "byId": {
      "type": "object",
      "description": "Объект с концепциями по ID",
      "additionalProperties": {
        "type": "object",
        "required": ["id", "name", "description", "created", "updated"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Уникальный идентификатор концепции"
          },
          "name": {
            "type": "string",
            "description": "Название концепции",
            "minLength": 1,
            "maxLength": 100
          },
          "description": {
            "type": "string",
            "description": "Описание концепции",
            "minLength": 1
          },
          "created": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время создания концепции"
          },
          "updated": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время последнего обновления концепции"
          },
          "author": {
            "type": "string",
            "description": "ID автора концепции"
          },
          "tags": {
            "type": "array",
            "description": "Теги концепции",
            "items": {
              "type": "string"
            }
          },
          "relatedThesesIds": {
            "type": "array",
            "description": "ID связанных тезисов",
            "items": {
              "type": "string"
            }
          },
          "relatedConceptIds": {
            "type": "array",
            "description": "ID связанных концепций",
            "items": {
              "type": "string"
            }
          },
          "synthesisMetadata": {
            "type": "object",
            "description": "Метаданные для синтеза концепций",
            "properties": {
              "certainty": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Степень уверенности в концепции (0-1)"
              },
              "centrality": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Степень централизации концепции в философской системе (0-1)"
              },
              "tradition": {
                "type": "string",
                "description": "Философская традиция"
              },
              "position": {
                "type": "object",
                "description": "Позиция концепции в смысловом пространстве",
                "properties": {
                  "x": {
                    "type": "number",
                    "description": "X-координата"
                  },
                  "y": {
                    "type": "number",
                    "description": "Y-координата"
                  }
                }
              }
            }
          },
          "sourceType": {
            "type": "string",
            "enum": ["user", "claude", "synthesis"],
            "description": "Источник создания концепции"
          },
          "claudeQueryId": {
            "type": "string",
            "description": "ID запроса к Claude, если концепция создана из ответа Claude"
          },
          "synthesisId": {
            "type": "string",
            "description": "ID синтеза, если концепция создана из результата синтеза"
          },
          "version": {
            "type": "integer",
            "minimum": 1,
            "description": "Версия концепции для отслеживания изменений"
          },
          "history": {
            "type": "array",
            "description": "История изменений концепции",
            "items": {
              "type": "object",
              "required": ["version", "date", "changes"],
              "properties": {
                "version": {
                  "type": "integer",
                  "minimum": 1,
                  "description": "Номер версии"
                },
                "date": {
                  "type": "string",
                  "format": "date-time",
                  "description": "Дата и время изменения"
                },
                "author": {
                  "type": "string",
                  "description": "ID автора изменения"
                },
                "changes": {
                  "type": "object",
                  "description": "Внесенные изменения"
                }
              }
            }
          }
        }
      }
    },
    "allIds": {
      "type": "array",
      "description": "Массив всех ID концепций",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Графы концепций (graphs)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Graphs",
  "type": "object",
  "required": ["byId", "allIds"],
  "properties": {
    "byId": {
      "type": "object",
      "description": "Объект с графами по ID",
      "additionalProperties": {
        "type": "object",
        "required": ["id", "name", "created", "updated", "categories", "relationships"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Уникальный идентификатор графа"
          },
          "name": {
            "type": "string",
            "description": "Название графа",
            "minLength": 1,
            "maxLength": 100
          },
          "description": {
            "type": "string",
            "description": "Описание графа"
          },
          "created": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время создания графа"
          },
          "updated": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время последнего обновления графа"
          },
          "author": {
            "type": "string",
            "description": "ID автора графа"
          },
          "tags": {
            "type": "array",
            "description": "Теги графа",
            "items": {
              "type": "string"
            }
          },
          "categories": {
            "type": "object",
            "description": "Объект с категориями (узлами) графа по ID",
            "additionalProperties": {
              "type": "object",
              "required": ["id", "name"],
              "properties": {
                "id": {
                  "type": "string",
                  "description": "Уникальный идентификатор категории"
                },
                "name": {
                  "type": "string",
                  "description": "Название категории",
                  "minLength": 1,
                  "maxLength": 100
                },
                "description": {
                  "type": "string",
                  "description": "Описание категории"
                },
                "position": {
                  "type": "object",
                  "description": "Позиция узла на графе",
                  "required": ["x", "y"],
                  "properties": {
                    "x": {
                      "type": "number",
                      "description": "X-координата"
                    },
                    "y": {
                      "type": "number",
                      "description": "Y-координата"
                    }
                  }
                },
                "color": {
                  "type": "string",
                  "description": "Цвет узла в формате HEX",
                  "pattern": "^#[0-9A-Fa-f]{6}$"
                },
                "size": {
                  "type": "number",
                  "minimum": 1,
                  "description": "Размер узла"
                },
                "metadata": {
                  "type": "object",
                  "description": "Метаданные категории",
                  "properties": {
                    "centrality": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 1,
                      "description": "Степень централизации категории в графе (0-1)"
                    },
                    "certainty": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 1,
                      "description": "Степень уверенности в категории (0-1)"
                    },
                    "tradition": {
                      "type": "string",
                      "description": "Философская традиция категории"
                    },
                    "era": {
                      "type": "string",
                      "description": "Историческая эпоха"
                    }
                  }
                },
                "associatedConceptIds": {
                  "type": "array",
                  "description": "ID связанных концепций",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "relationships": {
            "type": "object",
            "description": "Объект со связями (рёбрами) графа по ID",
            "additionalProperties": {
              "type": "object",
              "required": ["id", "sourceId", "targetId"],
              "properties": {
                "id": {
                  "type": "string",
                  "description": "Уникальный идентификатор связи"
                },
                "sourceId": {
                  "type": "string",
                  "description": "ID исходной категории"
                },
                "targetId": {
                  "type": "string",
                  "description": "ID целевой категории"
                },
                "type": {
                  "type": "string",
                  "description": "Тип связи",
                  "enum": ["similarity", "opposition", "causality", "inclusion", "influence", "other"]
                },
                "direction": {
                  "type": "string",
                  "enum": ["one-way", "two-way"],
                  "default": "one-way",
                  "description": "Направление связи"
                },
                "strength": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1,
                  "description": "Сила связи (0-1)"
                },
                "description": {
                  "type": "string",
                  "description": "Описание связи"
                },
                "color": {
                  "type": "string",
                  "description": "Цвет связи в формате HEX",
                  "pattern": "^#[0-9A-Fa-f]{6}$"
                },
                "width": {
                  "type": "number",
                  "minimum": 1,
                  "description": "Толщина линии связи"
                }
              }
            }
          },
          "visualSettings": {
            "type": "object",
            "description": "Настройки визуализации графа",
            "properties": {
              "layout": {
                "type": "string",
                "enum": ["force", "radial", "hierarchical", "grid"],
                "default": "force",
                "description": "Тип макета графа"
              },
              "theme": {
                "type": "string",
                "enum": ["light", "dark", "colorful"],
                "default": "light",
                "description": "Тема оформления графа"
              },
              "nodeSizeBy": {
                "type": "string",
                "enum": ["fixed", "centrality", "degree", "custom"],
                "default": "fixed",
                "description": "Способ определения размера узлов"
              },
              "edgeWidthBy": {
                "type": "string",
                "enum": ["fixed", "strength", "custom"],
                "default": "fixed",
                "description": "Способ определения толщины связей"
              },
              "zoom": {
                "type": "number",
                "minimum": 0.1,
                "maximum": 5,
                "default": 1,
                "description": "Масштаб отображения графа"
              },
              "pan": {
                "type": "object",
                "description": "Смещение графа",
                "properties": {
                  "x": {
                    "type": "number",
                    "default": 0,
                    "description": "Смещение по оси X"
                  },
                  "y": {
                    "type": "number",
                    "default": 0,
                    "description": "Смещение по оси Y"
                  }
                }
              }
            }
          },
          "version": {
            "type": "integer",
            "minimum": 1,
            "description": "Версия графа для отслеживания изменений"
          }
        }
      }
    },
    "allIds": {
      "type": "array",
      "description": "Массив всех ID графов",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Тезисы (theses)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Theses",
  "type": "object",
  "required": ["byId", "allIds"],
  "properties": {
    "byId": {
      "type": "object",
      "description": "Объект с тезисами по ID",
      "additionalProperties": {
        "type": "object",
        "required": ["id", "content", "created", "updated"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Уникальный идентификатор тезиса"
          },
          "content": {
            "type": "string",
            "description": "Содержание тезиса",
            "minLength": 1
          },
          "type": {
            "type": "string",
            "enum": ["principle", "argument", "definition", "example", "question", "critique", "other"],
            "description": "Тип тезиса"
          },
          "created": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время создания тезиса"
          },
          "updated": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время последнего обновления тезиса"
          },
          "author": {
            "type": "string",
            "description": "ID автора тезиса"
          },
          "tags": {
            "type": "array",
            "description": "Теги тезиса",
            "items": {
              "type": "string"
            }
          },
          "relatedConceptIds": {
            "type": "array",
            "description": "ID связанных концепций",
            "items": {
              "type": "string"
            }
          },
          "generationMetadata": {
            "type": "object",
            "description": "Метаданные генерации тезиса",
            "properties": {
              "source": {
                "type": "string",
                "enum": ["user", "claude", "synthesis"],
                "description": "Источник тезиса"
              },
              "prompt": {
                "type": "string",
                "description": "Запрос, использованный для генерации тезиса"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time",
                "description": "Дата и время генерации"
              },
              "claudeQueryId": {
                "type": "string",
                "description": "ID запроса к Claude, если тезис создан из ответа Claude"
              },
              "synthesisId": {
                "type": "string",
                "description": "ID синтеза, если тезис создан из результата синтеза"
              }
            }
          },
          "style": {
            "type": "object",
            "description": "Стиль и формат тезиса",
            "properties": {
              "format": {
                "type": "string",
                "enum": ["plain", "markdown", "html"],
                "default": "plain",
                "description": "Формат содержимого тезиса"
              },
              "length": {
                "type": "string",
                "enum": ["short", "medium", "long"],
                "default": "medium",
                "description": "Длина тезиса"
              },
              "tone": {
                "type": "string",
                "enum": ["neutral", "academic", "casual", "questioning"],
                "default": "neutral",
                "description": "Тон тезиса"
              }
            }
          },
          "version": {
            "type": "integer",
            "minimum": 1,
            "description": "Версия тезиса для отслеживания изменений"
          }
        }
      }
    },
    "allIds": {
      "type": "array",
      "description": "Массив всех ID тезисов",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Взаимодействия с Claude (claudeInteractions)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ClaudeInteractions",
  "type": "object",
  "required": ["byId", "allIds"],
  "properties": {
    "byId": {
      "type": "object",
      "description": "Объект с запросами к Claude API по ID",
      "additionalProperties": {
        "type": "object",
        "required": ["id", "prompt", "timestamp", "status"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Уникальный идентификатор запроса"
          },
          "prompt": {
            "type": "string",
            "description": "Текст запроса к Claude API",
            "minLength": 1
          },
          "parameters": {
            "type": "object",
            "description": "Параметры запроса",
            "properties": {
              "temperature": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "default": 0.7,
                "description": "Температура генерации (степень случайности)"
              },
              "maxTokens": {
                "type": "integer",
                "minimum": 1,
                "maximum": 10000,
                "default": 1000,
                "description": "Максимальное количество токенов в ответе"
              },
              "model": {
                "type": "string",
                "enum": ["claude-3", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
                "default": "claude-3",
                "description": "Модель Claude для запроса"
              }
            }
          },
          "response": {
            "type": "object",
            "description": "Ответ от Claude API",
            "properties": {
              "content": {
                "type": "string",
                "description": "Текст ответа"
              },
              "usage": {
                "type": "object",
                "description": "Статистика использования токенов",
                "properties": {
                  "promptTokens": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Количество токенов в запросе"
                  },
                  "completionTokens": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Количество токенов в ответе"
                  },
                  "totalTokens": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Общее количество токенов"
                  }
                }
              }
            }
          },
          "timestamp": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время запроса"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "processing", "completed", "failed"],
            "description": "Статус запроса"
          },
          "error": {
            "type": ["string", "null"],
            "description": "Сообщение об ошибке (если есть)"
          },
          "author": {
            "type": "string",
            "description": "ID автора запроса"
          },
          "linkedEntities": {
            "type": "object",
            "description": "Связь с созданными сущностями",
            "properties": {
              "conceptIds": {
                "type": "array",
                "description": "ID созданных концепций",
                "items": {
                  "type": "string"
                }
              },
              "thesisIds": {
                "type": "array",
                "description": "ID созданных тезисов",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "taskId": {
            "type": ["string", "null"],
            "description": "ID задачи в очереди (для асинхронных запросов)"
          }
        }
      }
    },
    "allIds": {
      "type": "array",
      "description": "Массив всех ID запросов к Claude API",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Синтез концепций (synthesis)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Synthesis",
  "type": "object",
  "required": ["byId", "allIds"],
  "properties": {
    "byId": {
      "type": "object",
      "description": "Объект с результатами синтеза по ID",
      "additionalProperties": {
        "type": "object",
        "required": ["id", "name", "sourceConceptIds", "created", "status"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Уникальный идентификатор синтеза"
          },
          "name": {
            "type": "string",
            "description": "Название синтеза",
            "minLength": 1,
            "maxLength": 100
          },
          "sourceConceptIds": {
            "type": "array",
            "description": "ID исходных концепций",
            "minItems": 2,
            "items": {
              "type": "string"
            }
          },
          "resultConceptId": {
            "type": ["string", "null"],
            "description": "ID результирующей концепции (если сохранена)"
          },
          "parameters": {
            "type": "object",
            "description": "Параметры синтеза",
            "properties": {
              "method": {
                "type": "string",
                "enum": ["dialectical", "integrative", "comparative"],
                "default": "dialectical",
                "description": "Метод синтеза"
              },
              "focus": {
                "type": "string",
                "enum": ["principles", "applications", "history"],
                "default": "principles",
                "description": "Фокус синтеза"
              },
              "depth": {
                "type": "string",
                "enum": ["basic", "standard", "deep"],
                "default": "standard",
                "description": "Глубина анализа"
              }
            }
          },
          "result": {
            "type": "object",
            "description": "Результаты синтеза",
            "properties": {
              "content": {
                "type": "string",
                "description": "Основное содержание синтеза"
              },
              "analysis": {
                "type": "object",
                "description": "Анализ в рамках синтеза",
                "properties": {
                  "commonalities": {
                    "type": "array",
                    "description": "Общие черты",
                    "items": {
                      "type": "string"
                    }
                  },
                  "differences": {
                    "type": "array",
                    "description": "Различия",
                    "items": {
                      "type": "string"
                    }
                  },
                  "tensions": {
                    "type": "array",
                    "description": "Напряжения и противоречия",
                    "items": {
                      "type": "string"
                    }
                  },
                  "resolution": {
                    "type": "string",
                    "description": "Разрешение противоречий"
                  }
                }
              }
            }
          },
          "created": {
            "type": "string",
            "format": "date-time",
            "description": "Дата и время создания синтеза"
          },
          "author": {
            "type": "string",
            "description": "ID автора синтеза"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "processing", "completed", "failed"],
            "description": "Статус синтеза"
          },
          "claudeQueryId": {
            "type": ["string", "null"],
            "description": "ID запроса к Claude API, использованного для синтеза"
          },
          "taskId": {
            "type": ["string", "null"],
            "description": "ID задачи в очереди (для асинхронных операций)"
          },
          "error": {
            "type": ["string", "null"],
            "description": "Сообщение об ошибке (если есть)"
          }
        }
      }
    },
    "allIds": {
      "type": "array",
      "description": "Массив всех ID синтеза",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Настройки приложения (settings)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Settings",
  "type": "object",
  "required": ["app", "user", "claude"],
  "properties": {
    "app": {
      "type": "object",
      "description": "Общие настройки приложения",
      "properties": {
        "theme": {
          "type": "string",
          "enum": ["light", "dark", "system"],
          "default": "system",
          "description": "Тема оформления"
        },
        "language": {
          "type": "string",
          "enum": ["ru", "en"],
          "default": "ru",
          "description": "Язык интерфейса"
        },
        "fontSize": {
          "type": "string",
          "enum": ["small", "medium", "large"],
          "default": "medium",
          "description": "Размер шрифта"
        },
        "sidebar": {
          "type": "object",
          "description": "Настройки боковой панели",
          "properties": {
            "expanded": {
              "type": "boolean",
              "default": true,
              "description": "Развернута ли боковая панель"
            },
            "width": {
              "type": "integer",
              "minimum": 200,
              "maximum": 500,
              "default": 250,
              "description": "Ширина боковой панели в пикселях"
            }
          }
        },
        "dataAutoSave": {
          "type": "boolean",
          "default": true,
          "description": "Автоматически сохранять изменения в хранилище"
        },
        "autoSaveInterval": {
          "type": "integer",
          "minimum": 30,
          "maximum": 3600,
          "default": 300,
          "description": "Интервал автосохранения в секундах"
        }
      }
    },
    "user": {
      "type": "object",
      "description": "Настройки пользователя",
      "properties": {
        "currentUserId": {
          "type": ["string", "null"],
          "description": "ID текущего пользователя"
        },
        "lastActive": {
          "type": ["string", "null"],
          "format": "date-time",
          "description": "Время последней активности"
        },
        "recentItems": {
          "type": "object",
          "description": "Недавно открытые элементы",
          "properties": {
            "concepts": {
              "type": "array",
              "description": "ID недавно открытых концепций",
              "maxItems": 10,
              "items": {
                "type": "string"
              }
            },
            "graphs": {
              "type": "array",
              "description": "ID недавно открытых графов",
              "maxItems": 10,
              "items": {
                "type": "string"
              }
            },
            "theses": {
              "type": "array",
              "description": "ID недавно открытых тезисов",
              "maxItems": 10,
              "items": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "claude": {
      "type": "object",
      "description": "Настройки для взаимодействия с Claude API",
      "properties": {
        "defaultParameters": {
          "type": "object",
          "description": "Параметры запросов по умолчанию",
          "properties": {
            "temperature": {
              "type": "number",
              "minimum": 0,
              "maximum": 1,
              "default": 0.7,
              "description": "Температура генерации по умолчанию"
            },
            "maxTokens": {
              "type": "integer",
              "minimum": 1,
              "maximum": 10000,
              "default": 1000,
              "description": "Максимальное количество токенов по умолчанию"
            },
            "model": {
              "type": "string",
              "enum": ["claude-3", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
              "default": "claude-3",
              "description": "Модель Claude по умолчанию"
            }
          }
        },
        "useQueue": {
          "type": "boolean",
          "default": true,
          "description": "Использовать очередь для асинхронных запросов"
        },
        "maxConcurrentRequests": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10,
          "default": 1,
          "description": "Максимальное количество одновременных запросов"
        }
      }
    }
  }
}
```

### Индексы (indexes)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Indexes",
  "type": "object",
  "description": "Индексы для оптимизации поиска",
  "properties": {
    "concepts": {
      "type": "object",
      "description": "Индексы для концепций",
      "properties": {
        "byTag": {
          "type": "object",
          "description": "Индекс концепций по тегам",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "byAuthor": {
          "type": "object",
          "description": "Индекс концепций по авторам",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "byDateCreated": {
          "type": "array",
          "description": "Индекс концепций по дате создания",
          "items": {
            "type": "object",
            "required": ["id", "date"],
            "properties": {
              "id": {
                "type": "string",
                "description": "ID концепции"
              },
              "date": {
                "type": "string",
                "format": "date-time",
                "description": "Дата создания"
              }
            }
          }
        }
      }
    },
    "theses": {
      "type": "object",
      "description": "Индексы для тезисов",
      "properties": {
        "byConceptId": {
          "type": "object",
          "description": "Индекс тезисов по ID концепций",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "byType": {
          "type": "object",
          "description": "Индекс тезисов по типу",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "fullText": {
      "type": "object",
      "description": "Индекс полнотекстового поиска",
      "properties": {
        "concepts": {
          "type": "object",
          "description": "Индекс для полнотекстового поиска по концепциям",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "theses": {
          "type": "object",
          "description": "Индекс для полнотекстового поиска по тезисам",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```

## Примеры данных для основных сущностей

### Пример концепции

```json
{
  "id": "concept-1",
  "name": "Категорический императив",
  "description": "Фундаментальный принцип этики Канта, согласно которому необходимо действовать только согласно такой максиме, руководствуясь которой можно одновременно желать, чтобы она стала всеобщим законом.",
  "created": "2025-04-15T10:30:00Z",
  "updated": "2025-04-16T14:20:00Z",
  "author": "user-1",
  "tags": ["ethics", "Kant", "deontology", "philosophy"],
  "relatedThesesIds": ["thesis-1", "thesis-2"],
  "relatedConceptIds": ["concept-2", "concept-3"],
  "synthesisMetadata": {
    "certainty": 0.85,
    "centrality": 0.75,
    "tradition": "German idealism",
    "position": {
      "x": 0.3,
      "y": 0.7
    }
  },
  "sourceType": "user",
  "claudeQueryId": null,
  "synthesisId": null,
  "version": 1,
  "history": [
    {
      "version": 1,
      "date": "2025-04-15T10:30:00Z",
      "author": "user-1",
      "changes": {
        "name": "Категорический императив",
        "description": "Фундаментальный принцип этики Канта, согласно которому необходимо действовать только согласно такой максиме, руководствуясь которой можно одновременно желать, чтобы она стала всеобщим законом."
      }
    }
  ]
}
```

### Пример графа концепций

```json
{
  "id": "graph-1",
  "name": "Основные этические концепции",
  "description": "Граф взаимосвязей основных этических концепций и их отношений",
  "created": "2025-04-17T09:15:00Z",
  "updated": "2025-04-18T11:25:00Z",
  "author": "user-1",
  "tags": ["ethics", "philosophy", "mapping"],
  "categories": {
    "category-1": {
      "id": "category-1",
      "name": "Деонтология",
      "description": "Этическая теория, оценивающая действия по их соответствию правилам и долгу",
      "position": {
        "x": 100,
        "y": 150
      },
      "color": "#FF5733",
      "size": 50,
      "metadata": {
        "centrality": 0.85,
        "certainty": 0.9,
        "tradition": "German idealism",
        "era": "18th century"
      },
      "associatedConceptIds": ["concept-1", "concept-2"]
    },
    "category-2": {
      "id": "category-2",
      "name": "Утилитаризм",
      "description": "Этическая теория, оценивающая действия по их последствиям и пользе",
      "position": {
        "x": 300,
        "y": 150
      },
      "color": "#33FF57",
      "size": 50,
      "metadata": {
        "centrality": 0.8,
        "certainty": 0.9,
        "tradition": "British empiricism",
        "era": "19th century"
      },
      "associatedConceptIds": ["concept-3", "concept-4"]
    }
  },
  "relationships": {
    "rel-1": {
      "id": "rel-1",
      "sourceId": "category-1",
      "targetId": "category-2",
      "type": "opposition",
      "direction": "two-way",
      "strength": 0.75,
      "description": "Противопоставление по принципу оценки действий: правила vs. последствия",
      "color": "#3357FF",
      "width": 2
    }
  },
  "visualSettings": {
    "layout": "force",
    "theme": "light",
    "nodeSizeBy": "centrality",
    "edgeWidthBy": "strength",
    "zoom": 1,
    "pan": {
      "x": 0,
      "y": 0
    }
  },
  "version": 1
}
```

### Пример тезиса

```json
{
  "id": "thesis-1",
  "content": "Категорический императив предписывает действовать так, чтобы максима твоей воли могла бы стать принципом всеобщего законодательства.",
  "type": "principle",
  "created": "2025-04-15T14:30:00Z",
  "updated": "2025-04-16T10:20:00Z",
  "author": "user-1",
  "tags": ["ethics", "Kant", "deontology"],
  "relatedConceptIds": ["concept-1"],
  "generationMetadata": {
    "source": "claude",
    "prompt": "Сформулируйте основной принцип категорического императива Канта",
    "timestamp": "2025-04-15T14:25:00Z",
    "claudeQueryId": "query-1",
    "synthesisId": null
  },
  "style": {
    "format": "plain",
    "length": "medium",
    "tone": "academic"
  },
  "version": 1
}
```

## Оптимизация хранения и доступа к данным

### Стратегии индексирования

Для оптимизации поиска и доступа к данным используются следующие индексы:

1. **Индексы по тегам** - для быстрого поиска концепций и тезисов по тегам
2. **Индексы по автору** - для быстрого доступа к сущностям, созданным конкретным пользователем
3. **Индексы по дате создания** - для сортировки и фильтрации по времени создания
4. **Индексы связей** - для быстрого доступа к связанным сущностям
5. **Полнотекстовые индексы** - для поиска по содержимому

### Нормализация данных

Данные нормализованы для минимизации дублирования и обеспечения целостности:

1. **Организация по ID** - все сущности хранятся в объекте, где ключ - это ID
2. **Массивы allIds** - для поддержания порядка и итерации по сущностям
3. **Связи через ID** - вместо вложенных объектов используются ссылки по ID
4. **Индексы для многие-ко-многим** - для эффективной работы со связями

### Стратегии обновления

Для обеспечения целостности данных при обновлениях используются следующие подходы:

1. **Версионирование** - каждая сущность имеет номер версии для отслеживания изменений
2. **История изменений** - для важных сущностей ведется история изменений
3. **Атомарные обновления** - все связанные изменения выполняются как одна транзакция
4. **Проверка целостности** - после обновления проверяется целостность связей

## Миграция данных и обратная совместимость

Для обеспечения возможности обновления схемы данных без потери информации предусмотрены:

1. **Версионирование схемы** - хранение версии схемы в метаданных
2. **История миграций** - отслеживание выполненных миграций
3. **Стратегии миграции** - определены правила преобразования данных при обновлении схемы
4. **Резервное копирование** - автоматическое создание резервной копии перед миграцией

Миграции осуществляются следующим образом:

1. Проверка текущей версии схемы в метаданных хранилища
2. Определение необходимых миграций для перехода к новой версии
3. Создание резервной копии данных
4. Последовательное применение миграций
5. Обновление версии схемы в метаданных
6. Добавление записи о миграции в историю

## Рекомендации по использованию

1. **Валидация данных** - всегда валидировать данные перед сохранением
2. **Атомарность операций** - обеспечивать атомарность связанных изменений
3. **Индексирование** - использовать индексы для оптимизации запросов
4. **Минимизация размера** - хранить только необходимые данные
5. **Резервное копирование** - регулярно создавать резервные копии
6. **Проверка целостности** - периодически проверять целостность связей

## Заключение

Разработанная схема данных обеспечивает:

1. **Гибкость** - возможность расширения без изменения существующей структуры
2. **Производительность** - оптимизация доступа через индексирование
3. **Целостность** - поддержание связей между сущностями
4. **Масштабируемость** - возможность работы с большим объемом данных
5. **Версионирование** - отслеживание изменений и история сущностей
6. **Обратную совместимость** - возможность обновления схемы без потери данных
