<script>
import { subscribeToAuthState } from "../../services/auth.js";
import { saveComment, subscribeToComment } from "../../services/comments.js";

let unsubscribeAuth = () => {};

export default {
  name: "Comment",
  props: ["carId"],
  data() {
    return {
      loggedUser: {
        id: null,
        email: null,
        userName: null,
        photoURL: null,
      },
      comments: [],
      newComment: {
        text: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      console.log("Estado del usuario:", this.loggedUser);

      if (!this.loggedUser.email || !this.loggedUser.id) {
        console.error("El usuario no está autenticado correctamente.");
        return;
      }

      if (this.carId && this.newComment.text) {
        // console.log("datos del usuario", this.loggedUser);
        saveComment({
          car_id: this.carId,
          user_id: this.loggedUser.id,
          user_email: this.loggedUser.email,
          user_name: this.loggedUser.userName,
          user_photo: this.loggedUser.photoURL,
          text: this.newComment.text,
        });
        this.newComment.text = "";


      } else {
        console.error("Faltan datos para enviar el comentario.");
      }
    },

    formatDate(date) {
      if (!date) return null;

      const formatter = new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return formatter.format(date).replace(",", "");
    },
  },
  async mounted() {
    subscribeToComment(
      this.carId,
      (newComments) => (this.comments = newComments)
    );
    unsubscribeAuth = subscribeToAuthState((newUserData) => {
      if (newUserData) {
        this.loggedUser = newUserData;
      } else {
        console.error("No se pudo obtener los datos del usuario.");
      }
    });
  },
  unmounted() {
    unsubscribeAuth();
  },
};
</script>

<template>
  <section class="bg-white py-8 lg:py-16 antialiased">
    <div class="max-w-2xl mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg lg:text-2xl font-bold text-gray-900">Comentarios</h2>
      </div>

      <article
        class="p-4 text-base bg-white rounded-lg"
        v-for="comment in comments"
        :key="comment.id"
      >
        <footer class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <p
              class="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold"
            >
              <img
                class="mr-2 w-6 h-6 rounded-full"
                :src="comment.user_photo"
                alt=""
              />
              @{{ comment.user_name }}
            </p>
            <p class="text-sm text-gray-600">
              <time pubdate datetime="2022-02-12" title="February 12th, 2022">{{
                comment.user_email
              }}</time>
            </p>
          </div>
        </footer>
        <p class="text-gray-500">{{ comment.text }}</p>
        <div class="text-md text-gray-600">{{ comment.createdAt ? formatDate(comment.createdAt.toDate()) : "Enviando..." }}</div>
      </article>

      <form class="mb-6" action="#" @submit.prevent="handleSubmit">
        <div
          class="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200"
        >
          <label for="message" class="sr-only">Tu comentario</label>
          <textarea
            v-model="newComment.text"
            id="message"
            rows="6"
            class="px-0 w-full text-sm text-gray-900 border-0 resize-none focus:ring-0 focus:outline-hidden"
            placeholder="Escribir un comentario..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          class="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
        >
          Enviar
        </button>
      </form>
    </div>
  </section>
</template>
