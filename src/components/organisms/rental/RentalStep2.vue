<script>
import RentalFooter from "@/components/organisms/rental/RentalFooter.vue";
import DateTime from "@/components/organisms/rental/DateTime.vue";
import Dropdown from "@components/molecules/Dropdown.vue";
import Heading from "@components/atoms/Heading.vue"
import BackButton from "@components/atoms/BackButton.vue";

export default {
  components: {
    RentalFooter,
    DateTime,
    Dropdown,
    Heading,
    BackButton
  },
  props: {
    car: {
      type: Object,
      required: true
    },
    loggedUser: {
      type: Object,
      required: true
    },
    rented: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rentalData: {
        rentedFromDate: "",
        rentedUntilDate: "",
        selectedTime: "",
        selectedUntilTime: "",
        currentTotalPrice: 0
      }
    };
  },
  methods: {

    handleDateUpdate() {
      //Hay que tener esta funcion para que no aparezca el error en consola,
      //pero como esta desahabilitado no se va a usar el actualizar fecha
    },

    goToConfirmation() {
      this.$router.push(`/car/${this.car.id}/confirmation`);
    },
    calculatePercentage(percentage){
      return this.rentalData.currentTotalPrice * (percentage / 100);
    }
  },
  mounted() {
    this.$emit('hide-map');

    const savedData = localStorage.getItem('rentalData');
    if (savedData) {
      this.rentalData = JSON.parse(savedData);
    } else {
      this.$router.push(`/car/${this.car.id}`);
    }
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4 text-white">
      <BackButton class="bg-white"/>
      <h2 class="text-xl font-bold ">Información</h2>
    </div>
      <p class="text-white">2/4</p>
    </div>

    <DateTime @update-dates="handleDateUpdate" :disabled="true" :initial-values="{
      rentedFromDate: rentalData.rentedFromDate,
      rentedUntilDate: rentalData.rentedUntilDate,
      rentedFromHour: rentalData.selectedTime,
      rentedUntilHour: rentalData.selectedUntilTime
    }" />

    <!-- Es el componente hecho con Dropdowns para no borrarlo por si lo quieren -->
    <!-- Hay mucha diferencia entre el 4 y el 3 -->
    <!-- <div class="mt-8">
      <Heading type="3" class="text-white">Tiempos de reserva</Heading>
      
    <Dropdown class="flex flex-col py-5 rounded-3xl text-white">
      <template #title>
        <Heading type="5" class="text-white">Tiempos estipulados</Heading>
      </template>
<p class="pt-4 text-white">Al elegir fecha de retiro y de devolución, el usuario se compromete con el propietario para
  devolverlo en tiempo y forma.</p>
</Dropdown>

<Dropdown class="flex flex-col py-5 rounded-3xl text-white">
  <template #title>
        <Heading type="5" class="text-white">Exceso de tiempo</Heading>
      </template>
  <p class="pt-4 text-white">Al exceder el tiempo elegido, se cobra una tarifa adicional de $10.000 por cada hora.</p>
</Dropdown>
</div> -->

    <!-- <div class="mt-8">
      <Heading type="3" class="text-white">Política de cancelación</Heading>
      
    <Dropdown class="flex flex-col py-5 rounded-3xl text-white">
      <template #title>
        <Heading type="5" class="text-white">Cancelación del propietario</Heading>
      </template>
      <p class="pt-4 text-white">Vas a recibir un reembolso completo si el dueño cancela después de haber aceptado la reserva.</p>
    </Dropdown>

    <Dropdown class="flex flex-col py-5 rounded-3xl text-white">
      <template #title>
        <Heading type="5" class="text-white">Cancelación del arrendatario</Heading>
      </template>
      <p class="pt-4 text-white">Estos son los precios que deberás abonar en caso de que canceles la reserva dependiendo el tiempo de antelación.</p>
    </Dropdown>
    </div> -->

    <section class="text-white">
      <div class="my-8">
        <Heading type="3" class="text-white py-4">
          Tiempos de reserva
        </Heading>
  
        <div>
          <Heading type="5" class="text-white mb-2">
            Tiempos estipulados
          </Heading>
          <p>
            Al elegir fecha de retiro y de devolución, el usuario se compromete con el propietario para devolverlo en tiempo y forma.
          </p>
        </div>
  
        <div >
          <Heading type="5" class="text-white mb-2 mt-4">
            Exceso de tiempo
          </Heading>
          <p>
            Al exceder el tiempo elegido, se cobra una tarifa adicional de $10.000 por cada hora.
          </p>
        </div>
  
      </div>
  
      <div class="my-8">
        <Heading type="3" class="text-white py-4">
          Política de cancelación
        </Heading>
  
        <div>
          <Heading type="5" class="text-white mb-2">
            Cancelación del propietario
          </Heading>
          <p>
            Vas a recibir un reembolso completo si el dueño cancela después de haber aceptado la reserva.
          </p>
        </div>
  
        <div>
          <Heading type="5" class="text-white mb-2 mt-4">
            Cancelación del arrendatario
          </Heading>
          <p>
            Estos son los preciops que deberías abonar en caso de que canceles la reserva dependiendo el tiempo de antelación
          </p>
  
          <article class="grid gap-4 mt-4">
            <div class="flex justify-between items-center">
               <p>48 hs o más antes del alquiler</p>
               <p>Sin coste</p> 
            </div>
            <div class="flex justify-between items-center">
              <p>24-47 hs antes del alquiler</p>
              <div class="flex justify-between items-center gap-4">
              <span class="text-gray-300">25%</span>
              <p >${{ Number(calculatePercentage(25).toFixed(0)).toLocaleString('es-AR') }}</p>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <p>3-23 hs antes del alquiler</p>
              <div class="flex justify-between items-center gap-4">
              <span class="text-gray-300">40%</span>
              <p >${{ Number(calculatePercentage(40).toFixed(0)).toLocaleString('es-AR') }}</p>

              </div>
            </div>
            <div class="flex justify-between items-center">
              <p>3-0 hs antes del alquiler</p>
              <div class="flex justify-between items-center gap-4">
              <span class="text-gray-300">100%</span>
              <p >${{ Number(calculatePercentage(100).toFixed(0)).toLocaleString('es-AR') }}</p>

              </div>
            </div>
          </article>
        </div>
  
      </div>
    </section>

    <RentalFooter :total-amount="rentalData.currentTotalPrice" button-text="Siguiente" :is-confirmation="false"
      @continue="goToConfirmation" />
  </div>
</template>