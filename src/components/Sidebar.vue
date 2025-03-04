<script>
import Login from "../icons/Login.vue";
import Reemo from '@icons/Reemo.vue';
import Home from '@icons/Home.vue'
import Search from '@icons/Search.vue'
import Map from '@icons/Map.vue'
import UserIcon from '@icons/UserIcon.vue'
import AlertRented from './rental/AlertRented.vue'
import QA from '@icons/QA.vue'
import Settings from '@icons/Settings.vue'
import Logout from '@icons/Logout.vue';
import Cars from '@icons/Cars.vue'
import People from '@icons/People.vue'
import IconNavButton from './molecules/IconNavButton.vue'

export default {
  name: "Sidebar",
  components: { Logout, Login, Reemo, AlertRented, Home, Search, Map, UserIcon, QA, Settings, Logout, Cars, People, IconNavButton },
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
  <nav class="bg-secondary-100 flex flex-col justify-between min-h-full m-2.5 py-12 px-5 rounded-full">
    <ul 
      v-if="user.role !== 'admin'"
      class="flex flex-col gap-2 items-center"
      >
      <li>
        <IconNavButton to="/" title="Home">
          <Home />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/Publications" title="Search">
          <Search />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/Publications" title="Map">
          <Map />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/Profile" title="Profile">
          <UserIcon />
        </IconNavButton>
      </li>
    </ul>
    <ul 
      v-else-if="user.role === 'admin'"
      class="flex flex-col gap-2 items-center"
      >
      <li>
        <IconNavButton to="/" title="Home">
          <Home />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/Publications" title="Search">
          <Search />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/CarsValidation" title="Admin cars">
          <Cars />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/Users" title="Admin users">
          <People />
        </IconNavButton>
      </li>
    </ul>
    <ul class="flex flex-col gap-2 items-center">
      <li title="Notifications">
        <AlertRented />
      </li>
      <li>
        <IconNavButton to="/" title="Questions & Answers">
          <QA />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/" title="Settings">
          <Settings />
        </IconNavButton>
      </li>
      <li>
        <form
          @submit.prevent="handleLogout"
          >
          <button 
            type="submit" 
            title="Logout"
            class=" flex items-center justify-center p-2 rounded-full transition-colors duration-300 cursor-pointer hover:bg-vibrant-light-800"
            active-class="bg-vibrant-light-800hover:cursor-pointer hover:bg-vibrant-light-800"
            >
            <Logout />
            <span class="sr-only">Logout</span>
          </button>
        </form>
      </li>
    </ul>
  </nav>
</template>