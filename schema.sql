DROP TABLE IF EXISTS Users;

CREATE TABLE IF NOT EXISTS Users (
    UserId INTEGER PRIMARY KEY,
    Username TEXT,
    AuthenticatorKey TEXT
);
