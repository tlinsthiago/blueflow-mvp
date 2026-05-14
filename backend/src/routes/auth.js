import argon2 from 'argon2';

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function authRoutes(app) {
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body ?? {};

    if (!email || !password) {
      return reply.code(400).send({
        data: null,
        meta: {},
        errors: [{ message: 'E-mail e senha são obrigatórios.' }],
      });
    }

    const user = await app.prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return reply.code(401).send({
        data: null,
        meta: {},
        errors: [{ message: 'Credenciais inválidas.' }],
      });
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) {
      return reply.code(401).send({
        data: null,
        meta: {},
        errors: [{ message: 'Credenciais inválidas.' }],
      });
    }

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      data: {
        token,
        user: serializeUser(user),
      },
      meta: {},
      errors: [],
    };
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await app.prisma.user.findUnique({
      where: { id: request.user.sub },
    });

    if (!user || !user.isActive) {
      return reply.code(401).send({
        data: null,
        meta: {},
        errors: [{ message: 'Usuário não encontrado ou inativo.' }],
      });
    }

    return {
      data: {
        user: serializeUser(user),
      },
      meta: {},
      errors: [],
    };
  });
}
