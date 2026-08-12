// Заход C01. Для каждой связи задаётся ТОЛЬКО заголовочная часть.
// Новое описание собирается как:  HEAD + ': ' + <нынешняя первая фраза со строчной> + ' ' + <вторая фраза дословно>
// Если нужна правка самой первой фразы (во избежание повтора), она задаётся в TAIL.
export const HEAD = {

// ——— принимающая система: Плотин ———
'ideas|nous|develop': 'Умопостигаемое усвоено как истинно сущее, но помещено иначе',
'emanation|atoms_void|oppose': 'Отвергнуто самое устройство возникновения',

// ——— Августин ———
'tripartite_soul|two_cities|influence': 'Перенято не число частей души, а правило деления по властвующему',
'emanation|two_cities|influence': 'Перешёл порядок, в котором низшее обязано высшему',

// ——— Ансельм ———
'faith_reason|faith_seeking_understanding|develop': 'Речение принято целиком, но переменило службу',

// ——— Фома Аквинский ———
'eidos|essence_existence|influence': 'Отдельная умопостигаемая суть удержана как самостоятельное начало',
'methexis|participatio|develop': 'Понадобилось объяснить, чем тварное держится, не вводя отдельных образцов',
'act_potency|actual_being|develop': 'Тварное надо было отличить от Бога, не разводя их по родам',
'act_potency|essence_existence|influence': 'Пара возможного и действительного приложена к вопросу, для которого не создавалась',
'entelechy|actual_being|influence': 'Унаследована мысль о полноте, в которой вещь достигает себя',

// ——— Декарт ———
'anamnesis|innate_ideas|influence': 'Иначе достоверность пришлось бы искать в чувствах',
'time_augustine|res_cogitans|influence': 'Усвоен приём самонаблюдения, а не учение о времени',
'clear_distinct|idols_cave|dialogue': 'Обоим нужно расчистить место до всякого знания',

// ——— Спиноза ———
'univocity_being|substance_spinoza|influence': 'Однозначность сказывания о сущем принята вместе с её доводом, но не с её мерой',
'res_cogitans|substance_spinoza|synthesize': 'Двум субстанциям нечем было бы объяснить своё согласие',
'res_extensa|substance_spinoza|synthesize': 'Совпадение порядка вещей с порядком идей требовало общего источника',

// ——— Локк ———
'simple_ideas|clear_distinct|dialogue': 'Оба разлагают знание до неделимого, но упираются в разное',

// ——— Лейбниц ———
'demiurge|best_worlds|develop': 'Творцу нужно стало основание выбирать, а не только упорядочивать',
'four_causes|sufficient_reason|develop': 'Разрядов причин недостало для вопроса, почему есть нечто, а не ничто',

// ——— Беркли ———
'immaterialism|res_extensa|critique': 'Отвергнуто не протяжение, а то, что за ним предполагают',
'immaterialism|substance_locke|critique': 'Под сомнение поставлено допущение, без которого эмпиризм думал не обойтись',
'immaterialism|primary_qualities|critique': 'Стёрта граница между тем, что вещи присуще, и тем, что ей приписано',

// ——— Юм ———
'simple_ideas|impressions|develop': 'Удержана мысль о неразложимом начале опыта, но проведена черта, которой не было',

// ——— Руссо ———
'social_contract_locke|social_contract|develop': 'Подхвачен сам ход через договор, но отнята его цель',

// ——— Кант ———
'categories|transcendental|develop': 'Продолжено допущение, что рассудок располагает готовым набором понятий',
'antinomies|sufficient_reason|critique': 'Оспорена не сила правила, а его область',
'monads|thing_itself|influence': 'Явлению нужно было основание, которое само не явление',
'apriori|custom|critique': 'Объяснение, принятое за исчерпывающее, признано недостаточным',
'causality_critique|synthetic_apriori|influence': 'Довод против выводимости причинности принят целиком, а вывод перевёрнут',
'general_will|autonomy|influence': 'Долгу требовалось основание, не заимствованное ни у Бога, ни у природы',

// ——— Фихте ———
'cogito|absolute_ego|develop': 'Началу системы нужно было быть не найденным, а произведённым',
'transcendental|absolute_ego|develop': 'Условия опыта унаследованы, но не их разрозненность',

// ——— Гегель ———
'substance_spinoza|absolute_idea|influence': 'Системе требовался безусловный исход, а не ряд предпосылок',
'absolute_ego|absolute_idea|synthesize': 'Самодвижение начала удержано, но снята его односторонность',

// ——— Шеллинг ———
'natura_naturans|naturphilosophie|develop': 'Механике нечем было объяснить, откуда берутся новые формы',
'substance_spinoza|absolute_identity|influence': 'Духу и природе нужен был общий корень, а не соответствие друг другу',
'thing_itself|absolute_identity|develop': 'Граница познания сохранена, но перенесена туда, где нечего познавать',
'absolute_ego|absolute_identity|develop': 'Требование единого начала принято, но Я в этой должности отвергнуто',
'absolute_identity|absolute_idea|synthesize': 'Безразличие принято как исход и отвергнуто как итог',

// ——— Шопенгауэр ———
'will_schop|stoic_reason|oppose': 'Согласие мира с разумом отвергнуто в самом основании',
'will_schop|absolute_idea|critique': 'Отнято то, ради чего система и строилась',

// ——— Кьеркегор ———
'individual|absolute_idea|critique': 'Полнота, которой система гордится, оказывается неполной',
'individual|weltgeist|oppose': 'Всеобщее умаляется до того, что никого не вмещает',
'subjective_truth|weltgeist|oppose': 'Ход истории перестаёт быть мерой истины',

// ——— Маркс ———
'alienation|property_theory|critique': 'Оспорено не начало, а вывод из него',
'base_superstructure|objective_spirit|critique': 'Установлениям отказано в том, чтобы иметь мысль своим источником',
'dialectic|historical_materialism|develop': 'Движение через противоречие перенято, но отнят его носитель',
'entfremdung|alienation|influence': 'Усвоено строение утраты себя в собственном произведении',
'master_slave|class_struggle|develop': 'Борьбе за признание недоставало предмета, за который борются',
'praxis|absolute_idea|critique': 'Мысли отказано в праве быть себе судьёй',

// ——— Дильтей ———
'historical_reason|transcendental|critique': 'Отнята вневременность у того, кто ставит условия',
'objective_spirit|objective_spirit_dilthey|develop': 'Наукам о духе нужен был предмет, который понимают, а не выводят',
'geisteswissenschaften|positive_knowledge|critique': 'Единство метода, на котором держался позитивизм, признано мнимым',
};

