<script>
import { onMounted, ref, computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore, useAuthStore } from '@stores';
import { savePrivateChatMessage, subscribeToPrivateChatMessages } from '../services/private-chat';
import { formatDateHour } from '../libraries/date';

import Heading from '../components/atoms/Heading.vue';
import Loading from '@icons/Loading.vue';
import BackButton from "@components/atoms/BackButton.vue";
import Arrow from '../icons/Arrow.vue';
import Send from '../icons/Send.vue';

export default {
  name: "PrivateChat",
  components: { Heading, Loading, BackButton, Arrow, Send },
  
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const route = useRoute();
    
    const loadingMessage = ref(false);
    const messages = ref([]);
    const newMessage = ref({
      text: "",
    });
    // Referencia al contenedor de mensajes para hacer scroll
    // y mantener la posición al enviar o recibir mensajes, maso conmo wpp
    // porque antes cuando enviabas un mensaje y ya exisitian muchos (con scroll)
    // se quedaba en la parte de arriba y no se veía el mensaje enviado
    const messagesContainer = ref(null);

    const userIdFromRoute = computed(() => {
      return route.params.id;
    });

    const loggedUserId = computed(() => {
      return authStore.user?.id;
    });

    
    const ownerUser = computed(() => {
      if (userStore.visitedProfileData) {
        return {
          // Estos sonm los datos del usuario al que chateamos, 
          // el usernam lo uso en el alt de la img
          id: userIdFromRoute.value,
          photoURL: userStore.visitedProfileData.personalInfo?.profilePhoto || '',
          userName: userStore.visitedProfileData.personalInfo?.userName || '',
          name: userStore.visitedProfileData.personalInfo?.firstName || '',
          lastName: userStore.visitedProfileData.personalInfo?.lastName || '',
        };
      }
      return {
        id: null,
        photoURL: '',
        userName: '',
        name: '',
        lastName: '',
      };
    });

    const loadingUser = computed(() => {
      return userStore.loading;
    });

    const handleSubmit = async () => {
      try {
        await savePrivateChatMessage(
          loggedUserId.value,
          userIdFromRoute.value,
          newMessage.value.text
        );
        newMessage.value.text = "";
        // Scroll automático después de enviar mensaje
        // NextTick es una funcion de Vue que espera a que el DOM se actualice
        // antes de ejecutar la función, asegurando que 
        // el scroll (en este caso) se aplique correctamente
        await nextTick();
        scrollToBottom();
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    };

    // funcion paar que haga scroll al final del contenedor de mensajes.
    // Se usa en handleSubmit y en el subscribeToPrivateChatMessages por si 
    // cuando cargan los mensajes, y complentan el alto, que ytabien vaya al final
    // del contenedor de mensajes En el watch tambien para que se vaya actualizando
    // cuando cambian los mensajes
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    const formatDateHourHelper = (timestamp) => {
      if (!timestamp) return "Enviando...";
      return formatDateHour(timestamp);
    };

    onMounted(async () => {
      try {
        await userStore.loadUserProfile(userIdFromRoute.value);
      } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
      }

      loadingMessage.value = true;

      subscribeToPrivateChatMessages(
        loggedUserId.value,
        userIdFromRoute.value,
        (newMessages) => {
          messages.value = newMessages;
          loadingMessage.value = false;
          // Scroll automático cuando llegan nuevos mensajes
          nextTick(() => {
            scrollToBottom();
          });
        }
      );
    });

    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    }, { deep: true });

    return {
      userStore,
      ownerUser,
      loadingUser,
      loadingMessage,
      messages,
      newMessage,
      loggedUserId,
      handleSubmit,
      formatDateHour: formatDateHourHelper,
      messagesContainer,
      scrollToBottom
    };
  }
}
</script>

<template>
  <aside class="chat flex flex-col bg-vibrant-light-700 xl:rounded-[40px] xl:min-w-[250px] xl:p-5 xl:pt-8 xl:gap-5 
                h-screen xl:h-auto p-0 gap-0">
    
    <div class="shrink-0 p-4 xl:p-0 bg-vibrant-light-700 xl:bg-transparent">
      <div v-if="loadingUser" class="flex items-center justify-center w-fit mx-auto">
        <Loading role="status" />
      </div>

      <div class="flex items-center gap-4" v-else>
        <BackButton class="xl:block"/>
        <img 
          :src="ownerUser.photoURL"
          :alt="`Foto de perfil de ${ownerUser.userName}`" 
          class="w-8 h-8 rounded-full" 
        />
        <Heading :type="3" class="regular">{{ownerUser.name}} {{ownerUser.lastName}}</Heading>
      </div>
    </div>
    
    <div class="flex-1 mx-4 xl:mx-0 mb-4 xl:mb-0 border rounded-[20px] bg-vibrant-light-600 overflow-hidden flex flex-col xl:h-[610px]">
      <ul 
        ref="messagesContainer"
        class="flex-1 flex flex-col items-start gap-4 overflow-y-auto p-4 xl:max-h-[600px] scroll-smooth"
      >
        <li v-if="loadingMessage" class="w-full flex justify-center py-8">
          <Loading class="w-6 h-6" />
        </li>
        
        <li
          v-for="message in messages"
          :key="message.id"
          :class="{
              'bg-deep-blue-900 text-white rounded-bl-xs': message.user_id !== loggedUserId,
              'bg-background-900 text-primary-900 rounded-br-xs': message.user_id === loggedUserId,
              'self-end': message.user_id === loggedUserId,
          }"
          class="p-4 rounded-xl max-w-[80%] w-auto"
        >
          <div class="text-sm">{{ message.text }}</div>
          <div class="text-xs text-background-600 mt-1">{{ formatDateHour(message.created_at) || 'Enviando...' }}</div>
        </li>
      </ul>
    </div>
    
    <div class="shrink-0 p-4 xl:p-0 bg-vibrant-light-700 xl:bg-transparent">
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
    </div>
  </aside>
</template>

<style scoped>
  .chat { 
    grid-area: 1 / 4 / 3 / 6; 
  }
  
  /* Estilos específicos para móvil */
  @media (max-width: 1279px) {
    .chat {
      grid-area: unset;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 48;
    }
  }
</style>