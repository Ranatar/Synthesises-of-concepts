# Недостающие события для игры "Кузница Феанора"

## События Этапа 3

```javascript
// === ВЕТКА ХРАНИТЕЛЕЙ ДРЕВ ===
{
    id: 'light_rituals',
    type: 'normal',
    stage: 3,
    title: '🕯️ Ритуалы света',
    text: 'Хранители обучают тебя древним ритуалам призыва и сохранения света Древ.',
    choices: [
        {
            text: 'Освоить ритуал накопления',
            requirements: {},
            effects: { light: 20, skill: 10 },
            next: 'light_accumulation'
        },
        {
            text: 'Изучить ритуал очищения',
            requirements: { light: 55 },
            effects: { light: 15, obsession: -10 },
            next: 'purification_ritual'
        },
        {
            text: 'Создать свой ритуал',
            requirements: { inspiration: 60 },
            effects: { inspiration: 20, light: 10 },
            next: 'custom_ritual'
        }
    ]
},

{
    id: 'keeper_blessing',
    type: 'special',
    stage: 4,
    title: '🌟 Благословение Хранителей',
    text: 'Хранители признали тебя достойным и даруют эссенцию самих Древ. Это величайшая честь.',
    choices: [
        {
            text: 'Принять с благодарностью',
            requirements: {},
            effects: { light: 30, reputation: 20 },
            materials: ['treeEssence', 'starDust'],
            next: 'blessed_creation'
        },
        {
            text: 'Попросить обучить секретам',
            requirements: { reputation: 70 },
            effects: { skill: 30, light: 20 },
            next: 'keeper_secrets'
        },
        {
            text: 'Предложить совместное творение',
            requirements: { skill: 70 },
            effects: { reputation: 25, light: 25 },
            next: 'joint_tree_project'
        }
    ]
},

{
    id: 'serve_keepers',
    type: 'normal',
    stage: 3,
    title: '🛡️ Служба Хранителям',
    text: 'Ты предлагаешь свои услуги Хранителям Древ в обмен на знания.',
    choices: [
        {
            text: 'Защищать Древа',
            requirements: {},
            effects: { reputation: 20, light: 10 },
            next: 'tree_defender'
        },
        {
            text: 'Ухаживать за светом',
            requirements: { light: 50 },
            effects: { light: 20, skill: 10 },
            next: 'light_tender'
        },
        {
            text: 'Стать учеником Хранителя',
            requirements: { reputation: 60 },
            effects: { skill: 20, light: 15 },
            next: 'keeper_apprentice'
        }
    ]
},

// === ВЕТКА ЛУННОЙ РАБОТЫ ===
{
    id: 'lunar_resonator',
    type: 'special',
    stage: 4,
    title: '🌙 Лунный резонатор',
    text: 'Твой резонатор усиливает лунный свет в сотни раз, создавая новые возможности.',
    choices: [
        {
            text: 'Направить на камни',
            requirements: {},
            effects: { skill: 20, light: 15 },
            next: 'resonator_on_stones'
        },
        {
            text: 'Создать лунную кузню',
            requirements: { skill: 65 },
            effects: { skill: 25, resources: 10 },
            next: 'lunar_forge'
        },
        {
            text: 'Усилить резонанс',
            requirements: { inspiration: 60 },
            effects: { inspiration: 20, light: 20 },
            next: 'amplified_resonance'
        }
    ]
},

{
    id: 'reflection_meditation',
    type: 'normal',
    stage: 3,
    title: '🪞 Медитация отражений',
    text: 'В отражённом лунном свете ты видишь новые грани реальности.',
    choices: [
        {
            text: 'Изучать множественность',
            requirements: {},
            effects: { inspiration: 20, skill: 10 },
            next: 'multiplicity_study'
        },
        {
            text: 'Искать истинное отражение',
            requirements: { light: 50 },
            effects: { light: 20, inspiration: 15 },
            next: 'true_reflection'
        },
        {
            text: 'Создать зеркало души',
            requirements: { obsession: 50 },
            effects: { obsession: 20, skill: 15 },
            next: 'soul_mirror'
        }
    ]
},

{
    id: 'moonlight_forging',
    type: 'special',
    stage: 4,
    title: '⚒️ Ковка в лунном свете',
    text: 'Металл, закалённый в лунном свете, приобретает удивительные свойства.',
    choices: [
        {
            text: 'Создать лунный клинок',
            requirements: { skill: 70 },
            effects: { skill: 20, resources: -10 },
            next: 'lunar_blade'
        },
        {
            text: 'Выковать оправу для камня',
            requirements: { resources: 60 },
            effects: { skill: 25, resources: -15 },
            next: 'lunar_setting'
        },
        {
            text: 'Сплавить с лунным камнем',
            requirements: { resources: 65 },
            effects: { light: 25, resources: -20 },
            materials: ['moonstone'],
            next: 'moonstone_alloy'
        }
    ]
},

// === ВЕТКА ВАРДЫ ===
{
    id: 'star_blessing',
    type: 'legendary',
    stage: 4,
    title: '⭐ Звёздное благословение',
    text: 'Варда одарила тебя звёздной пылью из своих чертогов. Это неслыханная честь.',
    choices: [
        {
            text: 'Вплести в Сильмарилл',
            requirements: { skill: 75 },
            effects: { light: 35, skill: 20 },
            materials: ['starDust'],
            next: 'star_weaving'
        },
        {
            text: 'Создать звёздную корону',
            requirements: { resources: 70 },
            effects: { reputation: 30, light: 25 },
            next: 'star_crown'
        },
        {
            text: 'Попросить ещё больше',
            requirements: { obsession: 60 },
            effects: { obsession: 30, reputation: -15 },
            next: 'greedy_star_request'
        }
    ]
},

{
    id: 'varda_knowledge',
    type: 'special',
    stage: 4,
    title: '📜 Знания Варды',
    text: 'Владычица звёзд делится с тобой секретами создания света.',
    choices: [
        {
            text: 'Изучить природу звёзд',
            requirements: {},
            effects: { skill: 25, inspiration: 20 },
            next: 'star_nature'
        },
        {
            text: 'Понять связь света и тьмы',
            requirements: { light: 60 },
            effects: { light: 20, obsession: 10 },
            next: 'light_darkness_bond'
        },
        {
            text: 'Научиться создавать звёзды',
            requirements: { skill: 80 },
            effects: { skill: 30, obsession: 20 },
            next: 'star_creation_knowledge'
        }
    ]
},

{
    id: 'star_creation',
    type: 'legendary',
    stage: 5,
    title: '✨ Создание звезды',
    text: 'Ты предлагаешь Варде создать новую звезду для небес Арды.',
    choices: [
        {
            text: 'Создать малую звезду',
            requirements: {},
            effects: { reputation: 40, light: 30 },
            next: 'minor_star'
        },
        {
            text: 'Попытаться создать созвездие',
            requirements: { skill: 85, obsession: 70 },
            effects: { obsession: 35 },
            next: 'constellation_attempt'
        },
        {
            text: 'Вложить звезду в Сильмарилл',
            requirements: { skill: 80, light: 70 },
            effects: {},
            next: 'star_silmaril_ending'
        }
    ]
},

// === ВЕТКА ГОРНОЙ ДОБЫЧИ ===
{
    id: 'glowing_crystals',
    type: 'normal',
    stage: 3,
    title: '💎 Светящиеся кристаллы',
    text: 'Кристаллы пульсируют внутренним светом, словно живые.',
    choices: [
        {
            text: 'Собрать коллекцию',
            requirements: {},
            effects: { resources: 20, light: 10 },
            materials: ['shadowGem'],
            next: 'crystal_collection'
        },
        {
            text: 'Изучить источник света',
            requirements: { skill: 55 },
            effects: { skill: 20, inspiration: 15 },
            next: 'light_source_study'
        },
        {
            text: 'Создать кристальную матрицу',
            requirements: { skill: 60 },
            effects: { skill: 15, light: 20 },
            next: 'crystal_matrix'
        }
    ]
},

{
    id: 'ancient_veins',
    type: 'special',
    stage: 4,
    title: '⛏️ Древние жилы',
    text: 'Ты обнаружил жилы металла старше самой Арды, помнящего музыку Творения.',
    choices: [
        {
            text: 'Добыть осторожно',
            requirements: {},
            effects: { resources: 35, skill: 15 },
            materials: ['mithril', 'dragonScale'],
            next: 'careful_mining'
        },
        {
            text: 'Изучить память металла',
            requirements: { inspiration: 65 },
            effects: { inspiration: 30, skill: 20 },
            next: 'metal_memory'
        },
        {
            text: 'Взять всё возможное',
            requirements: { obsession: 55 },
            effects: { resources: 50, obsession: 25 },
            materials: ['mithril', 'dragonScale', 'shadowGem'],
            next: 'greedy_mining'
        }
    ]
},

{
    id: 'mountain_heart',
    type: 'legendary',
    stage: 4,
    title: '🔥 Сердце горы',
    text: 'В самом центре горы бьётся огненное сердце - источник всей силы этих мест.',
    choices: [
        {
            text: 'Взять часть пламени',
            requirements: {},
            effects: { resources: 40, obsession: 20 },
            materials: ['fireHeart'],
            next: 'take_flame'
        },
        {
            text: 'Установить связь',
            requirements: { inspiration: 70 },
            effects: { inspiration: 25, skill: 20 },
            next: 'mountain_connection'
        },
        {
            text: 'Попытаться поглотить',
            requirements: { obsession: 70 },
            effects: { obsession: 40 },
            next: 'absorb_heart'
        }
    ]
},

// === ВЕТКА ЖЕМЧУЖНОГО НЫРЯНИЯ ===
{
    id: 'small_pearls',
    type: 'normal',
    stage: 3,
    title: '🦪 Малые жемчужины',
    text: 'Россыпь мелких жемчужин, каждая хранит каплю звёздного света.',
    choices: [
        {
            text: 'Создать ожерелье',
            requirements: {},
            effects: { resources: 15, reputation: 10 },
            next: 'pearl_necklace'
        },
        {
            text: 'Сплавить в одну',
            requirements: { skill: 55 },
            effects: { skill: 20, light: 15 },
            next: 'pearl_fusion'
        },
        {
            text: 'Искать дальше',
            requirements: {},
            effects: { resources: 20 },
            materials: ['moonstone'],
            next: 'deeper_diving'
        }
    ]
},

{
    id: 'great_pearl',
    type: 'special',
    stage: 4,
    title: '🔮 Великая жемчужина',
    text: 'Жемчужина размером с кулак излучает мягкое серебристое сияние.',
    choices: [
        {
            text: 'Использовать как основу',
            requirements: {},
            effects: { light: 30, resources: -10 },
            next: 'pearl_base'
        },
        {
            text: 'Расколоть на части',
            requirements: { skill: 65 },
            effects: { resources: 30, light: 20 },
            materials: ['moonstone'],
            next: 'split_pearl'
        },
        {
            text: 'Усилить светом Древ',
            requirements: { light: 60 },
            effects: { light: 35 },
            next: 'enhanced_pearl'
        }
    ]
},

{
    id: 'sea_folk_deal',
    type: 'special',
    stage: 4,
    title: '🧜 Договор с морским народом',
    text: 'Тэлери готовы делиться сокровищами моря в обмен на твоё мастерство.',
    choices: [
        {
            text: 'Согласиться на обмен',
            requirements: {},
            effects: { resources: 35, reputation: 20 },
            materials: ['moonstone', 'iceEssence'],
            next: 'teleri_partnership'
        },
        {
            text: 'Предложить обучение',
            requirements: { skill: 70 },
            effects: { reputation: 30, resources: 25 },
            next: 'teach_teleri'
        },
        {
            text: 'Попросить доступ к Ульмо',
            requirements: { reputation: 75 },
            effects: { reputation: 20, light: 25 },
            next: 'ulmo_access'
        }
    ]
},

// === ВЕТКА УЛЬМО ===
{
    id: 'water_tempering',
    type: 'special',
    stage: 4,
    title: '💧 Водная закалка',
    text: 'Священная вода придаёт металлу текучесть и одновременно прочность.',
    choices: [
        {
            text: 'Закалить инструменты',
            requirements: {},
            effects: { skill: 25, resources: 10 },
            next: 'tempered_tools'
        },
        {
            text: 'Создать водный металл',
            requirements: { skill: 70 },
            effects: { skill: 30, light: 15 },
            materials: ['iceEssence'],
            next: 'water_metal'
        },
        {
            text: 'Закалить будущий Сильмарилл',
            requirements: { light: 65 },
            effects: { light: 25 },
            next: 'water_silmaril_prep'
        }
    ]
},

{
    id: 'water_mirror',
    type: 'special',
    stage: 4,
    title: '🪞 Водное зеркало',
    text: 'Зеркало из священной воды показывает возможные будущие.',
    choices: [
        {
            text: 'Увидеть судьбу творения',
            requirements: {},
            effects: { inspiration: 30, obsession: 15 },
            next: 'creation_fate'
        },
        {
            text: 'Искать лучший путь',
            requirements: { inspiration: 65 },
            effects: { inspiration: 25, skill: 15 },
            next: 'best_path'
        },
        {
            text: 'Попытаться изменить судьбу',
            requirements: { obsession: 60 },
            effects: { obsession: 30 },
            next: 'change_fate'
        }
    ]
},

{
    id: 'preserve_water',
    type: 'normal',
    stage: 4,
    title: '💙 Сохранённая вода',
    text: 'Ты сохранил священную воду для финального творения.',
    choices: [
        {
            text: 'Добавить эссенцию льда',
            requirements: {},
            effects: { resources: 25 },
            materials: ['iceEssence'],
            next: 'ice_essence_added'
        },
        {
            text: 'Хранить в чистоте',
            requirements: {},
            effects: { light: 20, resources: 20 },
            next: 'pure_water'
        },
        {
            text: 'Смешать с другими элементами',
            requirements: { skill: 65 },
            effects: { skill: 20, resources: 15 },
            next: 'elemental_mixture'
        }
    ]
},

// === ОСТАЛЬНЫЕ ВЕТКИ ЭТАПА 3 ===
{
    id: 'light_transfer',
    type: 'special',
    stage: 4,
    title: '➡️ Передача света',
    text: 'Ты переносишь свет из себя в камень, ослабевая, но усиливая творение.',
    choices: [
        {
            text: 'Передать половину',
            requirements: {},
            effects: { light: -20, skill: 30 },
            next: 'half_light_transfer'
        },
        {
            text: 'Передать почти весь свет',
            requirements: { light: 70 },
            effects: { light: -40, skill: 40 },
            next: 'major_light_transfer'
        },
        {
            text: 'Создать канал света',
            requirements: { skill: 70 },
            effects: { light: 10, skill: 25 },
            next: 'light_channel'
        }
    ]
},

{
    id: 'light_bond',
    type: 'legendary',
    stage: 4,
    title: '🔗 Связь света',
    text: 'Между тобой и светом установилась нерушимая связь.',
    choices: [
        {
            text: 'Стать проводником',
            requirements: {},
            effects: { light: 40, obsession: 20 },
            next: 'light_conduit'
        },
        {
            text: 'Слиться со светом',
            requirements: { obsession: 65 },
            effects: { obsession: 35, light: 50 },
            next: 'light_merger'
        },
        {
            text: 'Контролировать связь',
            requirements: { skill: 75 },
            effects: { skill: 30, light: 30 },
            next: 'controlled_bond'
        }
    ]
},

// === ИНСТРУМЕНТЫ СВЕТА ===
{
    id: 'light_tool_cutting',
    type: 'normal',
    stage: 4,
    title: '✂️ Резка светом',
    text: 'Твои инструменты режут не металл, а саму структуру света.',
    choices: [
        {
            text: 'Огранить световые камни',
            requirements: {},
            effects: { skill: 20, light: 15 },
            next: 'light_stone_cutting'
        },
        {
            text: 'Разделить свет на спектр',
            requirements: { skill: 60 },
            effects: { skill: 25, inspiration: 15 },
            next: 'spectrum_division'
        },
        {
            text: 'Создать световые грани',
            requirements: { light: 55 },
            effects: { light: 20, skill: 20 },
            next: 'light_facets'
        }
    ]
},

{
    id: 'modify_tools',
    type: 'normal',
    stage: 4,
    title: '🔧 Модификация инструментов',
    text: 'Ты улучшаешь световые инструменты новыми возможностями.',
    choices: [
        {
            text: 'Добавить автономность',
            requirements: { skill: 60 },
            effects: { skill: 25 },
            next: 'autonomous_tools'
        },
        {
            text: 'Усилить мощность',
            requirements: { resources: 55 },
            effects: { resources: -10, skill: 20 },
            next: 'powered_tools'
        },
        {
            text: 'Сделать разумными',
            requirements: { inspiration: 70 },
            effects: { inspiration: 20, obsession: 15 },
            next: 'sentient_tools'
        }
    ]
},

{
    id: 'teach_tool_use',
    type: 'normal',
    stage: 3,
    title: '👥 Обучение использованию',
    text: 'Ты обучаешь других работе со световыми инструментами.',
    choices: [
        {
            text: 'Обучить помощников',
            requirements: {},
            effects: { reputation: 20, resources: 10 },
            next: 'train_assistants'
        },
        {
            text: 'Создать школу',
            requirements: { reputation: 65 },
            effects: { reputation: 30 },
            next: 'tool_school'
        },
        {
            text: 'Написать трактат',
            requirements: {},
            effects: { reputation: 25, skill: 10 },
            next: 'tool_treatise'
        }
    ]
},

// === УЛУЧШЕНИЕ ИНСТРУМЕНТОВ ===
{
    id: 'add_resonators',
    type: 'special',
    stage: 4,
    title: '📡 Резонаторы света',
    text: 'Резонаторы усиливают и направляют световую энергию инструментов.',
    choices: [
        {
            text: 'Настроить на Древа',
            requirements: { light: 60 },
            effects: { light: 25, skill: 15 },
            next: 'tree_resonance'
        },
        {
            text: 'Создать автоколебания',
            requirements: { skill: 65 },
            effects: { skill: 25 },
            next: 'auto_oscillation'
        },
        {
            text: 'Синхронизировать все инструменты',
            requirements: { skill: 70 },
            effects: { skill: 30 },
            next: 'tool_synchronization'
        }
    ]
},

{
    id: 'simplify_tools',
    type: 'normal',
    stage: 4,
    title: '⚙️ Упрощение конструкции',
    text: 'Простота - высшая форма совершенства.',
    choices: [
        {
            text: 'Убрать лишнее',
            requirements: {},
            effects: { skill: 20, resources: 5 },
            next: 'minimalist_design'
        },
        {
            text: 'Объединить функции',
            requirements: { skill: 60 },
            effects: { skill: 25 },
            next: 'unified_functions'
        },
        {
            text: 'Сделать интуитивными',
            requirements: { inspiration: 60 },
            effects: { reputation: 25, inspiration: 15 },
            next: 'intuitive_tools'
        }
    ]
},

{
    id: 'specialized_tools',
    type: 'special',
    stage: 4,
    title: '🎯 Специализированные инструменты',
    text: 'Каждый инструмент создан для конкретной задачи и совершенен в ней.',
    choices: [
        {
            text: 'Для работы с эссенциями',
            requirements: {},
            effects: { skill: 25 },
            materials: ['treeEssence'],
            next: 'essence_tools'
        },
        {
            text: 'Для обработки света',
            requirements: { light: 65 },
            effects: { light: 20, skill: 20 },
            next: 'light_processing_tools'
        },
        {
            text: 'Для финального творения',
            requirements: { skill: 75 },
            effects: { skill: 30 },
            next: 'final_creation_tools'
        }
    ]
},

// === ДЕМОНСТРАЦИЯ ИНСТРУМЕНТОВ ===
{
    id: 'share_technology',
    type: 'normal',
    stage: 4,
    title: '🎓 Передача технологии',
    text: 'Ты делишься секретами создания световых инструментов.',
    choices: [
        {
            text: 'Обучить мастеров',
            requirements: {},
            effects: { reputation: 30 },
            next: 'master_training'
        },
        {
            text: 'Создать документацию',
            requirements: {},
            effects: { reputation: 25, skill: 10 },
            next: 'tool_documentation'
        },
        {
            text: 'Основать мастерскую',
            requirements: { resources: 60 },
            effects: { resources: -15, reputation: 35 },
            next: 'tool_workshop'
        }
    ]
},

{
    id: 'sell_secret',
    type: 'normal',
    stage: 4,
    title: '💰 Продажа секрета',
    text: 'Знание - это власть, а власть можно продать.',
    choices: [
        {
            text: 'Продать гномам',
            requirements: {},
            effects: { resources: 40, reputation: -10 },
            next: 'dwarf_tech_sale'
        },
        {
            text: 'Обменять на материалы',
            requirements: {},
            effects: { resources: 30 },
            materials: ['mithril', 'dragonScale'],
            next: 'material_exchange'
        },
        {
            text: 'Создать монополию',
            requirements: { obsession: 55 },
            effects: { resources: 50, obsession: 20, reputation: -15 },
            next: 'tech_monopoly'
        }
    ]
},

{
    id: 'found_guild',
    type: 'special',
    stage: 5,
    title: '🏛️ Основание гильдии',
    text: 'Гильдия мастеров света станет центром нового искусства.',
    choices: [
        {
            text: 'Стать главой гильдии',
            requirements: {},
            effects: { reputation: 40 },
            next: 'guild_leader'
        },
        {
            text: 'Создать совет мастеров',
            requirements: { reputation: 70 },
            effects: { reputation: 35, skill: 15 },
            next: 'master_council'
        },
        {
            text: 'Остаться советником',
            requirements: {},
            effects: { reputation: 30, inspiration: 20 },
            next: 'guild_advisor'
        }
    ]
},

// === БАЛАНС СВЕТОВ ===
{
    id: 'fix_in_stone',
    type: 'normal',
    stage: 4,
    title: '💎 Фиксация в камне',
    text: 'Ты закрепляешь баланс светов в кристаллической структуре.',
    choices: [
        {
            text: 'Использовать кварц',
            requirements: {},
            effects: { skill: 20, light: 15 },
            next: 'quartz_fixing'
        },
        {
            text: 'Создать новый кристалл',
            requirements: { skill: 65 },
            effects: { skill: 25, resources: -10 },
            next: 'new_crystal_balance'
        },
        {
            text: 'Вырастить камень',
            requirements: { inspiration: 65 },
            effects: { inspiration: 20, skill: 20 },
            next: 'grow_balanced_stone'
        }
    ]
},

{
    id: 'study_mixture',
    type: 'normal',
    stage: 4,
    title: '🔬 Изучение смеси',
    text: 'Ты исследуешь свойства сбалансированной световой смеси.',
    choices: [
        {
            text: 'Анализировать спектр',
            requirements: {},
            effects: { skill: 20, inspiration: 10 },
            next: 'spectrum_analysis'
        },
        {
            text: 'Тестировать стабильность',
            requirements: { skill: 60 },
            effects: { skill: 25 },
            next: 'stability_test'
        },
        {
            text: 'Искать применение',
            requirements: {},
            effects: { resources: 15, skill: 15 },
            next: 'mixture_applications'
        }
    ]
},

{
    id: 'enhance_mixture',
    type: 'special',
    stage: 4,
    title: '⚗️ Усиление смеси',
    text: 'Ты добавляешь новые компоненты для усиления световой смеси.',
    choices: [
        {
            text: 'Добавить звёздную пыль',
            requirements: { resources: 60 },
            effects: { light: 30 },
            materials: ['starDust'],
            next: 'stardust_enhancement'
        },
        {
            text: 'Концентрировать энергию',
            requirements: { obsession: 50 },
            effects: { obsession: 25, light: 25 },
            next: 'energy_concentration'
        },
        {
            text: 'Стабилизировать магией',
            requirements: { skill: 70 },
            effects: { skill: 20, light: 20 },
            next: 'magical_stabilization'
        }
    ]
},

// === ТАНЦУЮЩИЕ ОГНИ ===
{
    id: 'direct_dance',
    type: 'special',
    stage: 4,
    title: '💃 Направление танца',
    text: 'Ты учишься управлять танцем светов силой воли.',
    choices: [
        {
            text: 'Создать гармоничный узор',
            requirements: {},
            effects: { inspiration: 25, light: 15 },
            next: 'harmonic_pattern'
        },
        {
            text: 'Вплести в камень',
            requirements: { skill: 65 },
            effects: { skill: 25, light: 20 },
            next: 'weave_dance'
        },
        {
            text: 'Позволить хаосу',
            requirements: { obsession: 55 },
            effects: { obsession: 20, inspiration: 25 },
            next: 'chaotic_dance'
        }
    ]
},

{
    id: 'record_patterns',
    type: 'normal',
    stage: 4,
    title: '📝 Запись узоров',
    text: 'Ты фиксируешь узоры танцующих огней для будущего использования.',
    choices: [
        {
            text: 'Создать световую партитуру',
            requirements: {},
            effects: { skill: 20, inspiration: 15 },
            next: 'light_score'
        },
        {
            text: 'Зарисовать движения',
            requirements: {},
            effects: { skill: 15, reputation: 10 },
            next: 'movement_sketches'
        },
        {
            text: 'Запомнить интуитивно',
            requirements: { inspiration: 60 },
            effects: { inspiration: 25 },
            next: 'intuitive_memory'
        }
    ]
},

{
    id: 'free_lights',
    type: 'legendary',
    stage: 4,
    title: '🦋 Свободные огни',
    text: 'Освобождённые огни обретают собственную волю и жизнь.',
    choices: [
        {
            text: 'Стать их другом',
            requirements: {},
            effects: { inspiration: 30, light: 20 },
            next: 'light_friendship'
        },
        {
            text: 'Попытаться вернуть контроль',
            requirements: { obsession: 60 },
            effects: { obsession: 25 },
            next: 'regain_control'
        },
        {
            text: 'Наблюдать и учиться',
            requirements: {},
            effects: { inspiration: 25, skill: 20 },
            next: 'observe_free_lights'
        }
    ]
},

// === ЗАПИСИ НАБЛЮДЕНИЙ ===
{
    id: 'light_theory',
    type: 'special',
    stage: 4,
    title: '📚 Теория света',
    text: 'Твоя теория света революционна и может изменить понимание творения.',
    choices: [
        {
            text: 'Опубликовать труд',
            requirements: {},
            effects: { reputation: 35, skill: 15 },
            next: 'publish_theory'
        },
        {
            text: 'Проверить на практике',
            requirements: { skill: 65 },
            effects: { skill: 30 },
            next: 'test_theory'
        },
        {
            text: 'Хранить в тайне',
            requirements: {},
            effects: { obsession: 20, skill: 20 },
            next: 'secret_theory'
        }
    ]
},

{
    id: 'find_patterns',
    type: 'normal',
    stage: 4,
    title: '🔍 Поиск закономерностей',
    text: 'В балансе светов ты находишь скрытые закономерности.',
    choices: [
        {
            text: 'Математические пропорции',
            requirements: {},
            effects: { skill: 25 },
            next: 'mathematical_proportions'
        },
        {
            text: 'Музыкальные гармонии',
            requirements: { inspiration: 60 },
            effects: { inspiration: 25, skill: 15 },
            next: 'musical_harmonies'
        },
        {
            text: 'Природные циклы',
            requirements: {},
            effects: { inspiration: 20, light: 15 },
            next: 'natural_cycles'
        }
    ]
},

{
    id: 'practical_test',
    type: 'normal',
    stage: 4,
    title: '🧪 Практическая проверка',
    text: 'Ты проверяешь свои наблюдения на практике.',
    choices: [
        {
            text: 'Создать пробный камень',
            requirements: {},
            effects: { skill: 20, resources: -5 },
            next: 'test_stone'
        },
        {
            text: 'Провести серию экспериментов',
            requirements: { resources: 55 },
            effects: { skill: 25, resources: -10 },
            next: 'experiment_series'
        },
        {
            text: 'Применить к Сильмариллу',
            requirements: { skill: 70 },
            effects: { skill: 30 },
            next: 'apply_to_silmaril'
        }
    ]
},

// === ВИДЕНИЕ ЕДИНСТВА ===
{
    id: 'create_circle',
    type: 'normal',
    stage: 4,
    title: '⭕ Круг единомышленников',
    text: 'Вокруг тебя собираются те, кто разделяет видение единства светов.',
    choices: [
        {
            text: 'Обучать учеников',
            requirements: {},
            effects: { reputation: 25, inspiration: 15 },
            next: 'unity_students'
        },
        {
            text: 'Создать орден',
            requirements: { reputation: 70 },
            effects: { reputation: 35 },
            next: 'unity_order'
        },
        {
            text: 'Работать вместе',
            requirements: {},
            effects: { skill: 20, reputation: 20 },
            next: 'collaborative_work'
        }
    ]
},

{
    id: 'write_treatise',
    type: 'normal',
    stage: 4,
    title: '📖 Трактат о единстве',
    text: 'Ты пишешь фундаментальный труд о единой природе светов.',
    choices: [
        {
            text: 'Философский подход',
            requirements: {},
            effects: { inspiration: 25, reputation: 20 },
            next: 'philosophical_treatise'
        },
        {
            text: 'Технический анализ',
            requirements: { skill: 65 },
            effects: { skill: 20, reputation: 25 },
            next: 'technical_treatise'
        },
        {
            text: 'Поэтическое описание',
            requirements: { inspiration: 65 },
            effects: { inspiration: 30, reputation: 15 },
            next: 'poetic_treatise'
        }
    ]
},

{
    id: 'unity_ritual',
    type: 'special',
    stage: 4,
    title: '🕯️ Ритуал единства',
    text: 'Древний ритуал объединения золотого и серебряного света.',
    choices: [
        {
            text: 'Провести в одиночестве',
            requirements: {},
            effects: { light: 30, obsession: 15 },
            next: 'solo_unity_ritual'
        },
        {
            text: 'Пригласить свидетелей',
            requirements: { reputation: 65 },
            effects: { reputation: 30, light: 25 },
            next: 'witnessed_ritual'
        },
        {
            text: 'Сделать постоянным',
            requirements: { skill: 70, light: 60 },
            effects: { light: 35 },
            next: 'permanent_unity'
        }
    ]
},

// === ДВОЙСТВЕННЫЙ КАМЕНЬ ===
{
    id: 'enhance_changeability',
    type: 'normal',
    stage: 4,
    title: '🌀 Усиление изменчивости',
    text: 'Камень становится ещё более изменчивым, почти живым.',
    choices: [
        {
            text: 'Добавить третий цвет',
            requirements: { skill: 60 },
            effects: { skill: 25, light: 15 },
            next: 'triple_color'
        },
        {
            text: 'Ускорить изменения',
            requirements: {},
            effects: { inspiration: 20, obsession: 10 },
            next: 'accelerated_change'
        },
        {
            text: 'Связать с эмоциями',
            requirements: { obsession: 50 },
            effects: { obsession: 25, inspiration: 15 },
            next: 'emotional_stone'
        }
    ]
},

{
    id: 'stabilize_properties',
    type: 'normal',
    stage: 4,
    title: '⚖️ Стабилизация свойств',
    text: 'Ты фиксируешь изменения камня в предсказуемые циклы.',
    choices: [
        {
            text: 'Дневной и ночной режим',
            requirements: {},
            effects: { skill: 20, light: 15 },
            next: 'day_night_cycle'
        },
        {
            text: 'Сезонные изменения',
            requirements: { inspiration: 60 },
            effects: { inspiration: 20, skill: 20 },
            next: 'seasonal_changes'
        },
        {
            text: 'Полная стабильность',
            requirements: { skill: 65 },
            effects: { skill: 30 },
            next: 'full_stability'
        }
    ]
},

{
    id: 'use_as_foundation',
    type: 'special',
    stage: 4,
    title: '🏗️ Основа для творения',
    text: 'Двойственный камень становится основой для Сильмарилла.',
    choices: [
        {
            text: 'Сохранить двойственность',
            requirements: {},
            effects: { skill: 20, light: 20 },
            next: 'dual_silmaril_base'
        },
        {
            text: 'Разделить на два',
            requirements: { skill: 65 },
            effects: { skill: 25 },
            next: 'split_dual_stone'
        },
        {
            text: 'Усилить до предела',
            requirements: { obsession: 60 },
            effects: { obsession: 30, light: 25 },
            next: 'maximize_duality'
        }
    ]
},

// === СПЛАВ И МЕТАЛЛЫ ===
{
    id: 'forge_base',
    type: 'legendary',
    stage: 6,
    title: '🔨 Выковать основу',
    text: 'Из нового сплава ты создаёшь идеальную основу.',
    choices: [
        {
            text: 'Классическая форма',
            requirements: {},
            effects: {},
            next: 'classic_base_ending'
        },
        {
            text: 'Экспериментальная',
            requirements: {},
            effects: {},
            next: 'experimental_base_ending'
        },
        {
            text: 'Текучая форма',
            requirements: {},
            effects: {},
            next: 'fluid_base_ending'
        }
    ]
},

{
    id: 'share_discovery',
    type: 'special',
    stage: 6,
    title: '📢 Поделиться открытием',
    text: 'Твой новый сплав революционизирует металлургию.',
    choices: [
        {
            text: 'Научить всех',
            requirements: {},
            effects: {},
            next: 'teach_all_ending'
        },
        {
            text: 'Продать секрет',
            requirements: {},
            effects: {},
            next: 'sell_alloy_ending'
        },
        {
            text: 'Основать новую эру',
            requirements: {},
            effects: {},
            next: 'new_metallurgy_ending'
        }
    ]
},

{
    id: 'forge_weapon',
    type: 'legendary',
    stage: 6,
    title: '⚔️ Выковать оружие',
    text: 'Из сплава ты создаёшь оружие невиданной силы.',
    choices: [
        {
            text: 'Меч света',
            requirements: {},
            effects: {},
            next: 'light_sword_ending'
        },
        {
            text: 'Копьё звёзд',
            requirements: {},
            effects: {},
            next: 'star_spear_ending'
        },
        {
            text: 'Молот творения',
            requirements: {},
            effects: {},
            next: 'creation_hammer_ending'
        }
    ]
},

// === СИНХРОНИЗАЦИЯ С ДРЕВАМИ ===
{
    id: 'maximum_resonance',
    type: 'legendary',
    stage: 6,
    title: '📈 Максимальный резонанс',
    text: 'Резонанс достигает невиданной силы.',
    choices: [
        {
            text: 'Стабилизировать',
            requirements: {},
            effects: {},
            next: 'stable_resonance_ending'
        },
        {
            text: 'Превысить предел',
            requirements: {},
            effects: {},
            next: 'beyond_limit_ending'
        },
        {
            text: 'Слиться с резонансом',
            requirements: {},
            effects: {},
            next: 'resonance_merger_ending'
        }
    ]
},

{
    id: 'call_witnesses',
    type: 'special',
    stage: 6,
    title: '👥 Призыв свидетелей',
    text: 'На твоё финальное творение собираются все великие.',
    choices: [
        {
            text: 'Творить при всех',
            requirements: {},
            effects: {},
            next: 'public_creation_ending'
        },
        {
            text: 'Выбрать избранных',
            requirements: {},
            effects: {},
            next: 'chosen_witnesses_ending'
        },
        {
            text: 'Пригласить богов',
            requirements: {},
            effects: {},
            next: 'divine_witnesses_ending'
        }
    ]
},

// === СВЕТОВЫЕ ИНСТРУМЕНТЫ ===
{
    id: 'perfect_tools',
    type: 'legendary',
    stage: 6,
    title: '🛠️ Совершенные инструменты',
    text: 'Инструменты достигли абсолютного совершенства.',
    choices: [
        {
            text: 'Использовать для творения',
            requirements: {},
            effects: {},
            next: 'tool_creation_ending'
        },
        {
            text: 'Передать потомкам',
            requirements: {},
            effects: {},
            next: 'tool_legacy_ending'
        },
        {
            text: 'Слить с Сильмариллами',
            requirements: {},
            effects: {},
            next: 'tool_fusion_ending'
        }
    ]
},

{
    id: 'share_light_tech',
    type: 'special',
    stage: 6,
    title: '💡 Распространение технологии',
    text: 'Технология световых инструментов меняет мир.',
    choices: [
        {
            text: 'Создать новую цивилизацию',
            requirements: {},
            effects: {},
            next: 'light_civilization_ending'
        },
        {
            text: 'Основать гильдию света',
            requirements: {},
            effects: {},
            next: 'light_guild_ending'
        },
        {
            text: 'Подарить всему миру',
            requirements: {},
            effects: {},
            next: 'world_gift_ending'
        }
    ]
}
```

