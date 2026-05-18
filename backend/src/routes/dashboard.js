import { ok } from '../lib/http.js';

const dashboardRoles = ['admin', 'manager', 'collaborator'];

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  return { start, end };
}

function buildMonthWhere(start, end) {
  return {
    visitDate: {
      gte: start,
      lt: end,
    },
  };
}

export async function dashboardRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/summary', async (request, reply) => {
    if (!dashboardRoles.includes(request.currentUser.role)) {
      return reply.code(403).send({
        data: null,
        meta: {},
        errors: [{ message: 'VocÃª nÃ£o tem permissÃ£o para acessar o dashboard.' }],
      });
    }

    const { start, end } = getCurrentMonthRange();
    const monthWhere = buildMonthWhere(start, end);

    const [
      activeCondominiums,
      activeTechnicians,
      visitsThisMonth,
      pendingVisits,
      completedVisitsThisMonth,
      scheduledVisits,
      criticalChecklistItems,
      attentionChecklistItems,
      latestVisits,
    ] = await Promise.all([
      app.prisma.condominium.count({ where: { status: 'Ativo' } }),
      app.prisma.technician.count({ where: { status: 'Ativo' } }),
      app.prisma.visit.count({ where: monthWhere }),
      app.prisma.visit.count({ where: { status: 'pending' } }),
      app.prisma.visit.count({ where: { ...monthWhere, status: 'completed' } }),
      app.prisma.visit.count({ where: { status: 'scheduled' } }),
      app.prisma.visitChecklistItem.count({ where: { status: 'critical' } }),
      app.prisma.visitChecklistItem.count({ where: { status: 'attention' } }),
      app.prisma.visit.findMany({
        where: { status: 'completed' },
        include: {
          condominium: {
            select: { id: true, name: true },
          },
          technician: {
            select: { id: true, name: true },
          },
        },
        orderBy: { visitDate: 'desc' },
        take: 8,
      }),
    ]);

    const condominiumsWithoutCompletedVisit = await app.prisma.condominium.findMany({
      where: {
        status: 'Ativo',
        visits: {
          none: {
            ...monthWhere,
            status: 'completed',
          },
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        monthlyWindow: true,
      },
      orderBy: { name: 'asc' },
    });

    return ok(
      {
        totals: {
          activeCondominiums,
          activeTechnicians,
          visitsThisMonth,
          pendingVisits,
          completedVisitsThisMonth,
          scheduledVisits,
          criticalChecklistItems,
          attentionChecklistItems,
          condominiumsWithoutCompletedVisit: condominiumsWithoutCompletedVisit.length,
        },
        pendingCondominiums: condominiumsWithoutCompletedVisit,
        latestVisits: latestVisits.map((visit) => ({
          id: visit.id,
          condominiumId: visit.condominiumId,
          condominiumName: visit.condominium?.name ?? 'CondomÃ­nio nÃ£o identificado',
          technicianId: visit.technicianId,
          technicianName: visit.technician?.name ?? 'TÃ©cnico nÃ£o identificado',
          serviceType: visit.serviceType,
          status: visit.status,
          visitDate: visit.visitDate,
        })),
      },
      {
        monthStart: start.toISOString(),
        monthEnd: end.toISOString(),
      }
    );
  });
}
