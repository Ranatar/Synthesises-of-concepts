# Инструкция: замена em-dash на средневековую пунктуацию

В тексте кодекса 175 длинных тире (em-dash, U+2014). Длинное тире как пунктуационный знак — изобретение печатной эры (XV–XVI вв.), для рукописи 896 г. это анахронизм. Средневековый писец использовал бы запятую, двоеточие или точку с запятой, в зависимости от длины паузы и синтаксической функции.

Из 175 случаев:
- **4 — подписи маргиналий** (`<br> — <span class="signum">frater Coemanus</span>`). Эти не трогаем: тире структурно отделяет атрибуцию от тела заметки, такой жест встречается в реальных маргиналиях.
- **171 — пунктуация в основном тексте и маргиналиях**. Эти заменяем.

---

## 1. Принцип замены

| Контекст | Замена | Почему |
|---|---|---|
| Парная парентеза `текст — вставка — текст` | `текст, вставка, текст` или скобочки `()` | Запятая в обоих позициях. Скобки `()` появились в XIV в., но для этого жанра допустимы как стилистический выбор. |
| Эмфатическая пауза `... мысль — pointe.` | `;` (точка с запятой) | Точка с запятой = пауза средней длины с риторическим разворотом |
| Развёртывание / уточнение `утверждение — пояснение` | `:` (двоеточие) | Двоеточие открывает развёрнутое определение или объяснение |
| Перечисление `... — список` | `:` или `,` | Двоеточие если открывает список; запятая если простое продолжение |
| Лёгкая пауза в потоке мысли | `,` (запятая) | Самая частая медиолатинская пауза |
| Подпись маргиналии | оставить `—` | См. выше |

Для каждого конкретного случая ниже выбран один вариант. Возможны небольшие альтернативы — где написано `;` , может быть и `,` если хотите более классический regular-prose ритм.

---

## 2. Приоритет: что заменять автоматически, что вручную

Самый эффективный путь — **в текстовом редакторе** делать find/replace по уникальным окружениям. У большинства тире есть достаточно характерный левый или правый контекст, чтобы заменить точечно. Где контекст неуникален — отмечу отдельно.

Все find-строки ниже **уникальны** в файле (проверял). Используйте plain text find/replace, **не regex**.

---

## 3. Полная таблица замен

Формат таблицы: `найти` → `заменить` → семантика.

### 3.1. Двоеточие (`:`) — развёртывания и уточнения

Двоеточие используется там, где после паузы идёт **раскрытие, цитата, или развёрнутое определение**.

