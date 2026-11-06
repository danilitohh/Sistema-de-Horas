# Base de datos local

El archivo `basededatosestasies.sql` es un volcado de la base local con el catálogo y cuentas de prueba. Contiene datos internos, por eso se excluye de Git. El responsable del proyecto debe compartirlo con el equipo por un canal privado.

## Importar en MySQL

Desde la raíz del repositorio, en PowerShell:

```powershell
mysql -u root -p < backend/database/sql/basededatosestasies.sql
```

El dump crea/selecciona la base `basededatosestasies`. Ajusta el usuario, host y puerto si tu MySQL usa otros valores.

Luego prepara el backend:

```powershell
if (!(Test-Path backend/.env)) { New-Item -ItemType File backend/.env | Out-Null }
Set-Location backend
composer install
php artisan key:generate
php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

Copia el valor generado en `JWT_SECRET` dentro de `backend/.env`, configura las variables `TEMPO_MYSQL_*` y ejecuta:

```powershell
php artisan migrate
php artisan serve --port=8002
```

`backend/.env` y el dump SQL no deben subirse al repositorio. Cada desarrollador debe usar claves y credenciales locales propias.
