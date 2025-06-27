<script>
import Heading from "../components/atoms/Heading.vue";
import Pill from '../components/atoms/Pill.vue';
import ZurichxReemo from "../components/atoms/ZurichxReemo.vue";
import ABS from "../icons/ABS.vue";
import LongArrow from "../icons/LongArrow.vue";
import PublishYourCar from "../components/atoms/PublishYourCar.vue";
import RentYourCar from "../components/atoms/RentYourCar.vue"
import NotificationExpress from "../components/atoms/NotificationExpress.vue";
import RentsExpress from "../components/atoms/RentsExpress.vue";
import Income from "../components/atoms/Income.vue";
import Moments from "../components/atoms/Moments.vue";
import ConectingCars from "../components/atoms/ConectingCars.vue";
import GooglePlayLg from "../components/atoms/GooglePlayLg.vue";
import AppStoreLg from "../components/atoms/AppStoreLg.vue";
import Brands from "../components/atoms/Brands.vue";
import Replay from "../components/atoms/Replay.vue";
import Clue from "../components/atoms/Clue.vue";
import Dropdown from "../components/molecules/Dropdown.vue";
import Experience from "../components/atoms/Experience.vue";
import QR from "../components/atoms/QR.vue";
import InfoSm from "../icons/InfoSm.vue";

export default {
  name: "Home",
  components: { Heading, Pill, GooglePlayLg, AppStoreLg, ZurichxReemo, ABS, LongArrow, PublishYourCar, RentYourCar, NotificationExpress, RentsExpress, Income, Moments, ConectingCars, Brands, Replay, Clue, Dropdown, Experience, QR, InfoSm },
};
</script>