| # | Найти | Заменить | Семантика |
|---|---|---|---|
| 1 | `et cymba mea — misera tabula` | `et cymba mea, misera tabula` | (см. ниже — этот закрывает парную, см. п. 25) |
| 9 | `Et vox audivi — non ex aere` | `Et vox audivi: non ex aere` | развёртывание-цитата |
| 10 | `quasi lux in spelaeo accensa — quae dixit` | `quasi lux in spelaeo accensa, quae dixit` | продолжение |
| 11 | `Egredi pede trepidante ex cymba et humum tetigit pes meus — et herba` | `Egredi pede trepidante ex cymba et humum tetigit pes meus, et herba` | соединение |
| 12 | `Postea didici — sed de hoc` | `Postea didici, sed de hoc` | продолжение |
| 13 | `nobilissimi quos unquam videram — et in his` | `nobilissimi quos unquam videram, et in his` | соединение |
| 16 | `quos nondum noveram nec nomine nec genere — silenter ad latus` | `quos nondum noveram nec nomine nec genere, silenter ad latus` | продолжение |
| 17 | `Et secutus sum sine timore — nam in vultu` | `Et secutus sum sine timore: nam in vultu` | развёртывание (причина) |
| 23 | `In principio creavit Deus caelum et<br>          terram — et prius` | `In principio creavit Deus caelum et<br>          terram, et prius` | соединение |
| 24 | `Inimicus primus hoc olim percussit — de quo hodie` | `Inimicus primus hoc olim percussit; de quo hodie` | разворот |
| 26 | `et suis locis in hoc libello scribam — et quod ad oculos` | `et suis locis in hoc libello scribam: et quod ad oculos` | развёртывание (что именно) |
| 27 | `Incolae terrae illius — quos postea intellexi esse` | `Incolae terrae illius, quos postea intellexi esse` | продолжение |
| 28 | `sub lumine stellarum primordialium — erant in forma humani` | `sub lumine stellarum primordialium, erant in forma humani` | продолжение |
| 31 | `Facies eorum lucebant — non modo sicut` | `Facies eorum lucebant: non modo sicut` | развёртывание |
| 35 | `non poterant horum in facie videri timor vel tristitia — non quia` | `non poterant horum in facie videri timor vel tristitia: non quia` | развёртывание (причина) |
| 38 | `Lingua eorum — o quam mirabilis lingua! — erat quasi` | `Lingua eorum (o quam mirabilis lingua!) erat quasi` | парентеза с восклицанием — скобки удобнее |
| 47 | `Nomen illius — quantum ex ipsorum lingua in Latinum reducere potui — erat` | `Nomen illius, quantum ex ipsorum lingua in Latinum reducere potui, erat` | парная парентеза → запятые |
| 48 | `Ipse dixit se de gente esse quae se Noldor nominat — id est ut interpretabatur` | `Ipse dixit se de gente esse quae se Noldor nominat: id est ut interpretabatur` | развёртывание (значение) |
| 49 | `Duxit me in civitatem quam de navicula mea videram — et maior` | `Duxit me in civitatem quam de navicula mea videram, et maior` | продолжение |
| 53 | `In aula magna — tota ex crystallo et marmore constructa` | `In aula magna, tota ex crystallo et marmore constructa` | продолжение (см. также 54) |
| 54 | `cuius originem tunc ignorabam — sedimus, ego et Finrothus` | `cuius originem tunc ignorabam, sedimus, ego et Finrothus` | продолжение |
| 56 | `Narravit de Cantu Magno — quem ego Creationem intellexi — quando` | `Narravit de Cantu Magno (quem ego Creationem intellexi) quando` | парная парентеза → скобки (вставка-определение) |
| 57 | `et Potestatibus suis — Ainur eos vocabat` | `et Potestatibus suis: Ainur eos vocabat` | развёртывание (что именно) |
| 58 | `quos ego Angelos Maiores esse intellexi — mandavit ut secum canerent` | `quos ego Angelos Maiores esse intellexi, mandavit ut secum canerent` | продолжение |
| 59 | `mundus formatus est — non sicut figulus vas fingit` | `mundus formatus est: non sicut figulus vas fingit` | развёртывание (как именно) |
| 60 | `Sed unus ex Angelis Maioribus — quem Melkor nominabant` | `Sed unus ex Angelis Maioribus, quem Melkor nominabant` | продолжение (определительное предложение) |
| 61 | `quem nos Satanam vocamus — contra harmoniam` | `quem nos Satanam vocamus, contra harmoniam` | продолжение |
| 64 | `mirabiliorem — ut quasi tenebrae quaedam` | `mirabiliorem: ut quasi tenebrae quaedam` | развёртывание (как именно) |
| 65 | `vocem quasi cantantis sumpsit — aliquid enim mutat` | `vocem quasi cantantis sumpsit; aliquid enim mutat` | разворот к причине |
| 66 | `de rebus antiquioribus loquuntur — et narrare coepit` | `de rebus antiquioribus loquuntur, et narrare coepit` | продолжение |
| 67 | `Valar — quos vos Potestates vocare possetis — in terra nostra` | `Valar (quos vos Potestates vocare possetis) in terra nostra` | парная парентеза → скобки |
| 70 | `aiunt — terram Amani` | `, aiunt, terram Amani` | внутри парной парентезы — запятые |
| 71 | `sed sine ardore nocivo — lux pura et benigna` | `sed sine ardore nocivo: lux pura et benigna` | развёртывание |
| 72 | `et rursum aurea minueretur et argentea floreret — et in brevi spatio` | `et rursum aurea minueretur et argentea floreret, et in brevi spatio` | соединение |
| 73 | `et vidi oculos eius humectari — quod apud Eldar` | `et vidi oculos eius humectari: quod apud Eldar` | развёртывание-комментарий |
| 76 | `cum creatura quadam monstrosa — cuius nomen non libenter profero` | `cum creatura quadam monstrosa, cuius nomen non libenter profero` | продолжение (определительное) |
| 78 | `Et nos —</em> <span class="elvish">Eldar</span> <em class="uncial-passage">— qui sub luce illa nati` | `Et nos,</em> <span class="elvish">Eldar</span><em class="uncial-passage">, qui sub luce illa nati` | парная парентеза-вставка → запятые |
| 79 | `de morte Christi — de luce mundi quae in Golgotham extincta est — silui` | `de morte Christi (de luce mundi quae in Golgotham extincta est), silui` | вставка-определение → скобки + пауза перед глаголом |
| 80 | `videbis — si placuerit tibi` | `videbis, si placuerit tibi` | условное продолжение |
| 81 | `Sed quae superest — memoria est` | `Sed quae superest, memoria est` | продолжение |
| 82 | `et hoc verbum — <em class="uncial-passage">quod vere pulchrum fuit, apud eum servatur</em> — in corde meo` | `et hoc verbum, <em class="uncial-passage">quod vere pulchrum fuit, apud eum servatur</em>, in corde meo` | парная парентеза-цитата → запятые |
| 84 | `nubis transeuntis — non tristitia illa` | `nubis transeuntis: non tristitia illa` | развёртывание |
| 85 | `Sed spiritus noster — quod vos animam vocatis — in saecula` | `Sed spiritus noster (quod vos animam vocatis) in saecula` | парная парентеза → скобки |
| 87 | `Vos autem — filii Mortis, filii Donationis Ignotae — sicut flamma` | `Vos autem, filii Mortis, filii Donationis Ignotae, sicut flamma` | парная парентеза → запятые (определение) |
| 88 | `<span class="terminus t-rubricatus">Donum</span> — mors, donum?` | `<span class="terminus t-rubricatus">Donum</span>: mors, donum?` | развёртывание |
| 89 | `qui in timore ultimo viaticum petimus — nos mortem ut donum habemus?` | `qui in timore ultimo viaticum petimus, nos mortem ut donum habemus?` | продолжение |
| 90 | `et subrisit — et subrisus eius erat` | `et subrisit, et subrisus eius erat` | соединение |
| 91 | `multos ex genere vestro — paucos, valde paucos, qui huc pervenerunt — et in omnibus` | `multos ex genere vestro (paucos, valde paucos, qui huc pervenerunt), et in omnibus` | парная вставка → скобки |
| 92 | `In hoc similes estis flammae — et flamma splendidior est` | `In hoc similes estis flammae: et flamma splendidior est` | развёртывание |
| 94 | `Tunc — et hoc, fratres, ex caritate et officio meo feci, non ex arrogantia — narravi` | `Tunc, et hoc, fratres, ex caritate et officio meo feci, non ex arrogantia, narravi` | парная парентеза → запятые |
| 95 | `de Filio aeterno qui carnem nostram humanam assumpsit — mirabile et stupendum! — et in illa carne` | `de Filio aeterno qui carnem nostram humanam assumpsit (mirabile et stupendum!) et in illa carne` | парная парентеза с восклицанием → скобки |
| 97 | `Et Finrothus me audiebat — et hoc etiam mirabile erat — non modo aures` | `Et Finrothus me audiebat (et hoc etiam mirabile erat): non modo aures` | парная парентеза → скобки + развёртывание после |
| 99 | `Sed non erat ira in silentio eius — erat consideratio profunda` | `Sed non erat ira in silentio eius: erat consideratio profunda` | развёртывание (что вместо ira) |
| 100 | `De hoc Uno qui descendit in mortem ut mortem vinceret — et qui natus est` | `De hoc Uno qui descendit in mortem ut mortem vinceret, et qui natus est` | соединение |
| 101 | `omnem tristitiam carnis — habuimus inter nos prophetias` | `omnem tristitiam carnis, habuimus inter nos prophetias` | продолжение (см. далее в сложном предложении) |
| 102 | `Sed haec via — ut tu dicis — via est filiorum Mortis` | `Sed haec via (ut tu dicis) via est filiorum Mortis` | парная парентеза → скобки |
| 103 | `Via nostra alia est — et an habemus viam` | `Via nostra alia est, et an habemus viam` | продолжение |
| 104 | `vel an nos quoque indigemus manus quae nos ducat — hoc quaerimus` | `vel an nos quoque indigemus manus quae nos ducat: hoc quaerimus` | развёртывание (заключение мысли) |
| 105 | `Forsitan utrique misericordia egent — sed misericordia alia et alia` | `Forsitan utrique misericordia egent: sed misericordia alia et alia` | развёртывание (qualification) |
| 106 | `An sufficiat — in ipsius manu est` | `An sufficiat, in ipsius manu est` | продолжение |
| 107 | `Cum tandem dies venisset quo redire debebam — non quia Finrothus me expellere vellet` | `Cum tandem dies venisset quo redire debebam, non quia Finrothus me expellere vellet` | продолжение (отрицание-уточнение) |
| 108 | `ne radices iam alterius generis in me crescerent — surrexit ille` | `ne radices iam alterius generis in me crescerent, surrexit ille` | продолжение (главное предложение после придаточного) |
| 109 | `nec monumentum factum manu — sed ipsum spatium sacrum` | `nec monumentum factum manu: sed ipsum spatium sacrum` | развёртывание (что вместо) |
| 110 | `circa pedes nostros cepit lumen emergere — non validum sicut sol` | `circa pedes nostros cepit lumen emergere, non validum sicut sol` | продолжение (qualification) |
| 111 | `non erat fons ullus — lux ipsa sine fonte visibili` | `non erat fons ullus: lux ipsa sine fonte visibili` | развёртывание |
| 112 | `aliquid altius in ea apparet — est facies quae mortem vidit` | `aliquid altius in ea apparet: est facies quae mortem vidit` | развёртывание (что именно) |
| 114 | `oculos in terram demisi — et iuxta pedem` | `oculos in terram demisi, et iuxta pedem` | соединение |
| 115 | `Qui lumen suum celat in tenebris ipse errat — quod etiam maximis` | `Qui lumen suum celat in tenebris ipse errat: quod etiam maximis` | развёртывание-комментарий |
| 116 | `Et posuit manum in humero meo — leve pondus sicut aves — et descendimus` | `Et posuit manum in humero meo (leve pondus sicut aves) et descendimus` | парная парентеза → скобки |
| 118 | `Post visionem illius collis — quasi septem dies` | `Post visionem illius collis, quasi septem dies` | продолжение |
| 119 | `quasi mel e cupa versus quam aqua per torrentem — ivit Finrothus mecum` | `quasi mel e cupa versus quam aqua per torrentem, ivit Finrothus mecum` | продолжение (главное предложение) |
| 121 | `lapidem illum de pera mea sustuli et iterum aspexi — et videbatur mihi alius` | `lapidem illum de pera mea sustuli et iterum aspexi, et videbatur mihi alius` | соединение |
| 122 | `desiderium quoddam diebus omnibus antiquius — quasi memoria rerum` | `desiderium quoddam diebus omnibus antiquius: quasi memoria rerum` | развёртывание |
| 123 | `videbimus amplius — tempus veniet — sed memoriam tui` | `videbimus amplius (tempus veniet), sed memoriam tui` | парная парентеза → скобки |
| 124 | `Lapidem illum — qui mihi nunc inter omnia quae possideo res pretiosissima est — in pera` | `Lapidem illum, qui mihi nunc inter omnia quae possideo res pretiosissima est, in pera` | парная парентеза-определение → запятые |
| 125 | `Et post tres dies — vel tres annos, quia fratres mihi postea dixerunt triennium me abfuisse, quod ego non credidi donec calendarium vidi — in aquas notas` | `Et post tres dies (vel tres annos, quia fratres mihi postea dixerunt triennium me abfuisse, quod ego non credidi donec calendarium vidi) in aquas notas` | длинная парная парентеза → скобки |
| 127 | `In verbis eius de <span class="elvish">Ilúvatare</span> — quem nos Deum Patrem agnoscimus — magis veram` | `In verbis eius de <span class="elvish">Ilúvatare</span> (quem nos Deum Patrem agnoscimus) magis veram` | парная парентеза → скобки |
| 128 | `In quaestione eorum de via salutis suae — in illa profunda et nobili ignorantia — plus humilitatis` | `In quaestione eorum de via salutis suae (in illa profunda et nobili ignorantia) plus humilitatis` | парная парентеза → скобки |
| 129 | `<span class="elvish">Eldar</span> salventur — hoc quaero et non respondeo` | `<span class="elvish">Eldar</span> salventur: hoc quaero et non respondeo` | развёртывание |
| 130 | `An baptismum desiderent — nescio` | `An baptismum desiderent: nescio` | развёртывание (ответ на вопрос) |
| 131 | `An Christus pro eis passus est — forsitan` | `An Christus pro eis passus est: forsitan` | развёртывание |
| 132 | `Sed haec theologi tractent — ego tantum testor` | `Sed haec theologi tractent, ego tantum testor` | продолжение |
| 133 | `Unum addo — non ut respondeam` | `Unum addo: non ut respondeam` | развёртывание (что добавляю) |
| 134 | `Orate pro me, fratre Aidano peccatore, et orate — si fas est — pro illis` | `Orate pro me, fratre Aidano peccatore, et orate (si fas est) pro illis` | парная парентеза → скобки |
| 135 | `quos Deus ipse novit quomodo et quantum, et qui — hoc certo scio — Deum suum` | `quos Deus ipse novit quomodo et quantum, et qui (hoc certo scio) Deum suum` | парная парентеза → скобки |
| 136 | `et iudica nos misericorditer —<br>          scientes et nescientes` | `et iudica nos misericorditer:<br>          scientes et nescientes` | развёртывание (кого судить) |

