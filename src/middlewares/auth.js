// src/middleware/auth.js
export default function auth(req, res, next) {
    console.log("Middleware auth executado");
    next();
}