<template>
  <div class="w-11/12 sm:w-10/12 m-auto bg-white rounded-3xl flex flex-col gap-32">
    <section class="flex flex-col items-center justify-between xl:flex-row xl:justify-center gap-16 mx-4">
      <div class="flex flex-col gap-4">
        <h1 class="font-medium leading-tight text-5xl block mb-4 sm:text-6xl w-[95%] sm:w-full text-pretty text-center xl:text-start pt-4 xl:pt-0"><b>Conectando autos,</b><br/> impulsando<br/> oportunidades</h1>
        <div class="sm:flex gap-2 hidden justify-center xl:justify-start">
          <div class="group">
            <a href="#">
              <GooglePlayLg />
            </a>
          </div>
          <div class="group">
            <a href="#">
              <AppStoreLg/>
            </a>
          </div>
        </div>
      </div>
      <ConectingCars/>
    </section>

    <section class="flex flex-col items-center gap-8 sm:gap-12 sm:w-10/12 m-auto mx-4">
      <ZurichxReemo/>
      <article class="flex flex-col items-center gap-3">
        <Heading :type="2" class="text-center">Seguros contra todo riesgo Zurich</Heading>
        <p class="text-center max-w-[570px]">Ofrecemos seguros contra todo riesgo con Zurich, para que puedas disfrutar de tu viaje con total tranquilidad.</p>
        <a href="" class="flex items-center gap-4 py-2 px-4 rounded-xl bg-secondary-100 w-fit">
          <ABS/>
          <span class="font-semibold">Atención 24hs - 11 1122 3344</span>
        </a>
      </article>
      <div class="sm:flex flex-wrap justify-center gap-4">
        <div class="sm:w-[310px] shadow-custom px-6 py-12 flex flex-col gap-16 rounded-[36px]">
          <article class="flex flex-col gap-2 text-pretty">
            <Heading :type="3">¿Cómo funciona Reemo?</Heading>
            <p class="text-lg font-regular leading-tight">Aquellos dueños dispuestos a prestar su auto a cambio de dinero, lo registran y las personas que necesitan uno temporalmente, lo alquilan.</p>
            <a href="" class="flex items-center gap-4 py-2 px-4 rounded-xl bg-secondary-100 w-fit">
              Más información
            </a>
          </article>
          <figure class="rounded-2xl overflow-hidden">
            <img class="w-full" src="/src/assets/home/shake-hand.png" alt="">
          </figure>
        </div>

        <div class="sm:w-[310px] shadow-custom px-6 py-12 flex flex-col gap-16 rounded-[36px]">
          <article class="flex flex-col gap-2">
            <Heading :type="3">Proceso 100% digital</Heading>
            <p class="text-lg font-regular leading-tight">En Reemo, todo el proceso es completamente digital y sin complicaciones. Reservá, pagá y obtené tu auto de forma rápida y sencilla.</p>
            <a href="" class="flex items-center gap-4 py-2 px-4 rounded-xl bg-secondary-100 w-fit">
              Más información
            </a>
          </article>
          <figure class="rounded-2xl overflow-hidden">
            <img class="w-full" src="/src/assets/home/women-phone.png" alt="">
          </figure>
        </div>

        <div class="sm:w-[310px] shadow-custom px-6 py-12 flex flex-col gap-16 rounded-[36px]">
          <article class="flex flex-col gap-2">
            <Heading :type="3">Impacto en Argentina</Heading>
            <p class="text-lg font-regular leading-tight">Al alquilar un auto en Reemo, aparte de cuidar tu economía, evitando el cargo de mantener uno propio, ayudas a los dueños que lo publican.</p>
            <a href="" class="flex items-center gap-4 py-2 px-4 rounded-xl bg-secondary-100 w-fit">
              Más información
            </a>
          </article>
          <figure class="rounded-2xl overflow-hidden">
            <img class="w-full" src="/src/assets/home/women-car.png" alt="">
          </figure>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-16 mx-4">
    <Heading :type="2" class="text-center">Con Reemo,<br>tranquilo a todos lados</Heading>
    <div class="flex flex-col items-center justify-center [@media(min-width:1100px)]:flex-row gap-4">
      <article class="bg-primary-900 pl-9 py-11 flex flex-col gap-16 rounded-[40px] w-full group relative">
        <div class="flex flex-col gap-4 w-96">
          <Heading :type="3" class="text-white">Publicá tu vehículo</Heading>
          <p class="text-lg font-regular leading-tight text-slate-400">Registrá tu auto en menos de 10 minutos y dejalo listo para ser alquilado.</p>
        </div>
        <div class="flex flex-row-reverse">
          <PublishYourCar />
        </div>
        <a href="" class="flex items-center justify-between py-2 px-5 rounded-xl bg-primary-800 text-white w-36">
          <span>Publicar</span>
          <LongArrow color="#FFFFFF" direction="right"/>
        </a>
      </article>
      <article class="bg-linear-to-r to-secondary-300 from-secondary-100 pl-9 py-11 flex flex-col gap-16 rounded-[40px] w-full group relative">
        <div class="flex flex-col gap-4 w-96">
          <Heading :type="3">Alquilá un auto</Heading>
          <p class="text-lg font-regular leading-tight text-slate-600">Conseguí un vehículo que se adapte a vos y comenzá a disfrutarlo.</p>
        </div>
        <div class="flex flex-row-reverse">
          <RentYourCar />
        </div>
        <a href="" class="flex items-center justify-between py-2 px-5 rounded-xl bg-secondary-300 text-white w-36">
          <span>Ver autos</span>
          <LongArrow color="#FFFFFF" direction="right"/>
        </a>
      </article>
    </div>
  </section>

  <section class="flex flex-col gap-16 mx-4">
    <div class="flex flex-col items-center gap-4">
      <Heading :type="2" class="text-center ">🚙<br/>Alquileres express</Heading>
      <p class="inline">Rápidos, seguros y confiables</p>
      <NotificationExpress/>
    </div>

    <div class="flex flex-col gap-5">
      <article class="pl-9 py-11 w-full rounded-[20px] md:rounded-[40px] shadow-custom flex flex-col lg:flex-row">
        <div class="flex flex-col justify-between flex-1 gap-8">
            <div>
                <Heading :type="3">Contactáte inmediatamente<br class="hidden md:block"/> con el dueño</Heading>
                <p class="w-full md:w-3/4 text-slate-600 pt-2">
                    Con Reemo podés hablar por medio de chat con el dueño del auto luego de haber reservado el mismo para ultimar detalles del alquiler
                </p>
            </div>
    
            <a href="" class="flex items-center justify-between py-2 px-5 rounded-xl bg-secondary-900 text-white w-36 mt-6 md:mt-0">
                <span>Ver autos</span>
                <LongArrow color="#FFFFFF" direction="right"/>
            </a>
        </div>
        
        <div class="flex justify-center lg:justify-end mt-8 md:mt-0 md:mr-16">
            <RentsExpress class="w-full max-w-[300px] md:max-w-md md:w-auto" />
        </div>
    </article>
      <div class="flex flex-col flex-1 items-center justify-center xl:flex-row gap-4">
        <article class="bg-secondary-100 pl-9 py-11 flex flex-col rounded-[40px] w-full group relative">
          <Heading :type="3">Viví momentos <br/>inolvidables</Heading>
          <div class="flex flex-row-reverse">
            <Moments />
          </div>
        </article>
        <article class="bg-primary-900 pl-9 py-11 flex flex-col rounded-[40px] w-full group relative">
          <Heading :type="3" class="text-white">Generá ingresos <br/>extras sin esfuerzo</Heading>
          <div class="flex flex-row-reverse">
            <Income />
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="flex flex-col gap-16 mx-4">
    <div class="flex flex-col items-center gap-4">
      <Heading :type="2" class="text-center ">🚙<br/>Gran variedad</Heading>
      <p class="inline">Conseguí un auto que se adapte a tus necesidades</p>
    </div>

    <div class="flex flex-col gap-5 w-full">
      <div class="flex flex-col flex-1 items-center justify-center [@media(min-width:1200px)]:flex-row gap-4 w-full">
        <div class="flex flex-col flex-1 gap-4 w-full">
          <article class="bg-primary-900 px-9 py-11 flex flex-row justify-between items-center rounded-[40px] w-full">
            <div class="flex flex-col gap-16">
              <Heading :type="3" class="text-white">Viví momentos <br/>inolvidables</Heading>
              <button class="bg-secondary-900 w-fit px-6 rounded-full">
                <LongArrow color="#FFFFFF" direction="right"/>
                <span class="sr-only">Ver más</span>
              </button>
            </div>
            <Replay/>
          </article>
          <article class="bg-primary-900 px-9 py-11 flex flex-row justify-between items-center rounded-[40px] w-full">
            <div class="flex flex-col gap-16">
              <Heading :type="3" class="text-white">Buscá y encontrá <br/>tu auto ideal</Heading>
              <button class="bg-secondary-900 w-fit px-6 rounded-full">
                <LongArrow color="#FFFFFF" direction="right"/>
                <span class="sr-only">Ver más</span>
              </button>
            </div>
            <Clue/>
          </article>
        </div>

        <article class="bg-secondary-100 pl-9 py-11 flex flex-col flex-1 rounded-[40px] w-full group relative overflow-hidden ">
          <Heading :type="3" class="z-100">Todas las marcas <br/>y todos los modelos</Heading>
          <div class="flex flex-row-reverse">
            <Brands class="-m-20"/>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="flex flex-col gap-5 items-center mx-4">
    <Heading :type="2" class="text-center">Preguntas frecuentes</Heading>
    <div class="flex flex-col gap-4 w-10/12 m-auto">
      <Dropdown class="flex flex-col bg-secondary-100 px-8 py-5 rounded-3xl">
        <template #title>
          <Heading type="5">¿Qué necesito para abrir una cuenta en Reemo?</Heading>
        </template>
        <p class="pt-4">Para registrarte en Reemo, solo necesitás un correo electrónico válido, una contraseña segura y algunos datos personales básicos para configurar tu perfil. Una vez que completes estos pasos, podrás empezar a alquilar o rentar autos en nuestra plataforma.</p>
      </Dropdown>
      <Dropdown class="flex flex-col bg-secondary-100 px-8 py-5 rounded-3xl">
        <template #title>
          <Heading type="5">¿Cuáles son los beneficios de usar Reemo?</Heading>
        </template>
        <p class="pt-4">Con Reemo, disfrutás de una serie de ventajas tanto si sos propietario como si necesitás un auto temporalmente:</p>
        <ul class="pt-2 list-disc list-inside">
          <li><b>Propietarios:</b> Generá ingresos adicionales con tu auto, sin esfuerzo y con total seguridad gracias a nuestros seguros contra todo riesgo.</li>
          <li><b>Usuarios:</b> Alquilá un auto cuando lo necesites, sin tener que asumir los costos de mantenimiento de uno propio.</li>
          <li><b>Proceso digital:</b> Desde la búsqueda hasta la reserva y el pago, todo se realiza de forma 100% online.</li>
          <li><b>Atención 24/7:</b> Contás con un equipo de soporte disponible las 24 horas para cualquier consulta.</li>
        </ul>
      </Dropdown>
      <Dropdown class="flex flex-col bg-secondary-100 px-8 py-5 rounded-3xl">
        <template #title>
          <Heading type="5">¿Cómo puedo poner mi auto en alquiler en Reemo?</Heading>
        </template>
        <p class="pt-4">Publicar tu vehículo en Reemo es muy sencillo:</p>
        <ul class="pt-2 list-disc list-inside">
          <li>Registrate y completá el perfil de tu auto (datos básicos, fotos y documentación).</li>
          <li>Establecé la tarifa por día y la ubicación donde se podrá recoger.</li>
          <li>Una vez que esté aprobado, tu auto estará disponible para ser alquilado por otros usuarios.</li>
        </ul>
      </Dropdown>
      <Dropdown class="flex flex-col bg-secondary-100 px-8 py-5 rounded-3xl">
        <template #title>
          <Heading type="5">¿Cómo funciona el seguro de los autos en Reemo?</Heading>
        </template>
        <p class="pt-4">Todos los vehículos registrados en nuestra plataforma están protegidos por un seguro contra todo riesgo con Zurich, lo que significa que tanto el propietario como el arrendatario están cubiertos en caso de accidentes, daños o robos durante el período de alquiler.</p>
      </Dropdown>
    </div>
    <a href="" class="flex items-center gap-4 py-2 px-4 rounded-2xl bg-secondary-900 w-fit">
      <span class="font-semibold text-white">Ir a todas las preguntas</span>
      <LongArrow color="#FFFFFF" direction="right"/>
    </a>
  </section>
  <section>
    <article class="bg-linear-to-r to-primary-900 from-secondary-900 px-9 py-11 w-full rounded-[40px] shadow-custom flex flex-col items-center text-white overflow-hidden gap-4">
      <Experience class="-mt-20"/>
      <Heading :type="3" class="text-white">¿Qué esperás para vivir la experiencia Reemo?</Heading>
      <p>Descargá la app y empezá a alquilar o rentar autos en minutos.</p>
      <QR/>
    </article>
    <p class="flex text-sm text-slate-500 items-center gap-1 p-1 justify-center">
      <InfoSm/>
      <span>Disponible en App Store y Play Store</span>
    </p>
  </section>
  </div>
</template>

<style scoped>
section {
  margin: auto;
  @media screen and (min-width: 2220px) {
    width: 50%;
  }
  @media screen and (min-width: 1480px) and (max-width: 2219px) {
    width: 75%;
  }
  @media screen and (max-width: 1479px) {
    width: 100%;
  }
}
</style>