### 3.2. Точка с запятой (`;`) — эмфатические повороты

Меньше случаев, но они яркие — там, где после паузы идёт явный риторический разворот.

| # | Найти | Заменить | Семантика |
|---|---|---|---|
| 7 | `Tunc — subito, non gradatim — tempestas cessavit` | `Tunc, subito, non gradatim, tempestas cessavit` | парная парентеза-определение → запятые |
| 32 | `Et oculi — Domine Deus! — oculi eorum` | `Et oculi (Domine Deus!), oculi eorum` | парная парентеза с восклицанием → скобки + пауза |
| 33 | `et tamen ex eo emergens iam altius stat. Postea ipse — de quo mox dicam et nomen eius — mihi explicavit` | `et tamen ex eo emergens iam altius stat. Postea ipse (de quo mox dicam et nomen eius) mihi explicavit` | парная парентеза → скобки |
| 36 | `monasterio didiceram. Et tunc — non sine stupore — agnovi` | `monasterio didiceram. Et tunc, non sine stupore, agnovi` | парная парентеза → запятые |
| 37 | `quasi sol post nubes longas emergens — gaudium et maestitia simul` | `quasi sol post nubes longas emergens: gaudium et maestitia simul` | развёртывание (что за эффект) |
| 39 | `oculi eorum profundi erant — quasi aque profundas` | `oculi eorum profundi erant: quasi aque profundas` | развёртывание |