## События Этапа 2
```javascript
// === СОВЕТЫ МАСТЕРОВ ===
{
    id: 'classic_methods',
    type: 'normal',
    stage: 3,
    title: '📜 Классические методы',
    text: 'Проверенные веками техники дают надёжный результат.',
    choices: [
        {
            text: 'Следовать традиции',
            requirements: {},
            effects: { skill: 20, reputation: 15 },
            next: 'traditional_path'
        },
        {
            text: 'Добавить своё',
            requirements: { inspiration: 50 },
            effects: { skill: 15, inspiration: 20 },
            next: 'modified_classics'
        },
        {
            text: 'Усовершенствовать',
            requirements: { skill: 55 },
            effects: { skill: 25 },
            next: 'improved_classics'
        }
    ]
},

{
    id: 'adapt_methods',
    type: 'normal',
    stage: 3,
    title: '🔄 Адаптация методов',
    text: 'Ты приспосабливаешь советы мастеров под свой стиль работы.',
    choices: [
        {
            text: 'Упростить процесс',
            requirements: {},
            effects: { skill: 15, resources: 10 },
            next: 'simplified_process'
        },
        {
            text: 'Усложнить для качества',
            requirements: { skill: 50 },
            effects: { skill: 25, resources: -5 },
            next: 'complex_quality'
        },
        {
            text: 'Найти золотую середину',
            requirements: {},
            effects: { skill: 20, inspiration: 15 },
            next: 'balanced_adaptation'
        }
    ]
},

{
    id: 'find_mentor',
    type: 'special',
    stage: 3,
    title: '🧙 Поиск наставника',
    text: 'Ты находишь мастера, готового стать твоим личным наставником.',
    choices: [
        {
            text: 'Учиться у Ауле',
            requirements: { reputation: 60 },
            effects: { skill: 35, reputation: 20 },
            next: 'aule_mentorship'
        },
        {
            text: 'Найти эльфийского мастера',
            requirements: {},
            effects: { skill: 25, inspiration: 20 },
            next: 'elf_mentor'
        },
        {
            text: 'Учиться у отшельника',
            requirements: {},
            effects: { skill: 20, obsession: 15 },
            next: 'hermit_mentor'
        }
    ]
},

// === СВОЙ ПУТЬ ===
{
    id: 'bold_experiments',
    type: 'special',
    stage: 3,
    title: '🧨 Смелые эксперименты',
    text: 'Твои эксперименты граничат с безумием, но дают невероятные результаты.',
    choices: [
        {
            text: 'Смешать несовместимое',
            requirements: {},
            effects: { inspiration: 30, obsession: 20 },
            next: 'impossible_mixture'
        },
        {
            text: 'Нарушить все правила',
            requirements: { obsession: 50 },
            effects: { obsession: 30, skill: 20 },
            next: 'break_all_rules'
        },
        {
            text: 'Создать новый метод',
            requirements: { inspiration: 65 },
            effects: { inspiration: 25, skill: 25 },
            next: 'revolutionary_method'
        }
    ]
},

{
    id: 'nature_inspiration',
    type: 'normal',
    stage: 3,
    title: '🌿 Вдохновение природы',
    text: 'Природа открывает тебе свои секреты творения.',
    choices: [
        {
            text: 'Подражать росту кристаллов',
            requirements: {},
            effects: { inspiration: 20, skill: 15 },
            next: 'crystal_growth'
        },
        {
            text: 'Копировать структуру листьев',
            requirements: {},
            effects: { inspiration: 25, light: 10 },
            next: 'leaf_structure'
        },
        {
            text: 'Воссоздать звёздные узоры',
            requirements: { inspiration: 60 },
            effects: { inspiration: 30, light: 15 },
            next: 'star_patterns'
        }
    ]
},

{
    id: 'isolate_work',
    type: 'normal',
    stage: 3,
    title: '🏚️ Работа в изоляции',
    text: 'В одиночестве ты находишь покой и сосредоточенность.',
    choices: [
        {
            text: 'Медитировать неделями',
            requirements: {},
            effects: { obsession: 25, inspiration: 20 },
            next: 'long_meditation'
        },
        {
            text: 'Работать без остановки',
            requirements: { obsession: 45 },
            effects: { obsession: 30, skill: 25 },
            next: 'nonstop_work'
        },
        {
            text: 'Искать озарение',
            requirements: {},
            effects: { inspiration: 35 },
            next: 'seek_enlightenment'
        }
    ]
},

// === ОБЪЕДИНЕНИЕ ПОДХОДОВ ===
{
    id: 'new_methodology',
    type: 'special',
    stage: 3,
    title: '📚 Новая методология',
    text: 'Твоя методика объединяет лучшее из всех школ мастерства.',
    choices: [
        {
            text: 'Создать универсальную систему',
            requirements: {},
            effects: { skill: 30, reputation: 20 },
            next: 'universal_system'
        },
        {
            text: 'Специализировать под Сильмариллы',
            requirements: { skill: 60 },
            effects: { skill: 35 },
            next: 'silmaril_specialization'
        },
        {
            text: 'Сделать адаптивной',
            requirements: { inspiration: 60 },
            effects: { inspiration: 25, skill: 20 },
            next: 'adaptive_methodology'
        }
    ]
},

{
    id: 'golden_middle',
    type: 'normal',
    stage: 3,
    title: '⚖️ Золотая середина',
    text: 'Баланс между различными подходами даёт оптимальный результат.',
    choices: [
        {
            text: 'Продолжить балансировать',
            requirements: {},
            effects: { skill: 20, inspiration: 20 },
            next: 'continue_balance'
        },
        {
            text: 'Зафиксировать метод',
            requirements: {},
            effects: { skill: 25, reputation: 15 },
            next: 'fix_method'
        },
        {
            text: 'Искать новые комбинации',
            requirements: { inspiration: 55 },
            effects: { inspiration: 25, skill: 15 },
            next: 'new_combinations'
        }
    ]
},

{
    id: 'continue_synthesis',
    type: 'special',
    stage: 3,
    title: '🔄 Продолжение синтеза',
    text: 'Ты продолжаешь объединять всё больше различных техник.',
    choices: [
        {
            text: 'Добавить магические методы',
            requirements: { light: 50 },
            effects: { light: 20, skill: 20 },
            next: 'add_magic'
        },
        {
            text: 'Включить интуицию',
            requirements: { inspiration: 60 },
            effects: { inspiration: 30 },
            next: 'include_intuition'
        },
        {
            text: 'Достичь совершенства',
            requirements: { skill: 65 },
            effects: { skill: 35 },
            next: 'synthesis_perfection'
        }
    ]
}
```

