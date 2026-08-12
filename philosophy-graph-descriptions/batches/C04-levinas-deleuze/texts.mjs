// Заход C04. Задаётся ТОЛЬКО заголовочная часть; сборка — mkedits.mjs.
export const HEAD = {

// ——— принимающая система: Левинас ———
'face|eidos|dialogue': 'Обоим нужно, чтобы видимое отсылало дальше себя',
'infinite_idea|infinity_levinas|develop': 'Превосходству нужно было явиться в опыте, а не только в доказательстве',
'ethics_first_philosophy|absolute_idea|critique': 'Совершенство системы обращено в обвинение',
'other_levinas|transcendental_ego|critique': 'Оспорен приём, которым феноменология добывала другого',
'elan_vital|infinity_levinas|influence': 'Бесконечности нужен был образец переполнения, а не величины',
'ethics_first_philosophy|sein|critique': 'Спор идёт о том, что стоит в начале философии',
'other_levinas|sorge|critique': 'Оспорено, что из отношения к себе можно выйти к другому',
'transgression|other_levinas|dialogue': 'Обоим понадобилось то, что не вмещается в порядок',
'ethics_first_philosophy|freedom_sartre|critique': 'Свободе отказано в праве быть первой',
'face|look|oppose': 'Встреча умалена до поединка — или возвышена до призыва',
'other_levinas|look|oppose': 'Одно и то же событие прочитано с обратным знаком',
'responsibility|freedom_sartre|oppose': 'Порядок между свободой и долгом обращён вспять',

// ——— Мерло-Понти ———
'flesh|id_ego_superego|dialogue': 'Обоим понадобилось провести черту внутри самого опыта',
'epoché|perception_phenomenology|develop': 'Отступить из мира оказалось некуда',
'intentionality|lived_body|develop': 'Понятие перенесено из акта в движение',
'lived_body|language_game|dialogue': 'Правилу в уме отказано с двух сторон',
'being_in_world|lived_body|develop': 'Вплетённости недоставало того, чем она держится',
'chiasm|three_registers|dialogue': 'Обоим нужно объяснить, отчего несводимое всё же сцеплено',
'flesh|mirror_stage|dialogue': 'Самость выводится извне и там, и здесь, но извне разного',
'perception_phenomenology|nothingness|dialogue': 'Воплощённость сознания оспаривает его чистоту',

// ——— Куайн ———
'inscrutability_reference|sense_reference|critique': 'Удар нанесён доводами о поведении, а не логическими',
'naturalized_epistemology|being_in_world|typological': 'Тупик обоснования вывел обоих к одному отказу',
'verification_principle|two_dogmas|oppose': 'Единица проверки оказалась крупнее, чем думали',

// ——— Делёз ———
'difference|ideas|critique': 'Опрокинуть надо не выводы, а самый порядок соподчинения',
'haecceitas|difference|influence': 'Различию требовался предок, у которого единичность не выводится из рода',
'univocity_being|difference|influence': 'Онтологии различия нужно было основание, снимающее старшинство родов',
'substance_spinoza|difference|develop': 'Однозначность доведена до отказа от всякой ступени между началом и его состояниями',
'monads|fold|develop': 'Замкнутость единицы снята, а её точка зрения оставлена',
'difference|dialectic|critique': 'Оспорено обещание примирения, которым движение и держится',
'ideology|deterritorialization|influence': 'Вопрос о закреплении общественных форм перенят, а задача срывать маски снята',
'assemblage|semiosis|dialogue': 'Обоим понадобилось целое без образующего его правила',
'difference|thirdness|dialogue': 'Спор идёт о том, что стоит прежде отношения',
'desiring_machines|unconscious|critique': 'Оспорена сцена, на которой психоанализ разыгрывал желание',
'creative_evolution|multiplicity|develop': 'Дифференциация взята, а порыв, который её вёл, оставлен позади',
'creative_evolution|virtual_actual|influence': 'Новому нужно было перестать быть обманом зрения',
'duree|difference|influence': 'Различию требовался источник, не предполагающий двух готовых вещей',
'duree|rhizome|influence': 'Связям нужно было устройство, в котором нет ни начала, ни старшинства',
'elan_vital|desiring_machines|influence': 'Желанию нужно было перестать быть ответом на нехватку',
'matter_memory|virtual_actual|influence': 'Память понадобилась не как хранилище, а как способ быть',
'actual_occasion|event|influence': 'Пребыванию отказано в первенстве перед совершением',
'desire_other|desiring_machines|dialogue': 'Спор о желании разошёлся в самом его определении',
'three_registers|rhizome|dialogue': 'Обоим нужно множество, которое не рассыпается',
'three_registers|body_without_organs|dialogue': 'Порядку положен предел, за которым он ничего не размечает',
'nothingness|body_without_organs|dialogue': 'Бесформенное прочитано как нехватка — или как полнота',
'infinity_levinas|multiplicity|typological': 'Целое отвергнуто с двух сторон порознь',
'other_levinas|difference|typological': 'Порознь пришли к одному повороту против тождества',
'virtual_actual|reversibility|dialogue': 'Обоим понадобилось назвать то, что действует, не показываясь',
};

// Правка самой первой фразы там, где иначе выходит повтор с заголовком.
export const TAIL = {
 'transgression|other_levinas|dialogue': 'спор идёт о том, чем он размыкается',
 'responsibility|freedom_sartre|oppose': 'спор идёт о том, что в человеке первое',
 'flesh|id_ego_superego|dialogue': 'спрашивают, где проходит граница между мной и не-мной',
 'being_in_world|lived_body|develop': 'она получает телесное основание',
 'chiasm|three_registers|dialogue': 'спрашивают, чем держится перекрещивание разнородного',
 'perception_phenomenology|nothingness|dialogue': 'спор идёт о том, чем сознание отличается от вещи',
 'naturalized_epistemology|being_in_world|typological':
   'теории познания отказано в первенстве с двух концов одной традиции',
 'verification_principle|two_dogmas|oppose': 'спор идёт о том, проверяется ли предложение поодиночке',
 'substance_spinoza|difference|develop': 'единое бытие высказывается о различном',
 'ideology|deterritorialization|influence': 'на место разоблачения встаёт описание подвижности',
 'assemblage|semiosis|dialogue': 'спрашивают, как разнородное складывается вместе',
 'desire_other|desiring_machines|dialogue': 'оно есть нехватка или производство',
 'three_registers|rhizome|dialogue': 'спрашивают, нужна ли для этого структура',
 'three_registers|body_without_organs|dialogue': 'спрашивают, что предшествует различениям',
 'nothingness|body_without_organs|dialogue': 'спрашивают, что стоит за определённостями',
 'infinity_levinas|multiplicity|typological': 'неисчислимое не собирается в единство',
 'other_levinas|difference|typological': 'инаковость первична и не выводится из него',
};
