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

2. Copia el archivo `.env.example` a `.env.development`:

    ```sh
    cp .env.example .env.development
    ```

3. Copia el archivo `.env.development` a `.env`:

    ```sh
    cp .env.development .env
    ```

4. Modifica `.env.development` con tus valores locales si es necesario.

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