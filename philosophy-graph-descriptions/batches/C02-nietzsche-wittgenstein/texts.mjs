// Заход C02. Задаётся ТОЛЬКО заголовочная часть; сборка — mkedits.mjs.
export const HEAD = {

// ——— принимающая система: Ницше ———
'dionysian|ataraxia|oppose': 'Невозмутимость умалена до боязни жить',
'eternal_return|clinamen|dialogue': 'Необходимости нужен зазор, иначе всё предрешено',
'amor_fati|eternal_return|influence': 'Утверждению жизни нужна была мера, которую нельзя подделать',
'conatus|will_power|develop': 'Перенято, что живое определяется своим усилием, а не своей формой',
'dionysian|noble_savage|dialogue': 'Судить об обществе оба взялись от его начала',
'master_morality|categorical|critique': 'Удар направлен не в содержание правила, а в его притязание на всеобщность',
'god_dead|absolute_idea|critique': 'Отнято то, чем система обеспечивала себе завершение',
'potencies|will_power|influence': 'Наличному бытию нечем было объяснить, откуда берётся сила',
'ubermensch|denial_will|oppose': 'Отказ от воли умалён до последнего убежища того же отчаяния',
'will_power|will_schop|oppose': 'У воли отняты единство и безразличие к цели',
'perspectivism|ideology|typological': 'Понадобилось объяснить, отчего мысль расходится с положением дел',

// ——— Мейнонг ———
'immanent_objectivity|non_existent_objects|develop': 'Перенято, что у всякого акта есть предмет, а запрет на исключения снят',
'intentionality_brentano|object_theory|develop': 'Признак психического взят как основание целой науки',

// ——— Фрейд ———
'will_schop|unconscious|develop': 'Метафизика отброшена, а её сердцевина оставлена',
'psychical_physical|id_ego_superego|influence': 'Перенята самостоятельность душевного, но не описательная сдержанность',

// ——— Гуссерль ———
'eidos|eidetic|develop': 'Сущности нужно было место, не требующее второго мира',
'cogito|transcendental_ego|synthesize': 'Науке требовалось начало, которое само не входит в мир',
'petites_perceptions|lifeworld|influence': 'Неосознанное перестало быть малой величиной и стало почвой',
'transcendental|transcendental_ego|synthesize': 'Выведенным формам недоставало того, что можно предъявить',
'descriptive_psychology|eidetic|develop': 'Науке о сознании нужно было выйти за пределы отдельных случаев',
'evidence_brentano|evidence|develop': 'Признаку истинности недоставало того, чем он держится',
'intentionality_brentano|intentionality|develop': 'Понятие взято под тем же именем, но предмет вынут из акта',
'phenomenology|firstness|typological': 'Начинать решено с того, что ещё ничем не истолковано',
'semiosis|intentionality|typological': 'Общей оказалась сама форма отсылания, а не предмет',
'sense_reference|intentionality|influence': 'Разбор психологизма подействовал прежде, чем был принят',

// ——— Бергсон ———
'conatus|elan_vital|influence': 'Механическому объяснению жизни недоставало источника нового',
'intellectual_love|intuition_bergson|influence': 'Понадобился род знания, не разлагающий предмет на части',
'duree|erlebnis|typological': 'Времени, не заимствованного у физики, недоставало обоим',
'intuition_bergson|verstehen|typological': 'Объяснение оказалось негодным там, где предмет сам есть жизнь',

// ——— Дьюи ———
'experience_dewey|lifeworld|typological': 'Науке понадобилось указать почву, на которой она сама стоит',

// ——— Уайтхед ———
'creativity_whitehead|the_one|dialogue': 'Началу положено быть таким, чтобы под определения не подпадать',
'monads|actual_occasion|develop': 'Физике нужны были единицы, которые совершаются, а не пребывают',
'perception_monad|prehension|develop': 'Согласию единиц требовалась причина, а не предустановленность',
'creativity_whitehead|will_power|typological': 'Мысль о неподвижной основе подвела и того, и другого',
'process_reality|eternal_return|typological': 'Схождение вышло из общего отказа считать вещь первичной',

// ——— Рассел ———
'russell_paradox|logicism|critique': 'Удар пришёлся не в частность, а в самое допущение о свободном образовании множеств',
'theory_descriptions|non_existent_objects|critique': 'Отнято допущение, ради которого предметы и умножались',

// ——— Кассирер ———
'schematism|symbolic_forms|develop': 'Мифу, языку и искусству недоставало собственной законности',

// ——— Витгенштейн ———
'possible_worlds|logical_space|influence': 'Логике нужна была область, очерченная прежде всякого факта',
'aesthetics_schop|limits_language|influence': 'Усвоено, что за пределом представления что-то остаётся',
'showing_saying|pragmatic_maxim|typological': 'Смысл вынесен за пределы самой фразы',
'sense_reference|picture_theory|influence': 'Предложению требовался смысл, не зависящий от того, истинно оно или ложно',
'logical_atomism|picture_theory|influence': 'Разложение на простое усвоено, но к нему прибавлено условие соответствия',
'language_game|symbolic_forms|typological': 'Схождение вышло из общего разрыва с называнием',
'symbolic_forms|form_of_life|typological': 'Объяснить смысл, не выходя к вещи, понадобилось обоим',
};

// Правка самой первой фразы там, где иначе выходит повтор с заголовком.
export const TAIL = {
 'master_morality|categorical|critique': 'она выдаёт стадный инстинкт',
 'potencies|will_power|influence': 'бытие мыслится как ступени напряжения, а не как наличность',
 'will_power|will_schop|oppose': 'она не едина и не слепа',
 'intentionality_brentano|object_theory|develop':
   'учение о том, на что направлены акты, обособляется в самостоятельную дисциплину',
 'eidos|eidetic|develop': 'она становится предметом особого акта, а не обитателем особого мира',
 'evidence_brentano|evidence|develop': 'он становится способом, каким предмет присутствует',
 'semiosis|intentionality|typological': 'и знак, и акт сознания устроены как указание на иное',
 'sense_reference|intentionality|influence':
   'направленность отделяется от предмета и получает собственное содержание',
 'duree|erlebnis|typological': 'оно берётся, как дано изнутри жизни, а не измерено извне',
 'intuition_bergson|verstehen|typological': 'доступ к нему идёт через совпадение, а не через объяснение',
 'experience_dewey|lifeworld|typological': 'дорефлективное берётся как основа теории',
 'showing_saying|pragmatic_maxim|typological': 'он отыскивается вне высказанного',
 'sense_reference|picture_theory|influence': 'он отделён от истинностного значения',
 'symbolic_forms|form_of_life|typological': 'он держится укладом, внутри которого возникает',
};
