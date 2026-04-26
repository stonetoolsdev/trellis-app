export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // redirect to dashboard since there is currently no index page
  if (to.name === "index") {
    navigateTo("/dashboard");
  }
});
