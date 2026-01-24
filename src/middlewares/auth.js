import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "maddie_boutique_secret_key_123";

export function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(
      "❌ [AUTH] Missing or invalid authorization header:",
      authHeader ? "Header exists but no Bearer" : "No header"
    );
    return res.status(401).json({ message: "Não autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(
      "✅ [AUTH] Token verified successfully for user:",
      decoded.id,
      "role:",
      decoded.role
    );
    req.user = decoded; // { id, role, perfil_id }
    next();
  } catch (err) {
    console.error("❌ [AUTH] Token verification failed:", err.message);
    return res
      .status(401)
      .json({ message: "Não autorizado", error: err.message });
  }
}

export default autenticar;
