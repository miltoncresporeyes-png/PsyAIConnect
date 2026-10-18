# Plan de Diseño: Landing de Lista de Espera (landing-v2)

## 1. Diagnóstico y Autocrítica del Diseño Anterior (Línea Base)

Al analizar las capturas de pantalla de la línea base (`baseline-360.png`, `baseline-768.png`, `baseline-1280.png`), identificamos los siguientes vicios del diseño genérico tipo plantilla SaaS que deben erradicarse:

1. **Titular con degradado de texto cliché**: El titular principal usaba `bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent` acentuando sólo la frase *"diseñada para conectar"*. Esto transmite artificialidad tecnológica en lugar de serenidad médica y confianza clínica.
2. **Etiquetas redundantes en mayúsculas (eyebrows)**: Sobre cada título se usaban píldoras repetitivas con texto en mayúsculas (`PROCESO SIMPLE`, `PRESTADORES VERIFICADOS`, etc.), cargando la vista y compitiendo con la jerarquía semántica.
3. **Tarjetas modulares idénticas**: "Cómo funciona" y "Por qué PsyDoctor" utilizaban bloques rectangulares idénticos (`bg-slate-50/50 border border-slate-200/80 rounded-3xl`) con números en burbujas cuadradas, generando monotonía visual y fatiga de escaneo.
4. **Solapamiento en pantallas medianas (768px)**: Los enlaces de navegación del Header colisionaban con el botón CTA principal en vistas de tablet.
5. **Falta de calidez editorial**: La tipografía puramente geométrica (`Outfit`/`Inter`) hacía que una plataforma de salud mental pareciera una herramienta de software B2B o fintech.

---

## 2. Sistema de Diseño Propuesto (Solución Sobria y Clínica)

### 2.1 Paleta de Color Estratégica (Chilean Mist & Forest)
- **Niebla (`--color-niebla: #F2F5F6`)**: Fondo sereno, limpio, no deslumbrante como el blanco puro `#FFFFFF`. Reduce la fatiga visual.
- **Tinta (`--color-tinta: #16232E`)**: Color del texto principal y titulares. Profundo, legible, excelente contraste WCAG AAA contra fondos claros.
- **Pino (`--color-pino: #1F6F68`)**: Color institucional y de acento clínico. Sereno, transmite estabilidad, salud y rigurosidad médica.
- **Pino Hover (`--color-pino-hover: #175752`)**: Estado activo y hover para elementos interactivos primarios.
- **Bruma (`--color-bruma: #D5E3E1`)**: Bordes sutiles, fondos de apoyo y divisores orgánicos.
- **Ámbar (`--color-ambar: #E3A72F`)**: Reservado **exclusivamente** para el botón de acción principal de conversión (CTA de registro en lista de espera), dotándolo de una prominencia natural sin requerir brillos ni degradados llamativos.
- **Ámbar Hover (`--color-ambar-hover: #C99124`)**: Feedback háptico/hover del CTA principal.

### 2.2 Tipografía
- **Titulares**: Serif cálido, humano y editorial (`Newsreader` / `Lora` o fallback `Georgia, "Times New Roman", serif`), aportando un tono empático, reflexivo y de consulta médica.
- **Cuerpo y Formularios**: Sans-serif neutral y de altísima legibilidad (`Figtree` / `Inter` o fallback `system-ui, -apple-system, sans-serif`).
- **Ritmo de lectura**: Longitud de línea restringida a un máximo de 65-75 caracteres (`max-w-prose` / `max-w-2xl`) para una lectura descansada y comprensible.

### 2.3 Espaciado y Radios
- **Radios**: Suaves pero disciplinados (`8px` para inputs y badges, `12px` para botones, `16px` para contenedores/paneles). Eliminación de bordes hiper-redondeados de juguete (`rounded-[28px]`).
- **Espaciado modular**: `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`.

---

## 3. Bocetos ASCII

