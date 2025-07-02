<script>
// Importar los nuevos iconos (asegúrate de tener estos componentes creados)
import Bluetooth from "../../icons/Bluetooth.vue";
import GPS from "../../icons/GPS.vue";
import TouchScreen from "../../icons/TouchScreen.vue";
import AppleCarPlay from "../../icons/AppleCarPlay.vue";
import PremiumSound from "../../icons/SoundSystem.vue";
import VirtualAssistant from "../../icons/VirtualAssistant.vue";
import ParkingSensors from "../../icons/ParkSense.vue";
import ABS from "../../icons/ABS.vue";
import CruiseControl from "../../icons/CruiseCtrl.vue";
import AutomaticParking from "../../icons/AutomaticParking.vue";
import RearViewCamera from "../../icons/RevCam.vue";
import ESC from "../../icons/StabilityCtrl.vue";
import TractionControl from "../../icons/TractionCtrl.vue";
import Airbags from "../../icons/Airbag.vue";
import SeatbeltPretensioners from "../../icons/SeatbeltPretensioners.vue";
import Isofix from "../../icons/SeatbeltPretensioners.vue";
import DrivingModes from "../../icons/DrivingModes.vue";
import SportsSuspension from "../../icons/SportSuspension.vue";
import PowerSteering from "../../icons/PowerSteering.vue";
import SportsExhaust from "../../icons/SportExhaust.vue";
import StartStopSystem from "../../icons/StartStopSystem.vue";
import LockingDifferential from "../../icons/StabilityCtrl.vue";
import GNC from "../../icons/GNC.vue";
import ClimateControl from "../../icons/AC.vue";
import HeatedSeats from "../../icons/HeatSeat.vue";
import MemorySeat from "../../icons/MemorySeat.vue";
import ElectricSunroof from "../../icons/SunRoof.vue";
import AutomaticWipers from "../../icons/AutomaticWipers.vue";
import AutomaticTrunk from "../../icons/AutomaticTrunk.vue";
import SmartMirrors from "../../icons/SmartMirrors.vue";
import Soundproofing from "../../icons/SoundSystem.vue";

