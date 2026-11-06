# Contexto del proyecto: Sistema de Horas / MyTask UTEL

> Documento de referencia para analizar cambios antes de implementarlos.
>
> Última revisión: 2026-11-06. Este documento describe el estado observado en el repositorio; si el código cambia, actualizar también esta referencia.

## 1. Propósito y contexto de negocio

El proyecto es una plataforma web para registrar, consultar y administrar horas de trabajo dedicadas a proyectos. La experiencia visual está inspirada en herramientas de seguimiento de tiempo como Clockify y utiliza los nombres visibles **MyTask UTEL**, **Sistema de Horas** y **Tempo** en distintas partes del código.

El objetivo funcional que se desprende de la implementación es:

- Permitir que usuarios registren horas desde su calendario, asociadas a un proyecto, descripción y horario.
- Consultar registros por día y calendario, editarlos, duplicarlos y eliminarlos.
- Dar a administradores una visión global, gestión de clientes/proyectos y reportes.
- Mantener una experiencia de privacidad y seguridad alineada con el contexto colombiano, incluyendo referencias a la Ley 1581 de 2012 y derechos ARCO.

El alcance actual está concentrado en autenticación, proyectos, registros de horas y reportes. La gestión completa de tareas todavía no tiene una tabla/API propia; el frontend conserva tareas de prueba en memoria.

## 2. Estructura general

El repositorio raíz es `Sistema-de-Horas/` y funciona como monorepo:

```text
Sistema-de-Horas/
├── frontend/                 Aplicación React independiente
│   ├── src/
│   │   ├── componentes/      Componentes compartidos de UI
│   │   ├── contextos/        Estado global de horas y cronómetro
│   │   ├── servicios/        Cliente API y datos de prueba
│   │   ├── tipos/            Tipos TypeScript del dominio
│   │   ├── utilidades/       Formateadores y estilos reutilizables
│   │   └── vistas/            Pantallas funcionales
│   ├── public/               Iconos y recursos públicos
│   └── vite.config.ts
├── backend/                  API Laravel
│   ├── app/
│   │   ├── Auth/             Adaptaciones de autenticación/token/password
│   │   ├── Console/          Comandos Artisan propios
│   │   ├── Database/         Adaptación del repositorio de migraciones
│   │   ├── Http/             Controladores y Form Requests
│   │   ├── Models/           Modelos Eloquent
│   │   ├── Policies/         Autorización por modelo
│   │   ├── Providers/        Registro/configuración de servicios
│   │   └── Services/         Servicios de dominio, incluido Excel
│   ├── config/               Configuración Laravel, auth, DB, Sanctum, etc.
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/       Esquema y migraciones de normalización
│   │   └── seeders/
│   ├── routes/api.php        Contrato principal de la API REST
│   ├── tests/                Pruebas feature/unit de backend
│   └── artisan
├── README.md                 Documentación raíz mínima
└── package.json              Metadatos raíz; no es el gestor principal de la app
```

No se deben editar `node_modules/`, `vendor/`, `storage/`, `bootstrap/cache/` ni archivos generados. Son artefactos de dependencias o ejecución.

## 3. Stack tecnológico

### Frontend

- React `19.2.8` y React DOM `19.2.8`.
- TypeScript `~6.0.2`.
- Vite `^8.3.0`.
- Tailwind CSS `^4.3.3`, integrado mediante `@tailwindcss/vite`.
- `lucide-react` para iconografía.
- Oxlint para linting.
- Estado local con React hooks y `ContextoHoras`; no hay Redux ni router instalado.
- Navegación interna mediante el estado `vistaActual` en `App.tsx`, no mediante rutas URL.
- Comunicación HTTP con `fetch` encapsulado en `frontend/src/servicios/api.ts`.

Scripts frontend:

```text
npm run dev       Vite en desarrollo
npm run build     tsc -b y vite build
npm run lint      oxlint
npm run preview   Vista previa del build
```

### Backend

