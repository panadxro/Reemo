<script>
import { getUserProfileById } from '../services/user-profile';
import { subscribeToAuthState } from '../services/auth';
import { savePrivateChatMessage, subscribeToPrivateChatMessages } from '../services/private-chat';
import { formatDateHour } from '../libraries/date';
// import { addAlert } from "@/services/alerts";

import Heading from '../components/atoms/Heading.vue';
import Loading from '@icons/Loading.vue';
import BackButton from "@components/atoms/BackButton.vue";
import Arrow from '../icons/Arrow.vue';
import Send from '../icons/Send.vue';

let unsubscribeAuth = () => { };

export default {
  name: "PrivateChat",
  components: { Heading, Loading, BackButton, Arrow, Send },
  props: ["id"],     
  data() {
    return {
      ownerUser: {
        id: null,
        email: null,
        photoURL: null,
        userName: null,
        name: null,
        lastName: null,
      },
      loggedUser: {
        id: null,
        email: null,
        photoURL: null,
        userName: null,
        name: null,
        lastName: null,
      },
      loadingUser:false,
      loadingMessage:false,
      messages: [],

      newMessage: {
        text: "",
      }
    };
  },
  methods:{   
    async handleSubmit(){
      try {
        savePrivateChatMessage(
          this.loggedUser.id,
          this.$route.params.id,
          this.newMessage.text
        )
        this.newMessage.text = "";
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    },
    formatDateHour(timestamp) {
      if (!timestamp) return "Enviando...";
      return formatDateHour(timestamp);
    }
  },  
  async mounted() {
    unsubscribeAuth = subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
    });

    this.loadingUser = true;
    
    getUserProfileById(this.$route.params.id).then((userProfile) => {
      this.ownerUser = userProfile;
      this.loadingUser = false;
    });

    this.loadingMessage = true;

    subscribeToPrivateChatMessages(
      this.loggedUser.id,
      this.$route.params.id,
      (newMessages) => {
        this.messages = newMessages;
        this.loadingMessage = false;
      }
    )
  },
  unmounted() {
    unsubscribeAuth();
  },
}
</script>

<template>
  <aside class="chat bg-vibrant-light-700 p-5 pt-8 flex flex-col gap-5 rounded-[40px] min-w-[250px]">
    <div v-if="loadingUser" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
      <Loading role="status" />
    </div>

    <div class="flex items-center gap-4">
      <BackButton/>
      <img 
        :src="ownerUser.photoURL"
        :alt="`Foto de perfil de ${ownerUser.userName}`" 
        class="w-8 h-8 rounded-full" 
      />
      <Heading :type="3" class="regular">{{ownerUser.name}} {{ownerUser.lastName}}</Heading>
    </div>
    
    <div class="h-full p-4 border rounded-[20px] bg-vibrant-light-600">
      <ul class="flex flex-col items-start gap-4 overflow-y-auto max-h-[400px]">
        <li
          v-for="message in messages"
          :key="message.id"
          :class="{
              'bg-deep-blue-900 text-white rounded-bl-xs': message.user_id !== loggedUser.id,
              'bg-background-900 rounded-br-xs': message.user_id === loggedUser.id,
              'self-end': message.user_id === loggedUser.id,
          }"
          class="p-4 rounded-xl  max-w-[80%] w-auto"
        >
          <div class="text-sm text-gray-800">{{ message.text }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ formatDateHour(message.created_at) || 'Enviando...' }}</div>
        </li>
      </ul>
    </div>
    
    <form 
      action="#"
      class="flex bg-background-900 rounded-[20px] gap-2 items-center p-2"
      @submit.prevent="handleSubmit"
      >
      <label for="text" class="sr-only">Mensaje</label>
      <textarea
        id="text"
        class="w-full min-h-[60px] border resize-none rounded-2xl p-2 outline-none border-background-900"
        v-model="newMessage.text"
        placeholder="Escribe un mensaje..."
        ></textarea>
      <button 
        type="submit" 
        class="transition-all h-min m-1 p-4 rounded-full text-white hover:bg-background-700 cursor-pointer active:bg-background-800 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{'opacity-50 cursor-not-allowed': newMessage.text.trim().length === 0 }"
        :disabled="newMessage.text.trim().length === 0"
      >
        <Send/>
        <span class="sr-only">Enviar</span>
      </button>
    </form>
  </aside>
</template>

<style scoped>
  .chat { grid-area: 1 / 4 / 3 / 6; }
</style>