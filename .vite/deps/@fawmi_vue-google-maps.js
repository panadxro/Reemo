import {
  createApp
} from "./chunk-IJV5NOMV.js";

// node_modules/@fawmi/vue-google-maps/src/utils/lazyValue.js
var lazyValue_default = (fn) => {
  let called = false;
  let result;
  return () => {
    if (!called) {
      called = true;
      result = fn();
    }
    return result;
  };
};

// node_modules/@fawmi/vue-google-maps/src/utils/env.js
var Env = class {
  static isServer() {
    return typeof document === "undefined";
  }
};

// node_modules/@fawmi/vue-google-maps/src/utils/create-map-script.js
function createMapScript(options) {
  const googleMapScript = document.createElement("SCRIPT");
  if (typeof options !== "object") {
    throw new Error("options should  be an object");
  }
  if (Array.prototype.isPrototypeOf(options.libraries)) {
    options.libraries = options.libraries.join(",");
  }
  if (!options.v) {
    options.v = 3.47;
  }
  options["callback"] = "vueGoogleMapsInit";
  let baseUrl = "https://maps.googleapis.com/maps/api/js?";
  let url = baseUrl + Object.keys(options).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(options[key])).join("&");
  googleMapScript.setAttribute("src", url);
  googleMapScript.setAttribute("async", "");
  googleMapScript.setAttribute("defer", "");
  return googleMapScript;
}

// node_modules/@fawmi/vue-google-maps/src/load-google-maps.js
var isApiSetUp = false;
function loadGMapApi(options) {
  if (Env.isServer()) {
    return;
  }
  if (!isApiSetUp) {
    isApiSetUp = true;
    const googleMapScript = createMapScript(options);
    document.head.appendChild(googleMapScript);
  } else {
    throw new Error("You already started the loading of google maps");
  }
}