- PHP `^8.3` según `composer.json`; en la instalación actual se requiere PHP `>=8.4.1` porque las versiones bloqueadas de Symfony en `composer.lock` lo exigen.
- Laravel `^13.17`.
- JWT firmado HS256 para access y refresh tokens; los tokens no se persisten en tablas.
- Laravel Tinker, Boost, Pail, Pint y PHPUnit para soporte/desarrollo.
- PhpSpreadsheet `3.9` para generar reportes `.xlsx`.
- Persistencia mediante Eloquent y migraciones Laravel.
- El backend incluye Vite/Tailwind de la aplicación base Laravel, aunque la UI principal que se observa en el repositorio vive en `frontend/`.

### Base de datos e infraestructura

- El driver concreto depende del `.env` local y no hay un `.env` versionado visible en el repositorio.
- La base local conectada es `basededatosestasies`, en `127.0.0.1:3306`, y conserva datos existentes en el esquema español.
- Las migraciones iniciales nacen con nombres Laravel en inglés y después renombraron tablas, columnas y la tabla de migraciones a español. La migración `2026_11_04_224000_align_existing_spanish_schema.php` completa columnas faltantes del esquema español sin reemplazar registros.
- La configuración final esperada usa tablas como `usuarios`, `clientes`, `proyectos`, `registros_horas` y `tokens_acceso`.
- Cache, sesiones, jobs y tokens también tienen migraciones de normalización al español.

## 4. Arranque y configuración

### Backend

Desde `backend/`:

```text
composer install
if (!(Test-Path .env)) { New-Item -ItemType File .env | Out-Null }
php artisan key:generate
php artisan migrate
php artisan serve --port=8002
```

El script `composer setup` también instala dependencias, genera la clave, migra, instala npm y construye los assets Laravel. Verificar que el backend responda bajo la URL configurada para la API.

### Frontend

Desde `frontend/`:

```text
npm install
npm run dev
```

La URL base de API se define con `VITE_API_URL`. Si no existe, el frontend usa:

```text
http://127.0.0.1:8002/api
```

No asumir que el puerto, driver de base de datos o credenciales son los mismos entre entornos; revisarlos siempre en el `.env` local antes de probar integraciones.

## 5. Flujo de aplicación frontend

`frontend/src/main.tsx` monta `App`. `App.tsx` envuelve la aplicación en `ProveedorHoras` y contiene el shell principal:

1. Lee `utel_auth_token` desde `localStorage`.
2. Si existe token, consulta `GET /me` para validar la sesión.
3. Traduce el rol API `admin` a `administrador`; `usuario` se trata como `colaborador`.
4. Admin inicia en `dashboard`; usuario inicia en `user-dashboard`.
5. Si no hay token o la validación devuelve 401, muestra `VistaLogin`.
6. Si hay sesión, renderiza `BarraLateralClockify`, barra superior y la vista seleccionada.

Las vistas actuales son:

- `VistaDashboard`: métricas generales de administración.
- `VistaDashboardUsuario`: resumen personal de horas del día, semana y mes, proyectos usados y registros recientes.
- `VistaProyectos`: listado/administración de proyectos y clientes.
- `VistaTareas`: tareas; actualmente depende en gran medida de datos de prueba.
- `VistaCronometro`: cronómetro y entradas recientes.
- `VistaCalendario`: calendario, creación con el botón `+` de cada día, búsqueda de proyectos, edición y drag & drop de registros. El formulario pide proyecto, descripción, inicio y fin; no solicita tarea ni facturación.
- `VistaReportes`: reportes/exportación.
- `VistaRegistroHoras`: alta/edición/duplicación manual, disponible como herramienta interna de administración; el usuario registra desde Mi Calendario.
- `VistaPoliticaDatos`: exportación y eliminación de datos locales, privacidad y Ley 1581.
- `VistaSeguridad`: cambio de contraseña.
- `VistaDetalleProyecto`: detalle y horas por proyecto.

No hay protección de rutas del lado del navegador porque no se usa router; el menú se adapta al rol y el control de acceso visual usa `vistaActual`, el rol del contexto y una pantalla de acceso denegado para vistas administrativas. El menú principal de usuario muestra únicamente Dashboard y Mi Calendario (además de los accesos generales de seguridad y privacidad).

## 6. Estado y persistencia frontend

