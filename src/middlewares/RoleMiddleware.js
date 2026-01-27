const RoleMiddleware = (rolesPermitidos) => {
  const roles = Array.isArray(rolesPermitidos)
    ? rolesPermitidos
    : [rolesPermitidos];

  return (req, res, next) => {
    console.log("USUÁRIO TENTANDO ACESSO:", req.user);
    console.log("ROLES PERMITIDAS:", roles);

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acesso negado",
        debug_recebido: req.user?.role,
        debug_esperado: roles
      });
    }

    next();
  };
};

export default RoleMiddleware;