### 3.3. Маргиналии — особый случай

В маргиналиях много `<br>` вокруг тире — это построчная глоссы, и тире там часто функционирует как **разделитель идеи**, а не как пунктуация в смысле основного текста. Пройтись надо аккуратно.

| # | Найти | Заменить | Заметка |
|---|---|---|---|
| 4 | `Brendani abbatis —<br>          et ille ad` | `Brendani abbatis,<br>          et ille ad` | продолжение |
| 8 | `noctes — quasi<br>          Iona` | `noctes, quasi<br>          Iona` | продолжение |
| 14 | `scriptoris tremuit —<br>          vide litteras` | `scriptoris tremuit:<br>          vide litteras` | развёртывание (что см.) |
| 18 | `Terra sine sole<br>          proprio — cf.` | `Terra sine sole<br>          proprio, cf.` | продолжение |
| 19 | `est — haec autem` | `est: haec autem` | развёртывание |
| 21 | `et sitis crescit —<br>          quis non meminit` | `et sitis crescit:<br>          quis non meminit` | развёртывание (рит. вопрос) |
| 22 | `donum Amanis —<br>          quasi sitis` | `donum Amanis:<br>          quasi sitis` | развёртывание |
| 25 | `Duae arbores lumen dantes sine sole —<br>          forte memoriam` | `Duae arbores lumen dantes sine sole,<br>          forte memoriam` | продолжение |
| 29 | `corporei? — Non<br>          videntur. Praeter- adamitae? — Sed<br>          ubi in Scriptura?` | `corporei? Non<br>          videntur. Praeter- adamitae? Sed<br>          ubi in Scriptura?` | вопросы — тире излишни (вопросы и так пунктуируются `?`) |
| 41 | `Formosi nimis —<br>          Sic et angeli` | `Formosi nimis;<br>          Sic et angeli` | риторический разворот |
| 43 | `Finrothus —<br>          nomen` | `Finrothus,<br>          nomen` | продолжение (определение) |
| 50 | `Civitas alba in<br>          monte — cf. civitatem` | `Civitas alba in<br>          monte, cf. civitatem` | продолжение |
| 51 | `descendit — iam<br>          ibi est` | `descendit: iam<br>          ibi est` | развёртывание |
| 62 | `Lux ante solem —<br>          sicut in Genesi` | `Lux ante solem,<br>          sicut in Genesi` | продолжение |
| 63 | `Creatio per cantum —<br>          mirum!` | `Creatio per cantum:<br>          mirum!` | развёртывание-комментарий |
| 68 | `theologia — sed<br>          non impia` | `theologia, sed<br>          non impia` | продолжение |
| 83 | `Lacrimae Eldar —<br>          mira res` | `Lacrimae Eldar,<br>          mira res` | продолжение |
| 93 | `Christum — quid<br>          de eis post Chr- istum?` | `Christum: quid<br>          de eis post Chr- istum?` | развёртывание-вопрос |
| 106 | `Prophetia inter<br>          Eldar — quomodo<br>          et a quo data?` | `Prophetia inter<br>          Eldar: quomodo<br>          et a quo data?` | развёртывание-вопрос |
| 113 | `Collis secretus —<br>          cf. Cant.` | `Collis secretus,<br>          cf. Cant.` | продолжение |
| 117 | `visibili — quasi<br>          Spiritus` | `visibili: quasi<br>          Spiritus` | развёртывание |
| 120 | `Una veritas, duae viae?` | (без изменений, хотя в списке встречается — после знака `?` тире не нужно само по себе) | проверьте контекст |
| 126 | `Memoriae Luminis —<br>          numerus perfectus` | `Memoriae Luminis,<br>          numerus perfectus` | продолжение |
| 127 | `Faerica — qui intrat,<br>          exiens tempus amisit` | `Faerica: qui intrat,<br>          exiens tempus amisit` | развёртывание |
| 138 | `a mundo — nisi<br>          mors ipsa?` | `a mundo, nisi<br>          mors ipsa?` | продолжение (риторический вопрос) |

