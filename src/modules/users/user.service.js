function getMockUsers() {
  try {
    const mockUsersData = process.env.MOCK_USERS || "[]";
    return JSON.parse(mockUsersData);
  } catch (error) {
    console.error("Failed to parse MOCK_USERS from .env", error);
    return [];
  }
}

export const userService = {
  getById(id) {
    if (process.env.ENABLE_MOCK_AUTH === "true") {
      const users = getMockUsers();
      return users.find((u) => u.id === Number(id) || null);
    }
  },

  getByEmail(email) {
    if (process.env.ENABLE_MOCK_AUTH === "true") {
      const users = getMockUsers();
      return users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || null,
      );
    }
  },
};
