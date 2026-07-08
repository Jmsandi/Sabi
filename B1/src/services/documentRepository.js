/**
 * Thin persistence boundary over Prisma. Keeping data access behind this
 * interface means the route handler depends on `findByDoi` / `create` only —
 * which is exactly what the tests substitute with an in-memory fake.
 */
export function createDocumentRepository(prisma) {
  return {
    findByDoi(doi) {
      if (!doi) {
        return Promise.resolve(null);
      }
      return prisma.document.findUnique({ where: { doi } });
    },

    create(document) {
      return prisma.document.create({ data: document });
    },
  };
}
