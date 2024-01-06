DROP TABLE IF EXISTS Todo;
DROP TABLE IF EXISTS Image;
DROP TABLE IF EXISTS Location;


DROP TABLE IF EXISTS Trip;

CREATE TABLE Trip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Location (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
    description TEXT,
    trip_id INT,         
    FOREIGN KEY (trip_id) REFERENCES Trip(id) ON DELETE CASCADE
);
CREATE TABLE Image (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path VARCHAR(255),  -- Store image file paths or URLs
    location_id INT,         -- Foreign key to link an image to a location
    todo_id INT,             -- Foreign key to link an image to a todo
    -- Add any other image-related fields as needed
    FOREIGN KEY (location_id) REFERENCES Location(id) ON DELETE CASCADE,
    FOREIGN KEY (todo_id) REFERENCES Todo(id) ON DELETE CASCADE
);

CREATE TABLE Todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    links VARCHAR(255),   -- You can store links or URLs
    address VARCHAR(255), -- Address related to the todo
    location_id INT,      -- Foreign key to link a todo to a location
    FOREIGN KEY (location_id) REFERENCES Location(id) ON DELETE CASCADE
);
