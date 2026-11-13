export const permissionServiceClient = {
  async ListUserPermission({ advent }: { advent: boolean }) {
    return { page: { total: advent ? 2 : 12 } };
  },
};
