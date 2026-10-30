export const SESSION_COOKIE_NAME = "synapse_session";

export const JWT_ALGORITHM = "HS256";
export const JWT_ISSUER = "synapsehq";
export const JWT_AUDIENCE = "synapsehq-web";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;
export const BCRYPT_COST = 12;

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_SECONDS = 15 * 60;
export const LOGIN_BLOCK_SECONDS = 15 * 60;
