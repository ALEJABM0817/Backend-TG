# Backend-TG

## Requisitos

- Docker
- Docker Compose
- Node.js
- yarn

## Configuración

### Entorno de Desarrollo

1. Clona el repositorio:

    ```sh
    git clone https://github.com/tu-usuario/Backend-TG.git
    cd Backend-TG
    ```

2. Crea un archivo `.env` con el siguiente contenido:

    ```properties
    SECRET_JWT_SEED=Palabr@-S3creTa!!
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=root
    DB_NAME=tg_backend

    MYSQL_ROOT_PASSWORD=root
    MYSQL_DATABASE=tg_backend
    MYSQL_USER=root
    MYSQL_PASSWORD=root

    EMAIL_USER=homehelpersco1@gmail.com
    EMAIL_PASS=tgfr zuha neef ynct

    URL_FRONTEND=http://localhost:5173
    ```

3. Modifica `.env` con tus valores locales si es necesario.

4. Asegúrate de que Docker esté en funcionamiento. Puedes iniciar Docker Desktop en Windows o macOS, o usar el siguiente comando en Linux:

    ```sh
    sudo systemctl start docker
    ```

5. Construye y levanta los servicios de Docker Compose:

    ```sh
    docker-compose up -d
    ```

6. Instala las dependencias del proyecto:

    ```sh
    yarn install
    ```

7. Inicia la aplicación en modo desarrollo:

    ```sh
    yarn dev
    ```

## Notas

- Asegúrate de tener Docker y Docker Compose instalados en tu sistema.
- Para Windows, puedes usar Docker Desktop para instalar Docker y Docker Compose.
- Para Linux, sigue las instrucciones oficiales de Docker para instalar Docker y Docker Compose.

### Comandos Útiles

- Para detener los servicios de Docker Compose:

    ```sh
    docker-compose down
    ```

- Para ver los logs de los servicios:

    ```sh
    docker-compose logs -f
    ```

- Para reconstruir los servicios después de hacer cambios en los Dockerfiles:

    ```sh
    docker-compose up -d --build
    ```

## Enlaces Útiles

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)