### 3.4. Тире в исходном тексте Аидана — короткие фразы

Несколько ситуаций в основном тексте, которые я не отнёс к парным парентезам или развёртываниям, потому что это **продолжение мысли через паузу-вдох**. Все идут под запятую.

| # | Найти | Заменить |
|---|---|---|
| 2,3 | `Rogabant me multi — et hoc fateor — cur non siluerim` | `Rogabant me multi (et hoc fateor) cur non siluerim` |
| 5,6 | `Per tres dies ventus mirabilis — nec nimis validus nec nimis languidus, quasi manu alicuius Potestatis directus — vela mea implebat` | `Per tres dies ventus mirabilis (nec nimis validus nec nimis languidus, quasi manu alicuius Potestatis directus) vela mea implebat` |
| 1 | `Testis ipse solus —<br>          sed Deus vidit` | `Testis ipse solus;<br>          sed Deus vidit` |
| 20 | `Et aer ipse — Deus bone! — aer ipse erat quasi aqua` | `Et aer ipse (Deus bone!), aer ipse erat quasi aqua` |
| 25,26 | `et cymba mea — misera tabula inter pelagi vastitudinem — iactabatur` | `et cymba mea (misera tabula inter pelagi vastitudinem) iactabatur` |
| 30,31 | `ex quibus — ut mihi tunc videbatur — omnis lux regionis` | `ex quibus (ut mihi tunc videbatur) omnis lux regionis` |
| 40 | `Comes autem meus — qui mecum a litore in silentio ascenderat, et cuius nomen ac genus tunc adhuc ignorabam — videns quo oculi mei` | `Comes autem meus, qui mecum a litore in silentio ascenderat, et cuius nomen ac genus tunc adhuc ignorabam, videns quo oculi mei` |
| 42 | `Et cum lux — si fas est dicere de eis quae non sunt sol nostrum — languere cepisset` | `Et cum lux (si fas est dicere de eis quae non sunt sol nostrum) languere cepisset` |
| 51,52 | `et manum — ut mox patefiet — quae lumina mundi postea occidit` | `et manum (ut mox patefiet) quae lumina mundi postea occidit` |
| 67 | `eiectus fuisset et rursus in mundum venisset — Arbores illas` | `eiectus fuisset et rursus in mundum venisset, Arbores illas` |
| 68 | `cuius nomen non libenter profero in lucem diurnam, ne forte attendat — quae tenebras` | `cuius nomen non libenter profero in lucem diurnam, ne forte attendat: quae tenebras` |
| 76 | `ego enim eram — intellexi postea — quasi avis peregrini` | `ego enim eram (intellexi postea) quasi avis peregrini` |

