<script>
import { logout, subscribeToAuthState } from "./services/auth";

import SimpleLayout from "./pages/SimpleLayout.vue";
import Navbar from "./components/Navbar.vue";
import FooterLayout from "./components/Footer.vue";
import Alert from "./components/atoms/Alert.vue";
import Sidebar from "./components/Sidebar.vue";

export default {
  name: "App",
  components: {
    SimpleLayout,
    Navbar,
    FooterLayout,
    Alert,
    Sidebar,
  },
  data() {
    return {
      loggedUser: {
        id: null,
        email: null,
        photoURL: null,
        userName: null,
        name: null,
        lastName: null,
      },
    };
  },
  methods: {
    handleLogout() {
      logout();
      this.loggedUser = {
        id: null,
        email: null,
      };
      this.$router.push("/login");
    },
  },
  mounted() {
    subscribeToAuthState((newUserData) => (this.loggedUser = newUserData));
  },
};
</script>

<template>
  <div v-if="$route.path === '/'">
    <Navbar :user="loggedUser" @logout="handleLogout" class="fixed"/>
    <main  class="flex flex-col min-h-screen mt-20 mx-auto">
      <router-view />
    </main>
    <FooterLayout />
  </div>
  
  <SimpleLayout v-else-if="['/login', '/register', '/ForgotPassword', '/onboarding'].includes($route.path)" />

  <div v-else class="snap-y snap-mandatory relative w-full h-screen overflow-auto">
    <Navbar :user="loggedUser" @logout="handleLogout" class="snap-start" />
    <main class="flex flex-row min-h-screen max-h-screen p-2.5 snap-start relative">
      <Sidebar :user="loggedUser" />
      <router-view />
    </main>
    <FooterLayout class="snap-start" />
  </div>
  
  <Alert />
</template>

<style>
html {
    font-family:
      "Onest",
      Monaco,
      Lucida Console,
      "Courier New",
      Courier,
      monospace;
    background: #fff;
    letter-spacing: -0.025rem;
  }

  body,
  figure {
    margin: 0;
    padding: 0;
  }

  a {
    text-decoration: none;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  h1,
  h2,
  h3,
  h4 {
    margin: 0;
    font-family:
      "Onest",
      sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
  }
  ::-webkit-scrollbar {
    width: 16px;
    margin: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: #a7ebef;
    border-radius: 16px;
    box-shadow: inset 0 0 0 3px #ffffff;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #4fd8df;
  }

  .no-scroll {
    overflow: hidden;
  }
</style>