`ContextoHoras.tsx` es la fuente de estado compartido para:

- usuario actual y rol;
- proyectos, tareas y registros;
- cronómetro activo;
- creación, actualización y eliminación de registros;
- mensajes de error de persistencia.

Claves relevantes de `localStorage`:

| Clave | Uso |
|---|---|
| `utel_auth_token` | JWT access token (15 minutos) |
| `utel_refresh_token` | JWT refresh token provisional (7 días) |
| `utel_registros_horas` | Copia local de registros |
| `utel_cronometro_activo` | Estado del cronómetro en curso |

Con sesión, proyectos y registros se cargan desde la API. Crear, editar o eliminar registros espera confirmación del servidor antes de reflejar el cambio en la lista; los fallos se muestran en la interfaz. Los datos de ejemplo se conservan para pantallas aún no conectadas al backend, pero no son el origen del catálogo autenticado de proyectos ni del historial del usuario.

Los datos en `servicios/datosPrueba.ts` funcionan como fallback/inicialización para usuario, proyectos, tareas y registros. Antes de cambiar el dominio, confirmar si el dato debe venir del backend o si sigue siendo mock.

## 7. Autenticación y seguridad

### Backend

Endpoints públicos:

- `POST /api/login`: valida correo y bcrypt; devuelve access y refresh token.
- `POST /api/refresh`: valida refresh token y emite una nueva pareja de tokens.
- `GET /api/status`: estado del servicio.

Endpoints autenticados:

- `GET /api/me`: usuario de la sesión actual.
- `POST /api/logout`: informa al cliente que debe descartar sus tokens; al ser JWT stateless, el token no se revoca antes de expirar.
- `PATCH /api/me/password`: valida contraseña actual y establece la nueva.

La autenticación usa middleware JWT propio (`jwt`) y HS256. El access token dura 15 minutos y el refresh 7 días, configurables con `JWT_ACCESS_TTL` y `JWT_REFRESH_TTL`. El secreto `JWT_SECRET` vive solo en `backend/.env`. La renovación es provisional y stateless: no hay revocación/rotación persistida del refresh token todavía. Login no tiene límite de intentos; refresh conserva un throttle de 10 solicitudes por minuto.

El modelo `User` usa directamente los nombres del esquema español y la tabla `usuarios`:

- `nombre` / alias `name`;
- `correo` / alias `email`;
- `contrasena` / alias `password`;
- `roles_idroles` como FK a `roles.idroles`;
- timestamps `creado_en` y `actualizado_en`.

Roles observados:

- `roles.idroles = 1` (`Administrador`, código API `admin`): puede gestionar áreas administrativas.
- `roles.idroles = 2` (`Usuario`, código API `usuario`): usa funciones de colaborador.

`User::hasRole()` deriva el permiso del FK `roles_idroles`; el código JSON del rol es `admin` o `usuario`. El middleware `role:admin` protege endpoints administrativos.

### Frontend

`VistaLogin.tsx` inicia sesión y guarda ambos tokens en `localStorage`. El cliente HTTP intenta renovar automáticamente el access token ante un 401 y reintenta la solicitud una vez. `App.tsx` valida sesión con `GET /me`.

```http
Authorization: Bearer <token>
```

El cliente API elimina el token local ante una respuesta 401. Logout intenta revocar el token en backend y siempre limpia el token local en `finally`.

### Consideraciones de seguridad para futuros cambios

- No guardar contraseñas ni tokens en archivos de código, fixtures públicos o documentación.
- Mantener validación y autorización en backend; la ocultación de menús frontend no es una barrera de seguridad.
- Revisar el uso de `localStorage` si el proyecto requiere endurecimiento contra XSS; una mejora futura sería guardar refresh tokens en cookie HttpOnly o persistir sesiones revocables.
- Mantener throttle en endpoints sensibles y pruebas de acceso anónimo/por rol.

## 8. Dominio y persistencia

### Entidades principales

