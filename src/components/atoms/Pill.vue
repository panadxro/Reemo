<script>
// Importar los nuevos iconos (asegúrate de tener estos componentes creados)
import Bluetooth from "../../icons/Bluetooth.vue";
import GPS from "../../icons/GPS.vue";
import TouchScreen from "../../icons/TouchScreen.vue";
import AppleCarPlay from "../../icons/Bluetooth.vue";
import PremiumSound from "../../icons/Bluetooth.vue";
import VirtualAssistant from "../../icons/Bluetooth.vue";
import ParkingSensors from "../../icons/Bluetooth.vue";
import ABS from "../../icons/Bluetooth.vue";
import CruiseControl from "../../icons/Bluetooth.vue";
import AutomaticParking from "../../icons/Bluetooth.vue";
import RearViewCamera from "../../icons/Bluetooth.vue";
import ESC from "../../icons/Bluetooth.vue";
import TractionControl from "../../icons/Bluetooth.vue";
import Airbags from "../../icons/Bluetooth.vue";
import SeatbeltPretensioners from "../../icons/Bluetooth.vue";
import Isofix from "../../icons/Bluetooth.vue";
import SteeringWheelPaddles from "../../icons/Bluetooth.vue";
import DrivingModes from "../../icons/Bluetooth.vue";
import SportsSuspension from "../../icons/Bluetooth.vue";
import PowerSteering from "../../icons/Bluetooth.vue";
import SportsBrakes from "../../icons/Bluetooth.vue";
import SportsExhaust from "../../icons/Bluetooth.vue";
import StartStopSystem from "../../icons/Bluetooth.vue";
import LockingDifferential from "../../icons/Bluetooth.vue";
import CNGReady from "../../icons/Bluetooth.vue";
import ClimateControl from "../../icons/Bluetooth.vue";
import HeatedSeats from "../../icons/Bluetooth.vue";
import MemorySeat from "../../icons/Bluetooth.vue";
import PremiumUpholstery from "../../icons/Bluetooth.vue";
import ElectricSunroof from "../../icons/Bluetooth.vue";
import AutomaticWipers from "../../icons/Bluetooth.vue";
import AutomaticTrunk from "../../icons/Bluetooth.vue";
import SmartMirrors from "../../icons/Bluetooth.vue";
import Soundproofing from "../../icons/Bluetooth.vue";
import TrunkOrganizer from "../../icons/Bluetooth.vue";

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
    SteeringWheelPaddles,
    DrivingModes,
    SportsSuspension,
    PowerSteering,
    SportsBrakes,
    SportsExhaust,
    StartStopSystem,
    LockingDifferential,
    CNGReady,
    ClimateControl,
    HeatedSeats,
    MemorySeat,
    PremiumUpholstery,
    ElectricSunroof,
    AutomaticWipers,
    AutomaticTrunk,
    SmartMirrors,
    Soundproofing,
    TrunkOrganizer
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
          'seatbeltPretensioners', 'isofixLatch', 'steeringWheelPaddles',
          'drivingModes', 'sportsSuspension', 'powerSteering', 'sportsBrakes',
          'sportsExhaust', 'startStopSystem', 'lockingDifferential', 'cngReady',
          'automaticClimateControl', 'heatedVentilatedSeats', 'memorySeat',
          'premiumUpholstery', 'electricSunroof', 'automaticWipers',
          'automaticTrunk', 'smartMirrors', 'premiumSoundproofing', 'trunkOrganizer'
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
        case 'steeringWheelPaddles':
          return SteeringWheelPaddles;
        case 'drivingModes':
          return DrivingModes;
        case 'sportsSuspension':
          return SportsSuspension;
        case 'powerSteering':
          return PowerSteering;
        case 'sportsBrakes':
          return SportsBrakes;
        case 'sportsExhaust':
          return SportsExhaust;
        case 'startStopSystem':
          return StartStopSystem;
        case 'lockingDifferential':
          return LockingDifferential;
        case 'cngReady':
          return CNGReady;
        case 'automaticClimateControl':
          return ClimateControl;
        case 'heatedVentilatedSeats':
          return HeatedSeats;
        case 'memorySeat':
          return MemorySeat;
        case 'premiumUpholstery':
          return PremiumUpholstery;
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
        case 'trunkOrganizer':
          return TrunkOrganizer;
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
      'steeringWheelPaddles': 'Paletas de cambio al volante' ,
      'drivingModes': 'Modos de conducción (Eco, Sport, Off-road)' ,
      'sportsSuspension': 'Suspensión deportiva' ,
      'powerSteering': 'Dirección asistida' ,
      'sportsBrakes': 'Frenos deportivos' ,
      'sportsExhaust': 'Escape deportivo' ,
      'startStopSystem': 'Sistema start-stop' ,
      'lockingDifferential': 'Diferencial autoblocante' ,
      'cngReady': 'Preparación GNC' ,
      'automaticClimateControl': 'Climatizador automático' ,
      'heatedVentilatedSeats': 'Asientos calefaccionados/ventilados' ,
      'memorySeat': 'Asiento con memoria' ,
      'premiumUpholstery': 'Tapizado premium' ,
      'electricSunroof': 'Techo solar eléctrico' ,
      'automaticWipers': 'Limpiaparabrisas automáticos' ,
      'automaticTrunk': 'Maletero automático' ,
      'smartMirrors': 'Espejos inteligentes' ,
      'premiumSoundproofing': 'Insonorización premium' ,
      'trunkOrganizer': 'Organizador de maletero' ,
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