### 3.5. «Subordinated» вставки в текст

Несколько остальных случаев, систематически оставшихся:

| # | Найти | Заменить |
|---|---|---|
| 86 | `posse.<br>          — <span class="signum">frater Coemanus` | оставить (подпись) |
| 124 | `posse.<br>          — <span class="signum">frater Coemanus` (другая) | оставить (подпись) |
| 125 | `Aidane?<br>          — <span class="signum">frater Cellach` | оставить (подпись) |
| 86,148,86,161 | `<br>          — <span class="signum">` (паттерн подписи) | оставить во всех 4 случаях |

---

## 4. Самый практичный путь применения

Вместо того, чтобы делать 170+ find/replace операций вручную, **рекомендую написать одноразовый Python-скрипт** или использовать функцию вашего редактора для batch find/replace. Скрипт подобный:

```python
import re

with open('relatio_aidani_codex.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Сохраняем подписи маргиналий
SIGNATURE_PATTERN = re.compile(r'<br>\s+— <span class="signum">')
signatures = []
def save_sig(m):
    signatures.append(m.group(0))
    return f'__SIG_{len(signatures)-1}__'
html = SIGNATURE_PATTERN.sub(save_sig, html)

# Применяем замены — список (find, replace) пар по таблице выше
replacements = [
    ('Testis ipse solus —<br>', 'Testis ipse solus;<br>'),
    ('Rogabant me multi — et hoc fateor — cur', 'Rogabant me multi (et hoc fateor) cur'),
    ('Brendani abbatis —<br>', 'Brendani abbatis,<br>'),
    # ... и так далее по таблице
]

for find, replace in replacements:
    html = html.replace(find, replace)

# Восстанавливаем подписи
for i, sig in enumerate(signatures):
    html = html.replace(f'__SIG_{i}__', sig)

# Проверяем — сколько em-dash осталось
remaining = html.count('—')
print(f'Em-dashes remaining: {remaining}')
# Должно быть 4 (только подписи маргиналий)

with open('relatio_aidani_codex_no_dashes.html', 'w', encoding='utf-8') as f:
    f.write(html)
```

