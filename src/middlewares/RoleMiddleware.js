export function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ message: "Acesso negado para este perfil" });
    }
    next();
  };
}
