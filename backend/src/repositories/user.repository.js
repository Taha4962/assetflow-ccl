const prisma = require('../utils/prismaClient');

const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      department: true,
    },
  });
};

const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true,
      createdAt: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
};

const findAll = async ({ where = {}, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const create = async (data) => {
  return await prisma.user.create({
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true,
      createdAt: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
};

const update = async (id, data) => {
  return await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true,
      createdAt: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
};

const softDelete = async (id) => {
  return await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: { isActive: false },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true,
    },
  });
};

const updatePassword = async (id, passwordHash) => {
  return await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: { passwordHash },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });
};

module.exports = {
  findByEmail,
  findById,
  findAll,
  create,
  update,
  softDelete,
  updatePassword,
};
