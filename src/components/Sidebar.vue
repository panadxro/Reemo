<script>
import Logout from "../icons/Logout.vue";
import Login from "../icons/Login.vue";
import Reemo from '@icons/Reemo.vue';
import AlertRented from './rental/AlertRented.vue'
import Home from '@icons/Home.vue'

export default {
  name: "Sidebar",
  components: { Logout, Login, Reemo, AlertRented, Home },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data(){
    return{
      rentalRequest: null,
    }
  },
  methods: {
    handleLogout() {
      this.$emit("logout");
    },
  },
};


</script>

<template>
  <nav class="bg-secondary-100 flex flex-col justify-between min-h-full m-2.5 py-12 px-7 rounded-full">
    <ul class="flex flex-col gap-6 items-center">
      <li>
        <a href="" title="Home">
          <Home />
          <span class="sr-only">Home</span>
        </a>
      </li>
      <li>
        <a href="" title="Search">
          <Home />
          <span class="sr-only">Search</span>
        </a>
      </li>
      <li>
        <a href="" title="Map">
          <Home />
          <span class="sr-only">Map</span>
        </a>
      </li>
      <li>
        <a href="" title="Profile">
          <Home />
          <span class="sr-only">Profile</span>
        </a>
      </li>
    </ul>
    <ul class="flex flex-col gap-4 items-center">
      <li>
        <a href="" title="Notifications">
          <Home />
          <span class="sr-only">Notifications</span>
        </a>
      </li>
      <li>
        <a href="" title="Questions & Answers">
          <Home />
          <span class="sr-only">Questions & Answers</span>
        </a>
      </li>
      <li>
        <a href="" title="Settings">
          <Home />
          <span class="sr-only">Settings</span>
        </a>
      </li>
      <li>
        <a href="" title="Logout/Login">
          <Home />
          <span class="sr-only">Logout/Login</span>
        </a>
      </li>
    </ul>
  </nav>
</template>