<script>
import { getUserProfileById } from '../services/user-profile';
import { subscribeToAuthState } from '../services/auth';
import { savePrivateChatMessage, subscribeToPrivateChatMessages } from '../services/private-chat';
import { formatDateHour } from '../libraries/date';
// import { addAlert } from "@/services/alerts";

import Heading from '../components/atoms/Heading.vue';
import Loading from '@icons/Loading.vue';

let unsubscribeAuth = () => { };

export default {
    name: "PrivateChat",
    components: { Heading, Loading },
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
            console.log("Hola:", this.ownerUser)
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
        // noSubmit(e) {
        //     if(this.newMessage.text === ""){
        //         addAlert("No puedes enviar mensajes vacios", "error");
        //         e.preventDefault();
        //     }
        // },
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
            newMessages => {
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
    <div v-if="loadingUser" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
        <Loading role="status" />
    </div>

    <div class="flex justify-center items-center gap-4 py-4">
        <img :src="ownerUser.photoURL"
        :alt="`Foto de perfil de ${ownerUser.userName}`" class="w-16 h-16 rounded-full" />
    <Heading :type="2" class="mb-4 text-center">{{ownerUser.name}} {{ownerUser.lastName}}</Heading>
    </div>
    
    
    <div class="min-h-[400px] p-4 mb-4 border rounded">
        <ul class="flex flex-col items-start gap-4">
            <li
                v-for="message in messages"
                :key="message.id"
                :class="{
                    'bg-gray-200': message.user_id !== loggedUser.id,
                    'bg-green-200': message.user_id === loggedUser.id,
                    'self-end': message.user_id === loggedUser.id,
                }"
                class="p-4 rounded"
            >
                <div>{{ message.text }}</div>
                <div class="text-md text-gray-600">{{ formatDateHour(message.created_at) || 'Enviando...' }}</div>
            </li>
        </ul>
    </div>
    <form 
            action="#"
            class="flex gap-4 items-stretch"
            @submit.prevent="handleSubmit"
        >
            <label 
                for="text"
                class="sr-only"
            >Mensaje</label>
            <textarea
                id="text"
                class="w-full min-h-8 p-2 border rounded"
                v-model="newMessage.text"
            ></textarea>
            <button 
                type="submit" 
                class="transition-all py-2 px-4 rounded bg-blue-700 text-white focus:bg-blue-500 hover:bg-blue-500 active:bg-blue-900"
                :class="{
                    'opacity-50 cursor-not-allowed': newMessage.text.trim().length === 0
                }"
                :disabled="newMessage.text.trim().length === 0"
                >
                Enviar
            </button>
        </form>

</template>