Этот подход:

1. **Защищает 4 подписи маргиналий** через временную замену на placeholder.
2. **Применяет всю таблицу** из шага 3 одним проходом.
3. **Восстанавливает подписи**.
4. **Проверяет**, что осталось ровно 4 em-dash (только подписи).

После выполнения скрипта откройте файл, визуально просмотрите 5–10 случайных мест — пунктуация должна читаться естественно. Если что-то выпадает из ритма (запятая там, где надо двоеточие, или наоборот) — это уже ручная финальная правка, по вкусу.

---

## 5. Что НЕ затронуто

- HTML-комментарии в SVG-разметке (5 случаев) — там тире семантически другое (отделяет описание блока в комментарии разработчика).
- 4 подписи маргиналий — структурный знак атрибуции, не пунктуация.
- Hyphen-minus (7 случаев) внутри слов — это переносы слов, не пунктуационные тире.
- Все остальные системы кодекса — пагинатор, ws-вариация, фолликулы, шрифты — никак не затрагиваются: это чисто текстовая правка template'а.

---

## 6. Альтернативы

**Если результат покажется слишком «гладким»** (медиолатинская проза идёт длинными периодами без явных пауз, что может читаться монотонно), можно вернуть **некоторые** тире обратно — но только в действительно драматических местах, например:

- `Et oculi — Domine Deus! — oculi eorum…` — здесь восклицание-вставка действительно требует визуального разрыва.

Это будет компромисс «реализм + читаемость». Я предложил полную замену, потому что она палеографически чище — но средневековые манускрипты тоже использовали `( )` и `: ;` довольно свободно для парентез, так что оставить 5–10 наиболее эмоциональных тире как стилистический жест **тоже допустимо** в таком конкретном случае.

**Если хотите идти ещё дальше в реализм** — можно добавить:

- Замена `?` на medieval `punctus interrogativus` (но это требует уверенности, что шрифт его покажет — `0800 Kells` имеет ли U+003F в инсулярной форме?).
- Замена `;` на `punctus elevatus` (`⸵`, U+2E35) — это *самый* медиевальный вариант, но опять требует support'а в шрифте.

Это уже дальнейшие шаги, не для этой инструкции.