## События Этапа 3-4 (Поиск материалов и эксперименты)

```javascript
// === ВЕТКА МАТЕРИАЛОВ ===
{
    id: 'sea_elf_trade',
    type: 'special',
    stage: 4,
    title: '⚓ Торговля с морскими эльфами',
    text: 'Тэлери предлагают редчайшие дары моря.',
    choices: [
        {
            text: 'Обменять на знания',
            requirements: {},
            effects: { resources: 25, skill: -5 },
            materials: ['moonstone', 'iceEssence'],
            next: 'knowledge_for_materials'
        },
        {
            text: 'Предложить партнёрство',
            requirements: { reputation: 65 },
            effects: { reputation: 20, resources: 30 },
            next: 'teleri_partnership'
        },
        {
            text: 'Купить всё возможное',
            requirements: { resources: 70 },
            effects: { resources: -30 },
            materials: ['moonstone', 'iceEssence', 'starDust'],
            next: 'buy_all_materials'
        }
    ]
},

{
    id: 'ancient_ruins',
    type: 'special',
    stage: 4,
    title: '🏛️ Древние руины',
    text: 'В забытых руинах ты находишь артефакты времён до Древ.',
    choices: [
        {
            text: 'Исследовать осторожно',
            requirements: {},
            effects: { skill: 20, obsession: 15 },
            materials: ['shadowGem'],
            next: 'careful_exploration'
        },
        {
            text: 'Забрать всё ценное',
            requirements: { obsession: 55 },
            effects: { obsession: 25, resources: 35 },
            materials: ['shadowGem', 'timeFragment'],
            next: 'loot_ruins'
        },
        {
            text: 'Изучить древние знания',
            requirements: { skill: 60 },
            effects: { skill: 30, inspiration: 20 },
            next: 'ancient_knowledge'
        }
    ]
},

{
    id: 'create_materials',
    type: 'legendary',
    stage: 4,
    title: '⚗️ Создание материалов',
    text: 'Ты научился создавать материалы, которых не существует в природе.',
    choices: [
        {
            text: 'Синтезировать эссенции',
            requirements: {},
            effects: { skill: 30 },
            materials: ['treeEssence'],
            next: 'synthesize_essences'
        },
        {
            text: 'Трансмутировать металлы',
            requirements: { skill: 70 },
            effects: { skill: 25, resources: 20 },
            materials: ['mithril'],
            next: 'transmute_metals'
        },
        {
            text: 'Создать философский камень',
            requirements: { obsession: 65, skill: 75 },
            effects: { obsession: 35 },
            materials: ['timeFragment'],
            next: 'philosopher_stone'
        }
    ]
},

// === ЗАПИСИ И ВИДЕНИЯ ===
{
    id: 'secret_records',
    type: 'normal',
    stage: 4,
    title: '🔒 Тайные записи',
    text: 'Твои записи слишком опасны для чужих глаз.',
    choices: [
        {
            text: 'Зашифровать',
            requirements: {},
            effects: { obsession: 20, skill: 15 },
            next: 'encrypted_records'
        },
        {
            text: 'Спрятать',
            requirements: {},
            effects: { obsession: 15, reputation: -5 },
            next: 'hidden_records'
        },
        {
            text: 'Запомнить и уничтожить',
            requirements: { obsession: 60 },
            effects: { obsession: 30, skill: 20 },
            next: 'memorize_destroy'
        }
    ]
},

{
    id: 'share_records',
    type: 'normal',
    stage: 4,
    title: '📖 Открытые записи',
    text: 'Ты делишься своими открытиями с другими мастерами.',
    choices: [
        {
            text: 'Опубликовать полностью',
            requirements: {},
            effects: { reputation: 35 },
            next: 'full_publication'
        },
        {
            text: 'Поделиться с избранными',
            requirements: { reputation: 60 },
            effects: { reputation: 25, skill: 15 },
            next: 'selective_sharing'
        },
        {
            text: 'Создать школу',
            requirements: { reputation: 70 },
            effects: { reputation: 40 },
            next: 'vision_school'
        }
    ]
},

{
    id: 'vision_foundation',
    type: 'special',
    stage: 4,
    title: '🏗️ Основа из видения',
    text: 'Твоё видение становится фундаментом для великого творения.',
    choices: [
        {
            text: 'Воплотить немедленно',
            requirements: { skill: 65 },
            effects: { skill: 25 },
            next: 'immediate_manifestation'
        },
        {
            text: 'Развивать постепенно',
            requirements: {},
            effects: { skill: 20, inspiration: 20 },
            next: 'gradual_development'
        },
        {
            text: 'Искать подтверждение',
            requirements: {},
            effects: { inspiration: 25, reputation: 15 },
            next: 'seek_confirmation'
        }
    ]
},

// === ОТКРОВЕНИЕ ===
{
    id: 'found_school',
    type: 'special',
    stage: 5,
    title: '🏫 Основание школы',
    text: 'Школа света станет центром нового знания для поколений.',
    choices: [
        {
            text: 'Обучать всех желающих',
            requirements: {},
            effects: { reputation: 40 },
            next: 'open_school'
        },
        {
            text: 'Только избранных',
            requirements: { reputation: 75 },
            effects: { reputation: 30, skill: 20 },
            next: 'elite_school'
        },
        {
            text: 'Создать тайный орден',
            requirements: { obsession: 60 },
            effects: { obsession: 25, reputation: 20 },
            next: 'secret_order'
        }
    ]
},

{
    id: 'collaborative_project',
    type: 'special',
    stage: 5,
    title: '🤝 Совместный проект',
    text: 'Множество мастеров объединяются под твоим руководством.',
    choices: [
        {
            text: 'Создать величайшее творение',
            requirements: { reputation: 70 },
            effects: { reputation: 35 },
            next: 'greatest_creation'
        },
        {
            text: 'Построить храм света',
            requirements: {},
            effects: { reputation: 30, light: 25 },
            next: 'light_temple'
        },
        {
            text: 'Воссоздать свет Древ',
            requirements: { light: 70, skill: 75 },
            effects: {},
            next: 'recreate_trees_ending'
        }
    ]
},

{
    id: 'inspire_greatness',
    type: 'legendary',
    stage: 5,
    title: '✨ Вдохновение величия',
    text: 'Твоё откровение вдохновляет других на великие свершения.',
    choices: [
        {
            text: 'Возглавить движение',
            requirements: {},
            effects: { reputation: 45 },
            next: 'lead_movement'
        },
        {
            text: 'Остаться в тени',
            requirements: {},
            effects: { inspiration: 35, obsession: -15 },
            next: 'shadow_inspiration'
        },
        {
            text: 'Создать новую эпоху',
            requirements: { reputation: 80, inspiration: 75 },
            effects: {},
            next: 'new_age_ending'
        }
    ]
},

// === ОТКАЗ ОТ ОПАСНОСТИ ===
{
    id: 'path_of_light',
    type: 'normal',
    stage: 4,
    title: '☀️ Путь света',
    text: 'Ты выбираешь чистый путь света и мудрости.',
    choices: [
        {
            text: 'Очистить себя',
            requirements: {},
            effects: { light: 25, obsession: -20 },
            next: 'self_purification'
        },
        {
            text: 'Искать благословение',
            requirements: { light: 55 },
            effects: { light: 30, reputation: 20 },
            next: 'seek_blessing'
        },
        {
            text: 'Стать хранителем света',
            requirements: { light: 65, reputation: 65 },
            effects: { light: 35 },
            next: 'light_guardian'
        }
    ]
},

{
    id: 'warn_others',
    type: 'normal',
    stage: 4,
    title: '⚠️ Предупреждение другим',
    text: 'Ты предупреждаешь других об опасностях тёмного пути.',
    choices: [
        {
            text: 'Написать предостережение',
            requirements: {},
            effects: { reputation: 25 },
            next: 'write_warning'
        },
        {
            text: 'Лично обойти мастеров',
            requirements: {},
            effects: { reputation: 30, resources: -5 },
            next: 'personal_warnings'
        },
        {
            text: 'Создать защиту',
            requirements: { skill: 65 },
            effects: { skill: 20, reputation: 25 },
            next: 'create_protection'
        }
    ]
},

{
    id: 'destroy_knowledge',
    type: 'special',
    stage: 4,
    title: '🔥 Уничтожение знаний',
    text: 'Ты уничтожаешь опасные знания, чтобы они не попали в чужие руки.',
    choices: [
        {
            text: 'Сжечь все записи',
            requirements: {},
            effects: { reputation: 20, obsession: -25 },
            next: 'burn_records'
        },
        {
            text: 'Сохранить часть',
            requirements: {},
            effects: { obsession: -10, skill: 10 },
            next: 'partial_preservation'
        },
        {
            text: 'Передать Валар',
            requirements: { reputation: 70 },
            effects: { reputation: 35, light: 20 },
            next: 'give_to_valar'
        }
    ]
}
```