- `User` / `usuarios`: identidad, correo, contraseña hash y rol.
- Los JWT no agregan tablas al esquema de negocio actual.
- `Client` / `clientes`: catálogo de clientes.
- `Project` / `proyectos`: proyecto asociado a cliente, con nombre, color y horas estimadas; el campo `codigo` puede existir por compatibilidad.
- `TimeEntry` / `registros_horas`: registro asociado a usuario y proyecto, con descripción, fecha, hora de inicio, hora de fin y duración en minutos.

Las relaciones principales son `Client hasMany Project`, `Project belongsTo Client`, `TimeEntry belongsTo User` y `TimeEntry belongsTo Project`.

Los registros de horas conservan algunas columnas de origen por compatibilidad, pero el flujo actual no las necesita. El endpoint convierte entre el DTO camelCase del frontend y las columnas españolas del backend. El usuario de la sesión se asigna en backend y cada usuario normal solo ve sus propios registros.

Al 2026-11-06 el catálogo local contiene 22 clientes y 84 proyectos: el CSV `Clockify_Project_export_16_10_2026.csv` agregó 16 clientes y 78 proyectos. Los valores de horas estimadas venían vacíos y se guardaron como 0. El esquema actual no almacena el estado del proyecto ni el acumulado histórico `Tracked (h)` de Clockify; esos totales no se importaron como registros de horas.

### Migraciones importantes

La secuencia de migraciones debe respetarse. Primero se crean las tablas Laravel en inglés; luego se crean clientes/proyectos/registros, se agregan roles y tokens, y finalmente se renombran tablas y columnas al español. Las últimas migraciones siembran un catálogo de clientes y proyectos. No editar una migración ya ejecutada para cambiar el esquema de un entorno; crear una nueva migración.

## 9. API actual

Todas las rutas siguientes usan prefijo `/api`:

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| GET | `/status` | Público | Salud/estado de API |
| POST | `/login` | Público | Inicio de sesión |
| POST | `/refresh` | Público | Renovación de access y refresh token |
| POST | `/logout` | JWT | Cierre de sesión en cliente |
| PATCH | `/me/password` | JWT | Cambio de contraseña |
| GET | `/me` | JWT | Sesión actual |
| GET/POST/GET/PUT/DELETE | `/time-entries`, `/time-entries/{id}` | JWT | CRUD de horas |
| GET | `/reports/time-entries.xlsx` | JWT + admin | Reporte Excel |
| GET/POST/PATCH/DELETE | `/clients`, `/clients/{id}` | JWT + admin | CRUD de clientes |
| GET/POST | `/projects` | JWT; escritura admin | Listar/crear proyectos |
| GET/PATCH/DELETE | `/projects/{project}` | JWT; escritura admin | Consultar/editar/eliminar proyecto |

Reglas destacadas de horas:

- Un colaborador solo consulta/modifica/elimina sus propios registros.
- Un admin puede consultar registros de todos los usuarios.
- La fecha no puede ser futura.
- La hora final debe ser posterior a la inicial.
- La duración válida está entre 1 y 1440 minutos.

## 10. Autorización por rol

La autorización backend es la autoridad real:

- `ProjectPolicy`: cualquier usuario autenticado puede ver proyectos; solo admin puede crear, actualizar o eliminar.
- Las rutas de gestión de clientes y proyectos requieren JWT y rol admin; el catálogo de proyectos también puede consultarlo un usuario.
- `TimeEntryController`: filtra por usuario salvo admin.
- `TimeEntryReportRequest`: solo admin puede generar reportes.

Al agregar un endpoint nuevo, definir simultáneamente middleware de autenticación, policy/request authorization, validación de entrada, prueba para invitado, prueba para usuario normal y prueba para admin cuando aplique.

## 11. Reportes

`ReportController` delega en `TimeEntryExcelReport` y genera un XLSX con PhpSpreadsheet. La descarga se hace como respuesta stream. El request del reporte está autorizado para admin. Cualquier cambio en filtros o columnas debe revisar tanto el request como el servicio y `TimeEntryReportTest`.

## 12. Pruebas existentes

El backend tiene pruebas feature/unit para:

- login, registro, logout y cambio de contraseña;
- autorización de clientes y proyectos;
- relaciones de proyectos;
- CRUD y aislamiento de registros de horas;
- validación de rangos de hora y fechas futuras;
- reportes de registros.

