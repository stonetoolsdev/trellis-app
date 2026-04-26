export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  await authStore.init();

  if (!authStore.isAuthenticated && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (authStore.isAuthenticated && to.path === "/login") {
    return navigateTo("/dashboard");
  }
});