// node_modules/@fawmi/vue-google-maps/src/utils/bindEvents.js
var bindEvents_default = (vueInst, googleMapsInst, events6) => {
  for (let eventName of events6) {
    const propName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`.replace(/[-_]+(.)?/g, (_, c) => c ? c.toUpperCase() : "");
    if (vueInst.$props[propName] || vueInst.$attrs[propName]) {
      googleMapsInst.addListener(eventName, (ev) => {
        vueInst.$emit(eventName, ev);
      });
    } else if (vueInst.$gmapOptions.autobindAllEvents || vueInst.$attrs[eventName]) {
      googleMapsInst.addListener(eventName, (ev) => {
        vueInst.$emit(eventName, ev);
      });
    }
  }
};

// node_modules/@fawmi/vue-google-maps/src/utils/WatchPrimitiveProperties.js
function WatchPrimitiveProperties(vueInst, propertiesToTrack, handler, immediate = false) {
  let isHandled = false;
  function requestHandle() {
    if (!isHandled) {
      isHandled = true;
      vueInst.$nextTick(() => {
        isHandled = false;
        handler();
      });
    }
  }
  for (let prop of propertiesToTrack) {
    vueInst.$watch(prop, requestHandle, { immediate });
  }
}

// node_modules/@fawmi/vue-google-maps/src/utils/string.js
var Str = class {
  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

// node_modules/@fawmi/vue-google-maps/src/utils/bindProps.js
function getPropsValues(vueInst, props6) {
  return Object.keys(props6).reduce((acc, prop) => {
    if (vueInst[prop] !== void 0) {
      acc[prop] = vueInst[prop];
    }
    return acc;
  }, {});
}
function bindProps(vueInst, googleMapsInst, props6) {
  for (let attribute in props6) {
    let { twoWay, type, trackProperties, noBind } = props6[attribute];
    if (noBind) continue;
    const setMethodName = "set" + Str.capitalizeFirstLetter(attribute);
    const getMethodName = "get" + Str.capitalizeFirstLetter(attribute);
    const eventName = attribute.toLowerCase() + "_changed";
    const initialValue = vueInst[attribute];
    if (typeof googleMapsInst[setMethodName] === "undefined") {
      throw new Error(
        `${setMethodName} is not a method of (the Maps object corresponding to) ${vueInst.$options._componentTag}`
      );
    }
    if (type !== Object || !trackProperties) {
      vueInst.$watch(
        attribute,
        () => {
          const attributeValue = vueInst[attribute];
          googleMapsInst[setMethodName](attributeValue);
        },
        {
          immediate: typeof initialValue !== "undefined",
          deep: type === Object
        }
      );
    } else {
      WatchPrimitiveProperties(
        vueInst,
        trackProperties.map((prop) => `${attribute}.${prop}`),
        () => {
          googleMapsInst[setMethodName](vueInst[attribute]);
        },
        vueInst[attribute] !== void 0
      );
    }
    if (twoWay && (vueInst.$gmapOptions.autobindAllEvents || vueInst.$attrs[eventName])) {
      googleMapsInst.addListener(eventName, () => {
        vueInst.$emit(eventName, googleMapsInst[getMethodName]());
      });
    }
  }
}

// node_modules/@fawmi/vue-google-maps/src/components/mapElementMixin.js
var mapElementMixin_default = {
  inject: {
    $mapPromise: { default: "abcdef" }
  },
  provide() {
    this.$mapPromise.then((map) => {
      this.$map = map;
    });
    return {};
  }
};

// node_modules/@fawmi/vue-google-maps/src/components/build-component.js
function build_component_default(options) {
  const {
    mappedProps,
    name,
    ctr,
    ctrArgs,
    events: events6,
    beforeCreate,
    afterCreate,
    props: props6,
    ...rest
  } = options;
  const promiseName = `$${name}Promise`;
  const instanceName = `$${name}Object`;
  assert(!(rest.props instanceof Array), "`props` should be an object, not Array");
  return {
    ...typeof GENERATE_DOC !== "undefined" ? { $vgmOptions: options } : {},
    mixins: [mapElementMixin_default],
    props: {
      ...props6,
      ...mappedPropsToVueProps(mappedProps)
    },
    render() {
      return "";
    },
    provide() {
      const promise = this.$mapPromise.then((map) => {
        this.$map = map;
        const options2 = {
          ...this.options,
          map,
          ...getPropsValues(this, mappedProps)
        };
        delete options2.options;
        if (beforeCreate) {
          const result = beforeCreate.bind(this)(options2);
          if (result instanceof Promise) {
            return result.then(() => ({ options: options2 }));
          }
        }
        return { options: options2 };
      }).then(({ options: options2 }) => {
        const ConstructorObject = ctr();
        this[instanceName] = ctrArgs ? new (Function.prototype.bind.call(
          ConstructorObject,
          null,
          ...ctrArgs(options2, getPropsValues(this, props6 || {}))
        ))() : new ConstructorObject(options2);
        bindProps(this, this[instanceName], mappedProps);
        bindEvents_default(this, this[instanceName], events6);
        if (afterCreate) {
          afterCreate.bind(this)(this[instanceName]);
        }
        return this[instanceName];
      });
      this[promiseName] = promise;
      return { [promiseName]: promise };
    },
    unmounted() {
      if (this[instanceName] && this[instanceName].setMap) {
        this[instanceName].setMap(null);
      }
    },
    ...rest
  };
}
function assert(v, message) {
  if (!v) throw new Error(message);
}
function mappedPropsToVueProps(mappedProps) {
  return Object.entries(mappedProps).map(([key, prop]) => {
    const value = {};
    if ("type" in prop) value.type = prop.type;
    if ("default" in prop) value.default = prop.default;
    if ("required" in prop) value.required = prop.required;
    return [key, value];
  }).reduce((acc, [key, val]) => {
    acc[key] = val;
    return acc;
  }, {});
}

// node_modules/@fawmi/vue-google-maps/src/components/polyline.js
var props = {
  draggable: {
    type: Boolean
  },
  editable: {
    type: Boolean
  },
  options: {
    twoWay: false,
    type: Object
  },
  path: {
    type: Array,
    twoWay: true
  }
};
var events = [
  "click",
  "dblclick",
  "drag",
  "dragend",
  "dragstart",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "rightclick"
];
var polyline_default = build_component_default({
  mappedProps: props,
  props: {
    deepWatch: {
      type: Boolean,
      default: false
    }
  },
  events,
  name: "polyline",
  ctr: () => google.maps.Polyline,
  afterCreate() {
    let clearEvents = () => {
    };
    this.$watch(
      "path",
      (path) => {
        if (path) {
          clearEvents();
          this.$polylineObject.setPath(path);
          const mvcPath = this.$polylineObject.getPath();
          const eventListeners = [];
          const updatePaths = () => {
            this.$emit("path_changed", this.$polylineObject.getPath());
          };
          eventListeners.push([mvcPath, mvcPath.addListener("insert_at", updatePaths)]);
          eventListeners.push([mvcPath, mvcPath.addListener("remove_at", updatePaths)]);
          eventListeners.push([mvcPath, mvcPath.addListener("set_at", updatePaths)]);
          clearEvents = () => {
            eventListeners.map(([obj, listenerHandle]) => google.maps.event.removeListener(listenerHandle));
          };
        }
      },
      {
        deep: this.deepWatch,
        immediate: true
      }
    );
  }
});

// node_modules/@fawmi/vue-google-maps/src/components/polygon.js
var props2 = {
  draggable: {
    type: Boolean
  },
  editable: {
    type: Boolean
  },
  options: {
    type: Object
  },
  path: {
    type: Array,
    twoWay: true,
    noBind: true
  },
  paths: {
    type: Array,
    twoWay: true,
    noBind: true
  }
};
var events2 = [
  "click",
  "dblclick",
  "drag",
  "dragend",
  "dragstart",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "rightclick"
];
var polygon_default = build_component_default({
  props: {
    deepWatch: {
      type: Boolean,
      default: false
    }
  },
  events: events2,
  mappedProps: props2,
  name: "polygon",
  ctr: () => google.maps.Polygon,
  beforeCreate(options) {
    if (!options.path) delete options.path;
    if (!options.paths) delete options.paths;
  },
  afterCreate(inst) {
    let clearEvents = () => {
    };
    this.$watch(
      "paths",
      (paths) => {
        if (paths) {
          clearEvents();
          inst.setPaths(paths);
          const updatePaths = () => {
            this.$emit("paths_changed", inst.getPaths());
          };
          const eventListeners = [];
          const mvcArray = inst.getPaths();
          for (let i = 0; i < mvcArray.getLength(); i++) {
            let mvcPath = mvcArray.getAt(i);
            eventListeners.push([mvcPath, mvcPath.addListener("insert_at", updatePaths)]);
            eventListeners.push([mvcPath, mvcPath.addListener("remove_at", updatePaths)]);
            eventListeners.push([mvcPath, mvcPath.addListener("set_at", updatePaths)]);
          }
          eventListeners.push([mvcArray, mvcArray.addListener("insert_at", updatePaths)]);
          eventListeners.push([mvcArray, mvcArray.addListener("remove_at", updatePaths)]);
          eventListeners.push([mvcArray, mvcArray.addListener("set_at", updatePaths)]);
          clearEvents = () => {
            eventListeners.map(([obj, listenerHandle]) => google.maps.event.removeListener(listenerHandle));
          };
        }
      },
      {
        deep: this.deepWatch,
        immediate: true
      }
    );
    this.$watch(
      "path",
      (path) => {
        if (path) {
          clearEvents();
          inst.setPaths(path);
          const mvcPath = inst.getPath();
          const eventListeners = [];
          const updatePaths = () => {
            this.$emit("path_changed", inst.getPath());
          };
          eventListeners.push([mvcPath, mvcPath.addListener("insert_at", updatePaths)]);
          eventListeners.push([mvcPath, mvcPath.addListener("remove_at", updatePaths)]);
          eventListeners.push([mvcPath, mvcPath.addListener("set_at", updatePaths)]);
          clearEvents = () => {
            eventListeners.map(([obj, listenerHandle]) => google.maps.event.removeListener(listenerHandle));
          };
        }
      },
      {
        deep: this.deepWatch,
        immediate: true
      }
    );
  }
});

// node_modules/@fawmi/vue-google-maps/src/components/circle.js
var props3 = {
  center: {
    type: Object,
    twoWay: true,
    required: true
  },
  radius: {
    type: Number,
    twoWay: true
  },
  draggable: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  },
  options: {
    type: Object,
    twoWay: false
  }
};
var events3 = [
  "click",
  "dblclick",
  "drag",
  "dragend",
  "dragstart",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "rightclick"
];
var circle_default = build_component_default({
  mappedProps: props3,
  name: "circle",
  ctr: () => google.maps.Circle,
  events: events3
});

// node_modules/@fawmi/vue-google-maps/src/components/rectangle.js
var props4 = {
  bounds: {
    type: Object,
    twoWay: true
  },
  draggable: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  },
  options: {
    type: Object,
    twoWay: false
  }
};
var events4 = [
  "click",
  "dblclick",
  "drag",
  "dragend",
  "dragstart",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "rightclick"
];
var rectangle_default = build_component_default({
  mappedProps: props4,
  name: "rectangle",
  ctr: () => google.maps.Rectangle,
  events: events4
});

// node_modules/@fawmi/vue-google-maps/src/main.js
import Marker from "D:/Users/Lucas-PC/Documents/GitHub/Reemo/node_modules/@fawmi/vue-google-maps/src/components/marker.vue";
import GMapCluster from "D:/Users/Lucas-PC/Documents/GitHub/Reemo/node_modules/@fawmi/vue-google-maps/src/components/cluster.vue";
import InfoWindow from "D:/Users/Lucas-PC/Documents/GitHub/Reemo/node_modules/@fawmi/vue-google-maps/src/components/infoWindow.vue";
import Map from "D:/Users/Lucas-PC/Documents/GitHub/Reemo/node_modules/@fawmi/vue-google-maps/src/components/map.vue";

// node_modules/@fawmi/vue-google-maps/src/components/heatmap.js
var props5 = {
  options: {
    type: Object,
    twoWay: false,
    default: () => {
    }
  },
  data: {
    type: Array,
    twoWay: true
  }
};
var events5 = [];
var heatmap_default = build_component_default({
  mappedProps: props5,
  name: "heatmap",
  ctr: () => google.maps.visualization.HeatmapLayer,
  events: events5
});

// node_modules/@fawmi/vue-google-maps/src/main.js
import Autocomplete from "D:/Users/Lucas-PC/Documents/GitHub/Reemo/node_modules/@fawmi/vue-google-maps/src/components/autocomplete.vue";

// node_modules/@fawmi/vue-google-maps/src/utils/mountableMixin.js
var mountableMixin_default = {
  props: ["resizeBus"],
  data() {
    return {
      _actualResizeBus: null
    };
  },
  created() {
    if (typeof this.resizeBus === "undefined") {
      this.$data._actualResizeBus = this.$gmapDefaultResizeBus;
    } else {
      this.$data._actualResizeBus = this.resizeBus;
    }
  },
  methods: {
    _resizeCallback() {
      this.resize();
    },
    isFunction(functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
    },
    _delayedResizeCallback() {
      this.$nextTick(() => this._resizeCallback());
    }
  },
  watch: {
    resizeBus(newVal) {
      this.$data._actualResizeBus = newVal;
    },
    "$data._actualResizeBus"(newVal, oldVal) {
      if (oldVal) {
        oldVal.$off("resize", this._delayedResizeCallback);
      }
      if (newVal) {
      }
    }
  },
  unmounted() {
    if (this.$data._actualResizeBus && this.isFunction(this.$data._actualResizeBus.$off)) {
      this.$data._actualResizeBus.$off("resize", this._delayedResizeCallback);
    }
  }
};

// node_modules/@fawmi/vue-google-maps/src/main.js
var GMapApi = null;
function install(Vue, options) {
  options = {
    installComponents: true,
    autobindAllEvents: false,
    ...options
  };
  GMapApi = createApp({
    data: function() {
      return { gmapApi: null };
    }
  });
  const defaultResizeBus = createApp();
  let gmapApiPromiseLazy = makeGMapApiPromiseLazy(options);
  Vue.mixin({
    created() {
      this.$gmapDefaultResizeBus = defaultResizeBus;
      this.$gmapOptions = options;
      this.$gmapApiPromiseLazy = gmapApiPromiseLazy;
    }
  });
  Vue.$gmapDefaultResizeBus = defaultResizeBus;
  Vue.$gmapApiPromiseLazy = gmapApiPromiseLazy;
  if (options.installComponents) {
    Vue.component("GMapMap", Map);
    Vue.component("GMapMarker", Marker);
    Vue.component("GMapInfoWindow", InfoWindow);
    Vue.component("GMapCluster", GMapCluster);
    Vue.component("GMapPolyline", polyline_default);
    Vue.component("GMapPolygon", polygon_default);
    Vue.component("GMapCircle", circle_default);
    Vue.component("GMapRectangle", rectangle_default);
    Vue.component("GMapAutocomplete", Autocomplete);
    Vue.component("GMapHeatmap", heatmap_default);
  }
}
function makeGMapApiPromiseLazy(options) {
  function onApiLoaded() {
    GMapApi.gmapApi = {};
    return window.google;
  }
  if (options.load) {
    return lazyValue_default(() => {
      if (Env.isServer()) {
        return new Promise(() => {
        }).then(onApiLoaded);
      } else {
        return new Promise((resolve, reject) => {
          try {
            window["vueGoogleMapsInit"] = resolve;
            loadGMapApi(options.load);
          } catch (err) {
            reject(err);
          }
        }).then(onApiLoaded);
      }
    });
  } else {
    const promise = new Promise((resolve) => {
      if (Env.isServer()) {
        return;
      }
      window["vueGoogleMapsInit"] = resolve;
    }).then(onApiLoaded);
    return lazyValue_default(() => promise);
  }
}
export {
  Autocomplete,
  circle_default as Circle,
  GMapCluster,
  heatmap_default as Heatmap,
  InfoWindow,
  Map,
  mapElementMixin_default as MapElementMixin,
  Marker,
  mountableMixin_default as MountableMixin,
  polygon_default as Polygon,
  polyline_default as Polyline,
  rectangle_default as Rectangle,
  build_component_default as buildComponent,
  install as default,
  loadGMapApi
};
//# sourceMappingURL=@fawmi_vue-google-maps.js.map
