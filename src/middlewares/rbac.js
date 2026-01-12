/**
 * Middleware para verificar o perfil (role) do utilizador.
 * @param {Array} perfisPermitidos - Lista de perfis que podem aceder à rota (ex: ['admin', 'funcionario'])
 */
export const verificarPerfil = (perfisPermitidos) => {
  return (req, res, next) => {
    // 1. Verificar se o utilizador existe no req (preenchido pelo middleware de auth)
    if (!req.user) {
      return res.status(401).json({ message: "Utilizador não autenticado." });
    }

    // 2. Verificar se o perfil do utilizador está na lista de perfis permitidos
    // O campo 'role' vem do token JWT que descriptografamos no auth.js
    if (!perfisPermitidos.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Acesso negado: o seu perfil não tem permissão para esta funcionalidade." 
      });
    }

    // 3. Se estiver tudo ok, prossegue para o controller
    next();
  };
};