// Правка самой первой фразы там, где иначе выходит повтор с заголовком.
// Ключ -> новая первая фраза (со строчной буквы, без завершающей точки).
export const TAIL = {
 'tripartite_soul|two_cities|influence':
   'различение по тому, что в человеке взяло верх, распространено на историю целиком',
 'eidos|essence_existence|influence':
   'чтойность вещи отделяется от того, что она вообще есть',
 'act_potency|essence_existence|influence':
   'в сотворённом сущность и существование не совпадают',
 'entelechy|actual_being|influence':
   'осуществлённость делается ключевым понятием и переносится с формы на бытие',
 'univocity_being|substance_spinoza|influence':
   'введённая ради доказательств о Боге, она даёт больше, чем предполагалось',
 'simple_ideas|clear_distinct|dialogue':
   'спор идёт о том, чем кончается разложение знания на составные части',
 'clear_distinct|idols_cave|dialogue':
   'два способа избавиться от того, что мешает видеть',
 'four_causes|sufficient_reason|develop':
   'перечень сжимается в одно требование, обращённое к чему угодно',
 'simple_ideas|impressions|develop':
   'элемент опыта получает более строгое имя и делится надвое',
 'monads|thing_itself|influence':
   'простое, стоящее за ним, перенято вместе с различением внутреннего и являющегося',
 'transcendental|absolute_ego|develop':
   'найденное у Канта возводится к единому началу и выводится из него',
 'substance_spinoza|absolute_identity|influence':
   'единство прежде их различия перенято вместе с самим монизмом',
 'will_schop|stoic_reason|oppose':
   'там не логос, а слепое стремление',
 'individual|absolute_idea|critique':
   'в ней нет места для того, кто существует',
 'individual|weltgeist|oppose':
   'существующий человек в нём не растворяется',
};
