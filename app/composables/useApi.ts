export function useApi<T>(path: string, options: object = {}) {
  // if (import.meta.server) return;
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  return useFetch<T>(path, {
    baseURL: config.public.apiBase,
    server: false,
    headers: computed(() => ({
      Authorization: `Bearer ${authStore.token}`,
    })),
    ...options,
  });
}

export function useApiRequest() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  return function request<T>(path: string, options: object = {}) {
    return $fetch<T>(path, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      ...options,
    });
  };
}