## События Этапа 4-5 (Продвинутые события)

```javascript
// === ГНОМЬИ СЕКРЕТЫ ===
{
    id: 'apply_dwarf_techniques',
    type: 'special',
    stage: 5,
    title: '⚒️ Применение гномьих техник',
    text: 'Древние техники гномов преображают твою работу.',
    choices: [
        {
            text: 'Усилить прочность',
            requirements: {},
            effects: { skill: 30 },
            next: 'enhanced_durability'
        },
        {
            text: 'Увеличить красоту',
            requirements: { skill: 75 },
            effects: { skill: 25, reputation: 20 },
            next: 'enhanced_beauty'
        },
        {
            text: 'Добавить руны',
            requirements: { skill: 80 },
            effects: { skill: 35 },
            next: 'runic_enhancement'
        }
    ]
},

{
    id: 'merge_techniques',
    type: 'legendary',
    stage: 5,
    title: '🔄 Слияние техник',
    text: 'Гномьи и эльфийские техники сливаются в нечто новое.',
    choices: [
        {
            text: 'Создать гибридный метод',
            requirements: {},
            effects: { skill: 35 },
            next: 'hybrid_method'
        },
        {
            text: 'Превзойти обе школы',
            requirements: { skill: 85 },
            effects: { skill: 40 },
            next: 'transcend_schools'
        },
        {
            text: 'Основать новую традицию',
            requirements: { reputation: 75 },
            effects: { reputation: 40 },
            next: 'new_tradition'
        }
    ]
},

{
    id: 'keep_dwarf_secret',
    type: 'normal',
    stage: 5,
    title: '🤐 Хранение секрета',
    text: 'Ты хранишь гномьи секреты, уважая доверие.',
    choices: [
        {
            text: 'Использовать тайно',
            requirements: {},
            effects: { skill: 25, obsession: 15 },
            next: 'secret_use'
        },
        {
            text: 'Никогда не использовать',
            requirements: {},
            effects: { reputation: 30 },
            next: 'never_use'
        },
        {
            text: 'Вернуть гномам',
            requirements: {},
            effects: { reputation: 40 },
            next: 'return_to_dwarves'
        }
    ]
},

// === СОВМЕСТНЫЙ ПРОЕКТ ===
{
    id: 'silmaril_foundation',
    type: 'legendary',
    stage: 5,
    title: '💎 Основа Сильмарилла',
    text: 'Вместе с гномами вы создаёте идеальную основу для Сильмарилла.',
    choices: [
        {
            text: 'Продолжить вместе',
            requirements: {},
            effects: {},
            next: 'continue_together_ending'
        },
        {
            text: 'Завершить самому',
            requirements: { obsession: 60 },
            effects: { obsession: 30 },
            next: 'finish_alone'
        },
        {
            text: 'Создать три основы',
            requirements: { resources: 75 },
            effects: {},
            next: 'triple_foundation_ending'
        }
    ]
},

{
    id: 'support_artifacts',
    type: 'special',
    stage: 5,
    title: '🛠️ Вспомогательные артефакты',
    text: 'Артефакты, усиливающие процесс создания Сильмариллов.',
    choices: [
        {
            text: 'Корона концентрации',
            requirements: {},
            effects: { skill: 25, obsession: 15 },
            next: 'concentration_crown'
        },
        {
            text: 'Перчатки мастера',
            requirements: {},
            effects: { skill: 30 },
            next: 'master_gloves'
        },
        {
            text: 'Амулет света',
            requirements: { light: 60 },
            effects: { light: 35 },
            next: 'light_amulet'
        }
    ]
},

{
    id: 'student_exchange',
    type: 'normal',
    stage: 5,
    title: '🎓 Обмен учениками',
    text: 'Ученики путешествуют между кузницами, обмениваясь знаниями.',
    choices: [
        {
            text: 'Расширить программу',
            requirements: {},
            effects: { reputation: 35 },
            next: 'expand_exchange'
        },
        {
            text: 'Создать академию',
            requirements: { reputation: 80 },
            effects: { reputation: 45 },
            next: 'forge_academy'
        },
        {
            text: 'Выбрать лучшего ученика',
            requirements: {},
            effects: { reputation: 25, skill: 20 },
            next: 'best_student'
        }
    ]
},

// === РЕЗОНАНСНЫЕ ЭКСПЕРИМЕНТЫ ===
{
    id: 'perfect_harmony',
    type: 'legendary',
    stage: 5,
    title: '🎵 Совершенная гармония',
    text: 'Камни поют в идеальной гармонии, создавая музыку сфер.',
    choices: [
        {
            text: 'Записать мелодию',
            requirements: {},
            effects: { inspiration: 35 },
            next: 'record_melody'
        },
        {
            text: 'Усилить до предела',
            requirements: { obsession: 65 },
            effects: { obsession: 35 },
            next: 'maximum_harmony'
        },
        {
            text: 'Создать Сильмарилл-песню',
            requirements: { inspiration: 80, skill: 80 },
            effects: {},
            next: 'singing_silmaril_ending'
        }
    ]
},

{
    id: 'power_dissonance',
    type: 'special',
    stage: 5,
    title: '⚡ Силовой диссонанс',
    text: 'Намеренный диссонанс создаёт невероятную силу.',
    choices: [
        {
            text: 'Контролировать хаос',
            requirements: { skill: 75 },
            effects: { skill: 30, obsession: 25 },
            next: 'controlled_chaos'
        },
        {
            text: 'Отпустить на волю',
            requirements: { obsession: 70 },
            effects: { obsession: 40 },
            next: 'unleash_chaos'
        },
        {
            text: 'Гармонизировать',
            requirements: { light: 65 },
            effects: { light: 30 },
            next: 'harmonize_dissonance'
        }
    ]
},

{
    id: 'stone_music',
    type: 'legendary',
    stage: 5,
    title: '🎼 Музыка камней',
    text: 'Ты записываешь музыку, которую создают резонирующие камни.',
    choices: [
        {
            text: 'Создать симфонию',
            requirements: {},
            effects: { inspiration: 40, reputation: 30 },
            next: 'stone_symphony'
        },
        {
            text: 'Использовать в творении',
            requirements: { skill: 75 },
            effects: {},
            next: 'musical_creation_ending'
        },
        {
            text: 'Подарить миру',
            requirements: {},
            effects: { reputation: 50 },
            next: 'gift_music'
        }
    ]
},

// === ЛУННАЯ МАТРИЦА ===
{
    id: 'fill_matrix',
    type: 'special',
    stage: 5,
    title: '✨ Заполнение матрицы',
    text: 'Матрица наполняется чистым светом.',
    choices: [
        {
            text: 'Медленное наполнение',
            requirements: {},
            effects: { light: 30, skill: 20 },
            next: 'slow_filling'
        },
        {
            text: 'Мгновенный всплеск',
            requirements: { obsession: 65 },
            effects: { obsession: 30, light: 40 },
            next: 'instant_burst'
        },
        {
            text: 'Ритмичные волны',
            requirements: { inspiration: 70 },
            effects: { inspiration: 25, light: 35 },
            next: 'rhythmic_waves'
        }
    ]
},

{
    id: 'complex_matrix',
    type: 'legendary',
    stage: 5,
    title: '🔷 Сложная матрица',
    text: 'Многоуровневая структура невероятной сложности.',
    choices: [
        {
            text: 'Добавить измерения',
            requirements: { skill: 80 },
            effects: { skill: 35 },
            next: 'multidimensional'
        },
        {
            text: 'Создать фрактал',
            requirements: { inspiration: 75 },
            effects: { inspiration: 30 },
            next: 'fractal_matrix'
        },
        {
            text: 'Завершить Сильмарилл',
            requirements: { skill: 85, light: 75 },
            effects: {},
            next: 'matrix_silmaril_ending'
        }
    ]
},

// === РЕДКИЕ МЕТАЛЛЫ ===
{
    id: 'metal_properties',
    type: 'special',
    stage: 5,
    title: '🔬 Свойства металлов',
    text: 'Металлы открывают тебе свои тайные свойства.',
    choices: [
        {
            text: 'Память формы',
            requirements: {},
            effects: { skill: 30 },
            next: 'shape_memory'
        },
        {
            text: 'Поглощение света',
            requirements: { light: 60 },
            effects: { light: 25, skill: 25 },
            next: 'light_absorption'
        },
        {
            text: 'Живой металл',
            requirements: { obsession: 65, skill: 75 },
            effects: { obsession: 30 },
            next: 'living_metal'
        }
    ]
},

// === УСОВЕРШЕНСТВОВАНИЕ ОГРАНКИ ===
{
    id: 'light_cutting_fusion',
    type: 'legendary',
    stage: 5,
    title: '✨ Слияние света и огранки',
    text: 'Свет сам направляет твою руку в огранке.',
    choices: [
        {
            text: 'Позволить свету вести',
            requirements: {},
            effects: { light: 35, skill: 25 },
            next: 'light_guided_cutting'
        },
        {
            text: 'Контролировать процесс',
            requirements: { skill: 80 },
            effects: { skill: 40 },
            next: 'controlled_fusion'
        },
        {
            text: 'Создать живую огранку',
            requirements: { inspiration: 80 },
            effects: {},
            next: 'living_cut_ending'
        }
    ]
},

{
    id: 'teaching_mastery',
    type: 'special',
    stage: 5,
    title: '🎓 Мастерство обучения',
    text: 'Ты становишься величайшим учителем искусства огранки.',
    choices: [
        {
            text: 'Создать наследие',
            requirements: {},
            effects: { reputation: 45 },
            next: 'create_legacy'
        },
        {
            text: 'Выбрать преемника',
            requirements: {},
            effects: { reputation: 35 },
            next: 'choose_heir'
        },
        {
            text: 'Распространить знание',
            requirements: {},
            effects: { reputation: 50 },
            next: 'spread_knowledge'
        }
    ]
},

// === ДУША И КАМЕНЬ ===
{
    id: 'stabilize_soul_stone',
    type: 'legendary',
    stage: 5,
    title: '⚖️ Стабилизация души-камня',
    text: 'Баланс между душой и камнем достигнут.',
    choices: [
        {
            text: 'Закрепить навечно',
            requirements: {},
            effects: {},
            next: 'eternal_soul_bond_ending'
        },
        {
            text: 'Сохранить гибкость',
            requirements: {},
            effects: {},
            next: 'flexible_soul_ending'
        },
        {
            text: 'Разделить на три',
            requirements: { skill: 85 },
            effects: {},
            next: 'triple_soul_ending'
        }
    ]
},

{
    id: 'soul_retrieval',
    type: 'special',
    stage: 5,
    title: '🔄 Возвращение души',
    text: 'Ты пытаешься вернуть часть души из камня.',
    choices: [
        {
            text: 'Взять силой',
            requirements: { obsession: 70 },
            effects: { obsession: -30 },
            next: 'force_retrieval'
        },
        {
            text: 'Договориться с камнем',
            requirements: { inspiration: 75 },
            effects: { inspiration: 30 },
            next: 'negotiate_stone'
        },
        {
            text: 'Принять потерю',
            requirements: {},
            effects: { obsession: -20, light: 30 },
            next: 'accept_loss'
        }
    ]
},

// === СВЕТ И МАСТЕРСТВО ===
{
    id: 'light_teaching',
    type: 'special',
    stage: 5,
    title: '🌟 Обучение свету',
    text: 'Ты учишь других работать с чистым светом.',
    choices: [
        {
            text: 'Массовое обучение',
            requirements: {},
            effects: { reputation: 40 },
            next: 'mass_teaching'
        },
        {
            text: 'Индивидуальный подход',
            requirements: {},
            effects: { reputation: 30, skill: 20 },
            next: 'individual_teaching'
        },
        {
            text: 'Создать орден света',
            requirements: { reputation: 80, light: 70 },
            effects: {},
            next: 'light_order_ending'
        }
    ]
},

{
    id: 'light_forms',
    type: 'legendary',
    stage: 5,
    title: '🎨 Формы света',
    text: 'Ты создаёшь невиданные формы из чистого света.',
    choices: [
        {
            text: 'Световые скульптуры',
            requirements: {},
            effects: { reputation: 35, light: 25 },
            next: 'light_sculptures'
        },
        {
            text: 'Живые конструкции',
            requirements: { inspiration: 80 },
            effects: {},
            next: 'living_light_ending'
        },
        {
            text: 'Архитектура света',
            requirements: { skill: 80 },
            effects: { skill: 35 },
            next: 'light_architecture'
        }
    ]
},

// === ЯВАННА ===
{
    id: 'immediate_use',
    type: 'normal',
    stage: 5,
    title: '⚡ Немедленное использование',
    text: 'Дар Яванны немедленно вплетается в творение.',
    choices: [
        {
            text: 'Создать один совершенный',
            requirements: {},
            effects: {},
            next: 'perfect_single_ending'
        },
        {
            text: 'Создать три обычных',
            requirements: {},
            effects: {},
            next: 'three_normal_ending'
        },
        {
            text: 'Экспериментировать',
            requirements: { obsession: 60 },
            effects: { obsession: 30 },
            next: 'experiment_with_gift'
        }
    ]
},

{
    id: 'preserve_gift',
    type: 'special',
    stage: 5,
    title: '💎 Сохранённый дар',
    text: 'Ты бережно хранишь дар для идеального момента.',
    choices: [
        {
            text: 'Дождаться знака',
            requirements: {},
            effects: { inspiration: 30 },
            next: 'wait_for_sign'
        },
        {
            text: 'Усилить другими дарами',
            requirements: { resources: 70 },
            effects: {},
            materials: ['starDust', 'valarBlessing'],
            next: 'combine_gifts'
        },
        {
            text: 'Использовать на пике сил',
            requirements: { skill: 85, light: 80 },
            effects: {},
            next: 'peak_creation_ending'
        }
    ]
},

{
    id: 'greedy_request',
    type: 'normal',
    stage: 5,
    title: '😈 Жадная просьба',
    text: 'Яванна разочарована твоей жадностью, но даёт последний шанс.',
    choices: [
        {
            text: 'Извиниться и принять',
            requirements: {},
            effects: { obsession: -10, reputation: 10 },
            materials: ['treeEssence'],
            next: 'apologize_accept'
        },
        {
            text: 'Настаивать',
            requirements: { obsession: 75 },
            effects: { obsession: 40, reputation: -30 },
            next: 'insist_more'
        },
        {
            text: 'Отказаться от всего',
            requirements: {},
            effects: { obsession: -30, light: 20 },
            next: 'refuse_all'
        }
    ]
}
```