Comando esperado desde `backend/`:

```text
php artisan test
```

El frontend tiene scripts de build/lint, pero no se observa un framework de pruebas frontend configurado.

## 13. Observaciones y riesgos actuales

Estas observaciones son importantes antes de ampliar funcionalidades:

1. El README raíz y el README del frontend son mínimos/de plantilla; este archivo es la referencia de contexto hasta que se mejore esa documentación.
2. El `package.json` raíz declara paquetes `composer` y `php`, pero la instalación real se gestiona por separado con `frontend/package.json` y `backend/composer.json`.
3. El frontend conecta autenticación, catálogo de proyectos, registros de horas y CRUD administrativo de usuarios, clientes y proyectos. Los reportes tienen API disponible; confirmar su uso en la vista correspondiente antes de ampliar sus filtros.
4. Tareas no tienen migración, modelo ni controlador backend propios; no tratar `Tarea` como entidad persistente sin diseñar primero su contrato.
5. Hay una diferencia deliberada entre nombres de DTO frontend (`nombre`, `proyectoId`, etc.), JSON API Laravel (`name`, `project_id`/DTO camelCase) y columnas de base de datos españolas. Toda modificación debe revisar las conversiones en ambos sentidos.
6. La aplicación no usa router y la autorización visual se basa en estado React; los endpoints siempre deben mantenerse protegidos independientemente de la UI.
7. La persistencia local puede contener datos obsoletos o duplicados respecto al backend. Cualquier migración del modelo de registro debe considerar compatibilidad con las claves de `localStorage` y con `id_origen`.
8. La base conectada ya contenía tablas y datos en español; no debe reinicializarse ni limpiarse para desarrollar nuevas funcionalidades.
9. Las migraciones de normalización al español dependen de que las migraciones previas hayan sido ejecutadas; probar una base limpia y una base existente antes de modificar esa cadena.
10. El frontend requiere `npm`, pero el entorno utilizado para la conexión solo tenía Node disponible; validar la instalación local de npm antes de ejecutar el build frontend.

## 14. Guía para futuros cambios

Antes de implementar:

1. Identificar si el cambio es frontend, backend, base de datos o transversal.
2. Revisar los tipos/DTOs, el contexto, el cliente API, la ruta, el request, el controlador, el modelo/policy y las pruebas relacionadas.
3. Mantener los nombres públicos del contrato salvo que el cambio incluya migración y compatibilidad explícitas.
4. Para cambios de esquema, crear migración nueva y actualizar modelo, relaciones, DTO y pruebas.
5. Para cambios de autenticación/autorización, probar invitado, colaborador y admin; validar también expiración/401 en frontend.
6. Ejecutar `npm run build` y `npm run lint` desde `frontend/` cuando el cambio toque TypeScript/UI.
7. Ejecutar `php artisan test` desde `backend/` cuando el cambio toque API, dominio, persistencia o seguridad.
8. Actualizar este archivo si cambia el stack, el propósito, la estructura, el contrato API, la autenticación o cualquier decisión arquitectónica.

## 15. Archivos de referencia rápida

- Shell y sesión frontend: `frontend/src/App.tsx`
- Estado de horas/cronómetro: `frontend/src/contextos/ContextoHoras.tsx`
- Cliente HTTP y DTOs: `frontend/src/servicios/api.ts`
- Login/registro: `frontend/src/vistas/VistaLogin.tsx`
- Contrato de rutas: `backend/routes/api.php`
- Autenticación: `backend/app/Http/Controllers/Api/AuthController.php`
- Modelo de usuario: `backend/app/Models/User.php`
- Registro de horas: `backend/app/Http/Controllers/Api/TimeEntryController.php`
- Proyectos: `backend/app/Http/Controllers/Api/ProjectController.php`
- Reportes: `backend/app/Http/Controllers/Api/ReportController.php` y `backend/app/Services/TimeEntryExcelReport.php`
- Políticas: `backend/app/Policies/`
- Esquema: `backend/database/migrations/`
- Compatibilidad con la base existente: `backend/database/migrations/2026_11_04_224000_align_existing_spanish_schema.php`
- Cobertura backend: `backend/tests/`
