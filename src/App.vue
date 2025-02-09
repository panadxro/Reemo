<script>
import { logout, subscribeToAuthState } from "./services/auth";

import Navbar from "./components/Navbar.vue";
import FooterLayout from "./components/Footer.vue";
import Alert from "./components/atoms/Alert.vue";
import Sidebar from "./components/Sidebar.vue";

export default {
  name: "App",
  components: {
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
      this.$router.push("/Login");
    },
  },
  mounted() {
    subscribeToAuthState((newUserData) => (this.loggedUser = newUserData));
  },
};
</script>

<template>
  <!-- <Navbar :user="loggedUser" @logout="handleLogout" /> -->

  <main v-if="$route.path === '/'" class="flex flex-col min-h-screen mt-20 mx-auto">
    <router-view />
  </main>

  <main v-else class="flex flex-row min-h-screen max-h-screen p-2.5">
    <Sidebar :user="loggedUser" />
    <router-view />
  </main>
  <Alert />

  <FooterLayout />
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
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  ::-webkit-scrollbar-thumb {
    background: #a7ebef;
    border-radius: 16px;
    box-shadow: inset 0 0 0 3px #f1f1f1;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #4fd8df;
  }
  .no-scroll {
    overflow: hidden;
  }
</style>