## События Этапа 5-6 (Финальные подготовки)

```javascript
// === УНИКАЛЬНАЯ ОГРАНКА ===
{
    id: 'apply_unique_cut',
    type: 'legendary',
    stage: 6,
    title: '💎 Применение уникальной огранки',
    text: 'Огранка делает Сильмариллы самосветящимися.',
    choices: [
        {
            text: 'Завершить творение',
            requirements: {},
            effects: {},
            next: 'unique_cut_ending'
        },
        {
            text: 'Усовершенствовать дальше',
            requirements: { skill: 90 },
            effects: {},
            next: 'beyond_perfection_ending'
        },
        {
            text: 'Создать вариации',
            requirements: {},
            effects: {},
            next: 'variations_ending'
        }
    ]
},

{
    id: 'perfect_unique_cut',
    type: 'legendary',
    stage: 6,
    title: '✨ Совершенная уникальная огранка',
    text: 'Техника достигла абсолютного совершенства.',
    choices: [
        {
            text: 'Создать шедевр',
            requirements: {},
            effects: {},
            next: 'masterpiece_ending'
        },
        {
            text: 'Превзойти возможное',
            requirements: { obsession: 80 },
            effects: {},
            next: 'impossible_creation_ending'
        },
        {
            text: 'Сохранить для будущего',
            requirements: {},
            effects: {},
            next: 'future_legacy_ending'
        }
    ]
},

{
    id: 'teach_unique_cut',
    type: 'special',
    stage: 6,
    title: '🎓 Обучение уникальной огранке',
    text: 'Ты передаёшь секрет величайшего мастерства.',
    choices: [
        {
            text: 'Обучить одного',
            requirements: {},
            effects: {},
            next: 'single_student_ending'
        },
        {
            text: 'Создать школу',
            requirements: {},
            effects: {},
            next: 'cutting_school_ending'
        },
        {
            text: 'Оставить записи',
            requirements: {},
            effects: {},
            next: 'written_legacy_ending'
        }
    ]
},

// === ДРЕВЕСНАЯ ЭССЕНЦИЯ ===
{
    id: 'triple_creation',
    type: 'legendary',
    stage: 6,
    title: '3️⃣ Тройное творение',
    text: 'Сила достаточна для трёх Сильмариллов одновременно.',
    choices: [
        {
            text: 'Создать одинаковые',
            requirements: {},
            effects: {},
            next: 'identical_three_ending'
        },
        {
            text: 'Создать разные',
            requirements: {},
            effects: {},
            next: 'different_three_ending'
        },
        {
            text: 'Создать связанные',
            requirements: {},
            effects: {},
            next: 'linked_three_ending'
        }
    ]
},

// === ПОМОЩЬ ВАЛАР ===
{
    id: 'negotiate_valar',
    type: 'legendary',
    stage: 6,
    title: '💬 Переговоры с Валар',
    text: 'Ты торгуешься с богами об условиях помощи.',
    choices: [
        {
            text: 'Принять компромисс',
            requirements: {},
            effects: {},
            next: 'compromise_ending'
        },
        {
            text: 'Получить всё',
            requirements: { reputation: 95 },
            effects: {},
            next: 'everything_ending'
        },
        {
            text: 'Отказаться',
            requirements: {},
            effects: {},
            next: 'refuse_valar_ending'
        }
    ]
},

{
    id: 'reject_valar',
    type: 'legendary',
    stage: 6,
    title: '🚫 Отвержение Валар',
    text: 'Ты отвергаешь помощь богов, полагаясь только на себя.',
    choices: [
        {
            text: 'Создать вопреки',
            requirements: {},
            effects: {},
            next: 'defiant_creation_ending'
        },
        {
            text: 'Найти иной путь',
            requirements: {},
            effects: {},
            next: 'alternative_path_ending'
        },
        {
            text: 'Превзойти богов',
            requirements: { obsession: 90, skill: 95 },
            effects: {},
            next: 'surpass_gods_ending'
        }
    ]
},

// === ДУША И ТВОРЕНИЕ ===
{
    id: 'partial_preservation',
    type: 'special',
    stage: 6,
    title: '🧩 Частичное сохранение',
    text: 'Ты сохраняешь часть себя, отдавая остальное творению.',
    choices: [
        {
            text: 'Сохранить разум',
            requirements: {},
            effects: {},
            next: 'preserve_mind_ending'
        },
        {
            text: 'Сохранить сердце',
            requirements: {},
            effects: {},
            next: 'preserve_heart_ending'
        },
        {
            text: 'Сохранить волю',
            requirements: {},
            effects: {},
            next: 'preserve_will_ending'
        }
    ]
},

{
    id: 'soul_division',
    type: 'legendary',
    stage: 6,
    title: '✂️ Разделение души',
    text: 'Твоя душа разделяется между тремя Сильмариллами.',
    choices: [
        {
            text: 'Равное деление',
            requirements: {},
            effects: {},
            next: 'equal_division_ending'
        },
        {
            text: 'Основная часть в одном',
            requirements: {},
            effects: {},
            next: 'main_soul_ending'
        },
        {
            text: 'Разные аспекты',
            requirements: {},
            effects: {},
            next: 'aspect_division_ending' 
