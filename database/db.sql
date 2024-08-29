CREATE TABLE usuarios (
    cedula INTEGER PRIMARY KEY NOT NULL UNIQUE,
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