<script>
import Login from "../icons/Login.vue";
import Reemo from '@icons/Reemo.vue';
import Home from '@icons/Home.vue'
import Search from '@icons/Search.vue'
import Map from '@icons/Map.vue'
import User from '@icons/User.vue'
import AlertRented from './rental/AlertRented.vue'
import QA from '@icons/QA.vue'
import Settings from '@icons/Settings.vue'
import Logout from '@icons/Logout.vue';
import Cars from '@icons/Cars.vue'
import People from '@icons/People.vue'

export default {
  name: "Sidebar",
  components: { Logout, Login, Reemo, AlertRented, Home, Search, Map, User, QA, Settings, Logout, Cars, People },
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
    <ul 
      v-if="user.role !== 'admin'"
      class="flex flex-col gap-6 items-center"
      >
      <li>
        <router-link
          to="/"
          title="Home"
          aria-current="page"
          >
          <Home />
          <span class="sr-only">Home</span>
        </router-link>
      </li>
      <li>
        <router-link
        to="/Publications"
        title="Search"
        aria-current="page"
        >
          <Search />
          <span class="sr-only">Search</span>
        </router-link>
      </li>
      <li>
        <a href="" title="Map">
          <Map />
          <span class="sr-only">Map</span>
        </a>
      </li>
      <li>
        <router-link
          to="/Profile"
          title="Profile"
          aria-current="page"
          active-class="text-secondary-900! bg-red-700"
        >
          <User />
          <span class="sr-only">Profile</span>
        </router-link>
      </li>
    </ul>
    <ul 
      v-else-if="user.role === 'admin'"
      class="flex flex-col gap-6 items-center"
      >
      <li>
        <router-link
          to="/"
          title="Home"
          aria-current="page"
          >
          <Home />
          <span class="sr-only">Home</span>
        </router-link>
      </li>
      <li>
        <router-link
        to="/Publications"
        title="Search"
        aria-current="page"
        >
          <Search />
          <span class="sr-only">Search</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/admin/CarsValidation"
          title="Admins cars"
          aria-current="page"
        >
          <Cars />
          <span class="sr-only">Admin cars</span>
        </router-link>
      </li>
      <li
      >
      <router-link
        to="/admin/Users"
        title="Admin users"
          aria-current="page"
        >
          <People/>
          <span class="sr-only">Admin users</span>
        </router-link>
      </li>
    </ul>
    <ul class="flex flex-col gap-6 items-center">
      <li 
        title="Notifications"
        class="aspect-square max-h-[24px]"
      >
        <AlertRented />
        <span class="sr-only">Notifications</span>
      </li>
      <li>
        <a href="" title="Questions & Answers">
          <QA />
          <span class="sr-only">Questions & Answers</span>
        </a>
      </li>
      <li>
        <a href="" title="Settings">
          <Settings />
          <span class="sr-only">Settings</span>
        </a>
      </li>
      <li>
        <form
          class="aspect-square max-h-[24px]"
          @submit.prevent="handleLogout"
          >
          <button 
            type="submit" 
            title="Logout"
            class="hover:cursor-pointer"
            >
            <Logout />
            <span class="sr-only">Logout</span>
          </button>
        </form>
      </li>
    </ul>
  </nav>
</template>