export default {
  name: 'Pill',
  components: { 
    Bluetooth,
    GPS,
    TouchScreen,
    AppleCarPlay,
    PremiumSound,
    VirtualAssistant,
    ParkingSensors,
    ABS,
    CruiseControl,
    AutomaticParking,
    RearViewCamera,
    ESC,
    TractionControl,
    Airbags,
    SeatbeltPretensioners,
    Isofix,
    DrivingModes,
    SportsSuspension,
    PowerSteering,
    SportsExhaust,
    StartStopSystem,
    LockingDifferential,
    GNC,
    ClimateControl,
    HeatedSeats,
    MemorySeat,
    ElectricSunroof,
    AutomaticWipers,
    AutomaticTrunk,
    SmartMirrors,
    Soundproofing,
  },
  props: {
    accessory: {
      type: String,
      required: true,
      validator: (value) => {
        return [
          'touchScreen', 'appleCarPlayAndroidAuto', 'bluetooth', 'gps', 
          'premiumSound', 'integratedVirtualAssistant', '360parkingSensors',
          'absBrakes', 'cruiseControl', 'automaticParkingAssistant', 
          'rearViewCamera', 'esc', 'tractionControl', 'airbags',
          'seatbeltPretensioners', 'isofixLatch', 
          'drivingModes', 'sportsSuspension', 'powerSteering',
          'sportsExhaust', 'startStopSystem', 'lockingDifferential', 'cngReady',
          'automaticClimateControl', 'heatedVentilatedSeats', 'memorySeat',
          'electricSunroof', 'automaticWipers',
          'automaticTrunk', 'smartMirrors', 'premiumSoundproofing'
        ].includes(value);
      },
    },
    name: {
      type: String,
      required: true,
    }
  },
  computed: {
    IconComponent() {
      switch (this.accessory) {
        case 'bluetooth':
          return Bluetooth;
        case 'gps':
          return GPS;
        case 'touchScreen':
          return TouchScreen;
        case 'appleCarPlayAndroidAuto':
          return AppleCarPlay;
        case 'premiumSound':
          return PremiumSound;
        case 'integratedVirtualAssistant':
          return VirtualAssistant;
        case '360parkingSensors':
          return ParkingSensors;
        case 'absBrakes':
          return ABS;
        case 'cruiseControl':
          return CruiseControl;
        case 'automaticParkingAssistant':
          return AutomaticParking;
        case 'rearViewCamera':
          return RearViewCamera;
        case 'esc':
          return ESC;
        case 'tractionControl':
          return TractionControl;
        case 'airbags':
          return Airbags;
        case 'seatbeltPretensioners':
          return SeatbeltPretensioners;
        case 'isofixLatch':
          return Isofix;
        case 'drivingModes':
          return DrivingModes;
        case 'sportsSuspension':
          return SportsSuspension;
        case 'powerSteering':
          return PowerSteering;
        case 'sportsExhaust':
          return SportsExhaust;
        case 'startStopSystem':
          return StartStopSystem;
        case 'lockingDifferential':
          return LockingDifferential;
        case 'cngReady':
          return GNC;
        case 'automaticClimateControl':
          return ClimateControl;
        case 'heatedVentilatedSeats':
          return HeatedSeats;
        case 'memorySeat':
          return MemorySeat;
        case 'electricSunroof':
          return ElectricSunroof;
        case 'automaticWipers':
          return AutomaticWipers;
        case 'automaticTrunk':
          return AutomaticTrunk;
        case 'smartMirrors':
          return SmartMirrors;
        case 'premiumSoundproofing':
          return Soundproofing;
        default:
          return null;
      }
    },
    displayName() {
    const names = {
      'touchScreen': 'Pantalla táctil' ,
      'appleCarPlayAndroidAuto': 'Apple CarPlay/Android Auto' ,
      'bluetooth': 'Bluetooth' ,
      'gps': 'GPS' ,
      'premiumSound': 'Sonido premium' ,
      'integratedVirtualAssistant': 'Asistente virtual integrado' ,
      '360parkingSensors': 'Sensores de estacionamiento 360°' ,
      'absBrakes': 'Frenos ABS' ,
      'cruiseControl': 'Control de crucero' ,
      'automaticParkingAssistant': 'Asistente de estacionamiento automático' ,
      'rearViewCamera': 'Cámara de marcha atrás' ,
      'esc': 'Control de estabilidad (ESC)' ,
      'tractionControl': 'Control de tracción' ,
      'airbags': 'Airbags' ,
      'seatbeltPretensioners': 'Cinturones de seguridad con pretensores' ,
      'isofixLatch': 'Anclajes ISOFIX/LATCH' ,
      'drivingModes': 'Modos de conducción (Eco, Sport, Off-road)' ,
      'sportsSuspension': 'Suspensión deportiva' ,
      'powerSteering': 'Dirección asistida' ,
      'sportsExhaust': 'Escape deportivo' ,
      'startStopSystem': 'Sistema start-stop' ,
      'lockingDifferential': 'Diferencial autoblocante' ,
      'cngReady': 'Preparación GNC' ,
      'automaticClimateControl': 'Climatizador automático' ,
      'heatedVentilatedSeats': 'Asientos calefaccionados/ventilados' ,
      'memorySeat': 'Asiento con memoria' ,
      'electricSunroof': 'Techo solar eléctrico' ,
      'automaticWipers': 'Limpiaparabrisas automáticos' ,
      'automaticTrunk': 'Maletero automático' ,
      'smartMirrors': 'Espejos inteligentes' ,
      'premiumSoundproofing': 'Insonorización premium' ,
    };
    return names[this.accessory] || this.name;
  }
  },
};
</script>

<template>
  <div :class="`chip chip-${accessory}`" class="flex items-center gap-2 bg-vibrant-light-700 text-deep-blue-900 font-semibold rounded-2xl py-2 px-4">
    <span class="icon" v-if="IconComponent">
      <component :is="IconComponent" />
    </span>
    <span class="label text-sm">{{ displayName }}</span>
  </div>
</template>