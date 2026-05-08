export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const publicPaths = ["/login", "/accept-invite", "/reset-password"];

  const authStore = useAuthStore();
  await authStore.init();

  if (!authStore.isAuthenticated && !publicPaths.includes(to.path)) {
    return navigateTo("/login");
  }

  if (authStore.isAuthenticated && to.path === "/login") {
    return navigateTo("/dashboard");
  }
});
