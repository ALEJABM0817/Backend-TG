CREATE TABLE usuarios (
    cedula BIGINT PRIMARY KEY NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    telefono VARCHAR(10) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    typeUser VARCHAR(50) NOT NULL
);

CREATE TABLE ofertantes (
    cedula INTEGER PRIMARY KEY NOT NULL,
    complete_info BOOLEAN NOT NULL DEFAULT FALSE,
    photo VARCHAR(255),
    areas VARCHAR(255) NOT NULL,
    FOREIGN KEY (cedula) REFERENCES usuarios(cedula)
);

CREATE TABLE experiencia (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    cedula INTEGER,
    hasExperience BOOLEAN NOT NULL,
    title VARCHAR(100),
    company VARCHAR(100),
    startDate DATE,
    isCurrent BOOLEAN,
    endDate DATE,
    responsibilities TEXT,
    FOREIGN KEY (cedula) REFERENCES usuarios(cedula)
);

CREATE TABLE servicios (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- INSERT INTO servicios (nombre) VALUES ('Jardineria'), ('Plomeria'), ('Limpieza'), ('Lavanderia');

CREATE TABLE tipos_tarifas (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- INSERT INTO tipos_tarifas (nombre) VALUES ('media_jornada'), ('jornada_completa');

CREATE TABLE tarifas (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    cedula BIGINT,
    servicio_id INTEGER,
    tipo_tarifa_id INTEGER,
    precio DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cedula) REFERENCES usuarios(cedula),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    FOREIGN KEY (tipo_tarifa_id) REFERENCES tipos_tarifas(id)
);