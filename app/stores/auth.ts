import { defineStore } from "pinia";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const tokenCookie = useCookie("trellis_token", {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  function setToken(newToken: string, remember: boolean = false) {
    token.value = newToken;
    if (remember) {
      tokenCookie.value = newToken;
    } else {
      // store in sessionStorage for current browser session only
      if (import.meta.client) {
        sessionStorage.setItem("trellis_token", newToken);
      }
    }
  }

  async function fetchUser() {
    const config = useRuntimeConfig();
    console.log("fetchUser - token:", token.value);
    try {
      const data = await $fetch<{ user: User }>("/api/v1/me", {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      user.value = data.user;
    } catch (e) {
      console.log("fetchUser - error:", e);
      await logout();
    }
  }

  async function login(email: string, password: string, remember: boolean) {
    const config = useRuntimeConfig();
    const data = await $fetch<{ token: string }>("/api/v1/login", {
      method: "POST",
      baseURL: config.public.apiBase,
      body: { email, password },
    });
    setToken(data.token, remember);
    await fetchUser();
    return data;
  }

  async function logout() {
    const config = useRuntimeConfig();
    try {
      await $fetch("/api/v1/logout", {
        method: "POST",
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
    } catch {}
    token.value = null;
    user.value = null;
    tokenCookie.value = null;
    if (import.meta.client) {
      sessionStorage.removeItem("trellis_token");
    }
  }

  async function init() {
    console.log("init - cookie:", tokenCookie.value);
    console.log(
      "init - sessionStorage:",
      import.meta.client ? sessionStorage.getItem("trellis_token") : "SSR",
    );
    const persistedToken =
      tokenCookie.value ||
      (import.meta.client ? sessionStorage.getItem("trellis_token") : null);
    console.log("init - persistedToken:", persistedToken);
    if (persistedToken && !user.value) {
      token.value = persistedToken;
      await fetchUser();
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    init,
    setToken,
    fetchUser,
  };
});