### 3.1 Vista Móvil (360px)
```text
+------------------------------------------+
| [!] ¿Emergencia? FonoSalud 600 360 7777   |
+------------------------------------------+
| [=] PsyDoctor             [Unirme]        |
+------------------------------------------+
|                                          |
|  * Lista de Espera Abierta               |
|                                          |
|  Salud mental accesible                  |
|  en Chile, diseñada para                 |
|  conectar.                               |
|                                          |
|  Estamos reuniendo a los mejores         |
|  psicólogos y psiquiatras acreditados... |
|                                          |
|  [  Unirme a la lista de espera (Ámbar) ]|
|  [  Soy profesional de la salud (Pino)  ]|
|                                          |
|  --- Garantías Clínicas ---              |
|  [x] Prestadores Verificados (SIS)       |
|  [+] Fonasa e Isapre con boleta          |
|  [o] Acceso prioritario de apertura      |
|                                          |
+------------------------------------------+
| ¿CÓMO FUNCIONARÁ?                        |
|                                          |
| (1) - - - - - - - - - - - - - - - - -+   |
|  Encuentra a tu profesional          |   |
|  Filtra por motivo, enfoque...       |   |
|  |                                       |
| (2) - - - - - - - - - - - - - - - - -+   |
|  Agenda y atiende online             |   |
|  Videollamada cifrada y segura...    |   |
|  |                                       |
| (3) - - - - - - - - - - - - - - - - -+   |
|  Reembolsa sin fricción              |   |
|  Boleta y kit para tu seguro...      |   |
|                                          |
+------------------------------------------+
| [Formularios Tabs: Paciente / Especial.] |
| [ WhatsApp flotante sin tapar inputs  (W)]
+------------------------------------------+
```

### 3.2 Vista Escritorio (1280px)
```text
+---------------------------------------------------------------------------------------+
|  [!] ¿Emergencia? FonoSalud 600 360 7777 (24/7)  131 SAMU       Hablar con asistente  |
+---------------------------------------------------------------------------------------+
|  PsyDoctor      Lista de espera    Programa Fundadores    Cómo funciona     [Unirme]  |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|                    Lanzamiento Oficial Chile · Lista de Espera Abierta                |
|                                                                                       |
|                 Salud mental accesible en Chile,                                      |
|                             diseñada para conectar.                                   |
|                                                                                       |
|        Estamos reuniendo a los mejores psicólogos y psiquiatras acreditados           |
|        en el país para ofrecer atención online transparente, con cobertura            |
|        Fonasa e Isapre y sin barreras.                                                |
|                                                                                       |
|            [ Unirme a la lista de espera (Ámbar) ]   [ Soy profesional (Pino) ]       |
|                                                                                       |
|      +---------------------+   +---------------------+   +---------------------+      |
|      | Prestadores SIS     |   | Fonasa e Isapre     |   | Acceso prioritario  |      |
|      | Registro oficial    |   | Boletas electrónicas|   | Sin esperas         |      |
|      +---------------------+   +---------------------+   +---------------------+      |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|   ¿CÓMO FUNCIONARÁ PSYDOCTOR?                                                         |
|   Tres pasos transparentes para acceder a terapia psicológica o psiquiátrica          |
|                                                                                       |
|    ( 1 ) Encuentra a tu profesional   ---------->   ( 2 ) Agenda y atiende online     |
|          Filtra por motivo y previsión                    Sala cifrada sin apps       |
|                                                                  |                    |
|                                                                  v                    |
|                                                     ( 3 ) Reembolsa sin fricción      |
|                                                           Boleta y kit oficial        |
+---------------------------------------------------------------------------------------+
```

---

## 4. Requisitos de Accesibilidad y Rendimiento

1. **Contraste AA / AAA**:
   - Tinta (`#16232E`) sobre Niebla (`#F2F5F6`): Ratio > 13:1 (AAA).
   - Pino (`#1F6F68`) sobre Blanco (`#FFFFFF`): Ratio > 5.5:1 (AA para texto normal, AAA para grande).
   - Ámbar (`#E3A72F`) con texto oscuro (`#16232E`): Ratio > 7:1 (AAA).
2. **Foco visible**: Anillo de foco definido con `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pino`.
3. **Respeto a `prefers-reduced-motion`**: Las transiciones o animaciones sutiles del hero se anulan completamente mediante `motion-reduce:transform-none motion-reduce:transition-none`.
4. **Botón flotante de WhatsApp**: Fijado en la esquina inferior derecha con `z-40`, asegurando que no solape los campos de formulario ni los botones de envío en pantallas móviles.
