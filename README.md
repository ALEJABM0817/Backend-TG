# Backend-TG

## Requisitos

- Docker
- Docker Compose
- Docker Desktop (Windows)
- Node.js
- yarn

## Configuración

### Entorno de Desarrollo

1. Clona el repositorio:

    ```sh
    git clone https://github.com/ALEJABM0817/Backend-TG.git
    cd Backend-TG
    code .
    ```

2. Crea un archivo `.env` y copia el contenido de `.env.example`:

    ```sh
    cp .env.example .env
    ```

3. Modifica `.env` con tus valores locales si es necesario.

4. Crear el volumen en Docker en una terminal:

    ```sh
    docker volume create mymysql
    ```

### Iniciar el Contenedor de Docker

5.1 Crea e inicia el contenedor de Docker:

    ```sh
    docker run --name mymysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=tg_backend -p 3306:3306 -d mysql
    ```

5.2 Ingresa al contenedor de MySQL:

    ```sh
    docker exec -it mymysql bash
    ```

5.3 Entra a la base de datos de MySQL:

    ```sh
    mysql -u root --password
    ```

    Luego escribe `root` cuando se te solicite la contraseña.

5.4 Crea una base de datos llamada `tg_backend`:

    ```sh
    CREATE DATABASE tg_backend;
    ```

5.5 Usa la base de datos creada:

    ```sh
    USE tg_backend;
    ```

5.6 Ejecuta todas las consultas del archivo `database/db.sql`.

5.7 Si ya se ha creado todo esto y solo necesitas correr el contenedor de Docker, abre Docker Desktop y dale play al contenedor `mymysql`.

### Instalar Dependencias e Iniciar la Aplicación

6. Instala las dependencias del proyecto:

    ```sh
    yarn install
    ```

6. Inicia la aplicación en modo desarrollo:

    ```sh
    yarn dev
    ```

## Notas

- Asegúrate de tener Docker y Docker Compose instalados en tu sistema.
- Para Windows, puedes usar Docker Desktop para instalar Docker y Docker Compose.
- Para Linux, sigue las instrucciones oficiales de Docker para instalar Docker y Docker Compose.

## Enlaces Útiles

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)