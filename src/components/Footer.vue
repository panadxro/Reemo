<script>
import PlayStore from '../icons/PlayStore.vue';
import AppStore from '../icons/AppStore.vue';
import ReemoSm from '../icons/ReemoSm-.vue';
import Facebook from '../icons/Facebook.vue';
import Instagram from '../icons/Instagram.vue';
import Twitter from '../icons/Twitter.vue';
import LinkedIn from '../icons/LinkedIn.vue';
import Heading from '@/components/atoms/Heading.vue'
import NavDropdown from './molecules/NavDropdown.vue';

export default {
  name: "FooterLayout",
  components: { NavDropdown, PlayStore, AppStore, ReemoSm,Facebook, Instagram, Twitter, LinkedIn, Heading },
};
</script>

<template>
  <footer class="p-4 sm:p-6 flex flex-col gap-4 max-w-[1800px] mx-auto bg-white">
    <div class="rounded-3xl sm:rounded-[52px] bg-secondary-100 pt-10 pb-8 md:py-20 px-4 md:px-8">
      <div class="flex flex-col lg:flex-row md:justify-between gap-6 m-auto w-full lg:w-11/12 xl:w-10/12">
        <div class="flex flex-col gap-6 justify-end">
          <div class="flex flex-col gap-6">
            <ReemoSm class="w-32 sm:w-auto lg:w-32"/>
            <ul class="flex gap-4 sm:justify-center items-center">
              <li><a href="#"><Facebook class="w-8 h-8"/></a></li>
              <li><a href="#"><Instagram class="w-8 h-8"/></a></li>
              <li><a href="#"><Twitter class="w-8 h-8"/></a></li>
              <li><a href="#"><LinkedIn class="w-8 h-8"/></a></li>
            </ul>
          </div>
          <div class="flex flex-col gap-4 sm:gap-7">
            <a class="text-secondary-900 font-bold text-base sm:text-lg" href="#">Sobre <strong>Reemo</strong></a>
            <a class="text-secondary-900 font-bold text-base sm:text-lg" href="#">Beneficios</a>
            <NavDropdown class="h-full">
              <template #title>
                <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Facilidades</Heading>
              </template>
              <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
                <li><a href="#" class="inline py-1 sm:py-0">Registro de vehículos</a></li>
                <li><a href="#" class="inline py-1 sm:py-0">Documentación y verificación</a></li>
                <li><a href="#" class="inline py-1 sm:py-0">Ubicación flexible</a></li>
                <li><a href="#" class="inline py-1 sm:py-0">Chat con propietarios</a></li>
                <li><a href="#" class="inline py-1 sm:py-0">Soporte a propietarios</a></li>
              </ul>
            </NavDropdown>
          </div>
        </div>

        <div class="flex flex-col gap-6">
          <NavDropdown class="h-full">
            <template #title>
              <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Pagos</Heading>
            </template>
            <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
              <li><a href="#" class="inline py-1 sm:py-0">Métodos de pago seguros</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Pago con tarjeta</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Integraciones</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Transferencias bancarias</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Gestión de pagos automáticos</a></li>
            </ul>
          </NavDropdown>

          <NavDropdown class="h-full">
            <template #title>
              <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Seguridad</Heading>
            </template>
            <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
              <li><a href="#" class="inline py-1 sm:py-0">Verificaciones</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Seguro contra todo riesgo</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Encriptación de datos</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Pausar y cancelar reservas</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Atención de emergencias 24/7</a></li>
            </ul>
          </NavDropdown>
        </div>


        <div class="flex flex-col gap-6">
          <NavDropdown class="h-full">
            <template #title>
              <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Propietarios</Heading>
            </template>
            <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
              <li><a href="#" class="inline py-1 sm:py-0">Publicá tu vehículo</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Generá ingresos extras</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Gestión de reservas</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Soporte para propietarios</a></li>
            </ul>
          </NavDropdown>

          <NavDropdown class="h-full">
            <template #title>
              <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Usuarios</Heading>
            </template>
            <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
              <li><a href="#" class="inline py-1 sm:py-0">Alquileres express</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Amplia selección de vehículos</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Chat directo con propietarios</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Alquiler flexible por día o semana</a></li>
            </ul>
          </NavDropdown>
        </div>

        <div class="flex flex-col gap-6">
          <NavDropdown class="h-full">
            <template #title>
              <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Información importante</Heading>
            </template>
            <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
              <li><a href="#" class="inline py-1 sm:py-0">Términos y condiciones de uso</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Política de privacidad</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Régimen de transparencia</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Tarifas y comisiones vigentes</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Ley de Defensa del Consumidor (Ley 24.240)</a></li>
            </ul>
          </NavDropdown>

          <NavDropdown class="h-full">
            <template #title>
              <Heading type="4" class="pb-2 text-lg mb-0.5 sm:text-md">Contacto</Heading>
            </template>
            <ul class="flex flex-col gap-2 sm:gap-2.5 text-sm mt-3 sm:mt-0">
              <li><a href="#" class="inline py-1 sm:py-0">Soporte y ayuda</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Atención al cliente</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Consultas comerciales</a></li>
              <li><a href="#" class="inline py-1 sm:py-0">Reclamos y sugerencias</a></li>
            </ul>
          </NavDropdown>
        </div>
      </div>
    </div>

    <div class="rounded-3xl sm:rounded-[52px] bg-secondary-100 py-4 sm:py-6 lg:py-8">
      <div class="flex flex-col-reverse lg:flex-row justify-between items-center gap-6 m-auto w-full lg:w-11/12 xl:w-10/12 p-4 sm:p-6">
        <article class="flex flex-col gap-2 w-full lg:w-2/3">
          <Heading :type="5" class="text-sm sm:text-base">&copy; <strong>Reemo</strong>, 2024. Todos los derechos reservados</Heading>
          <p class="text-xs sm:text-sm text-gray-500">
            <strong>Reemo</strong> S.A. Agente de Servicios de Movilidad - Registro Propio. Secretaría de Transporte de la Nación: Nro. de matrícula 2098. Inscripto ante la Secretaría de Innovación y Tecnología de la Nación como Proveedor de Plataformas Digitales para Alquiler de Vehículos, bajo el número 342, y como Agente Autorizado de Gestión de Alquileres Temporales y Transporte Compartido, bajo el número 278.
          </p>
        </article>
        
        <div class="flex gap-3 sm:gap-4 items-center w-full lg:w-auto justify-start lg:justify-end">
          <a href="#" class="h-fit">
            <PlayStore class="w-28 sm:w-36 h-auto"/>
          </a>
          <a href="#" class="h-fit">
            <AppStore class="w-28 sm:w-36 h-auto"/>
          </a>
        </div>  
      </div>
    </div>
  </footer>
</template>
