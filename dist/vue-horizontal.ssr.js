'use strict';Object.defineProperty(exports,'__esModule',{value:true});var Vue=require('vue');function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var Vue__default=/*#__PURE__*/_interopDefaultLegacy(Vue);var delta = 2.5;
var script = Vue__default['default'].extend({
  name: "VueHorizontal",
  data: function data() {
    return {
      left: 0,
      width: 0,
      scrollWidth: 0,
      hasPrev: false,
      hasNext: false,
      debounceId: undefined
    };
  },
  props: {
    /**
     * Navigation button visibility
     */
    button: {
      type: Boolean,
      default: function _default() {
        return true;
      }
    },

    /**
     * Navigation button alignment, default to between the edge of the horizontal axis.
     */
    buttonBetween: {
      type: Boolean,
      default: function _default() {
        return true;
      }
    },

    /**
     * Scrollbar visibility
     */
    scroll: {
      type: Boolean,
      default: function _default() {
        return false;
      }
    },

    /**
     * Use default responsive breakpoint.
     */
    responsive: {
      type: Boolean,
      default: function _default() {
        return false;
      }
    },

    /**
     * Move window, indicates the percent of width to travel when nav is triggered.
     */
    displacement: {
      type: Number,
      default: function _default() {
        return 1.0;
      }
    },

    /**
     * Snap to start|center|end
     */
    snap: {
      type: String,
      default: function _default() {
        return "start";
      }
    }
  },
  mounted: function mounted() {// this.onScrollDebounce();
  },
  beforeDestroy: function beforeDestroy() {
    clearTimeout(this.debounceId);
  },
  methods: {
    children: function children() {
      var container = this.$refs.container;
      return container.children;
    },
    findPrevSlot: function findPrevSlot(x) {
      var children = this.children();

      for (var i = 0; i < children.length; i++) {
        var rect = children[i].getBoundingClientRect();

        if (rect.left <= x && x <= rect.right) {
          return children[i];
        }

        if (x <= rect.left) {
          return children[i];
        }
      }
    },
    findNextSlot: function findNextSlot(x) {
      var children = this.children();

      for (var i = 0; i < children.length; i++) {
        var rect = children[i].getBoundingClientRect();

        if (rect.right <= x) {
          continue;
        } else if (rect.left <= x) {
          return children[i];
        }

        if (x <= rect.left) {
          return children[i];
        }
      }
    },

    /**
     * Toggle and scroll to the previous set of horizontal content.
     */
    prev: function prev() {
      this.$emit("prev");
      var container = this.$refs.container;
      var left = container.getBoundingClientRect().left;
      var x = left + container.clientWidth * -this.displacement - delta;
      var element = this.findPrevSlot(x);

      if (element) {
        var _width = element.getBoundingClientRect().left - left;

        this.scrollToLeft(container.scrollLeft + _width);
        return;
      }

      var width = container.clientWidth * this.displacement;
      this.scrollToLeft(container.scrollLeft - width);
    },

    /**
     * Toggle and scroll to the next set of horizontal content.
     */
    next: function next() {
      this.$emit("next");
      var container = this.$refs.container;
      var left = container.getBoundingClientRect().left;
      var x = left + container.clientWidth * this.displacement + delta;
      var element = this.findNextSlot(x);

      if (element) {
        var _width2 = element.getBoundingClientRect().left - left;

        if (_width2 > delta) {
          this.scrollToLeft(container.scrollLeft + _width2);
          return;
        }
      }

      var width = container.clientWidth * this.displacement;
      this.scrollToLeft(container.scrollLeft + width);
    },

    /**
     * Index of the slots to scroll to.
     * @param i index
     */
    scrollToIndex: function scrollToIndex(i) {
      var children = this.children();

      if (children[i]) {
        var container = this.$refs.container;
        var rect = children[i].getBoundingClientRect();
        var left = rect.left - container.getBoundingClientRect().left;
        this.scrollToLeft(container.scrollLeft + left);
      }
    },

    /**
     * Amount of pixel to scroll to on the left.
     * @param left of the horizontal
     * @param behavior smooth|auto
     */
    scrollToLeft: function scrollToLeft(left) {
      var behavior = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "smooth";
      var element = this.$refs.container;
      element.scrollTo({
        left: left,
        behavior: behavior
      });
    },
    onScroll: function onScroll() {
      var container = this.$refs.container; // Resolves https://github.com/fuxingloh/vue-horizontal/issues/99#issue-862691647

      if (!container) return;
      this.$emit("scroll", {
        left: container.scrollLeft
      });
      clearTimeout(this.debounceId); // @ts-ignore

      this.debounceId = setTimeout(this.onScrollDebounce, 100);
    },
    onScrollDebounce: function onScrollDebounce() {
      var _this = this;

      this.refresh(function (data) {
        _this.$emit("scroll-debounce", data);
      });
    },

    /**
     * Manually refresh vue-horizontal
     * @param callback after refreshed, optional
     */
    refresh: function refresh(callback) {
      var _this2 = this;

      this.$nextTick(function () {
        var data = _this2.calculate();

        _this2.left = data.left;
        _this2.width = data.width;
        _this2.scrollWidth = data.scrollWidth;
        _this2.hasNext = data.hasNext;
        _this2.hasPrev = data.hasPrev;
        callback(data);
      });
    },
    calculate: function calculate() {
      var container = this.$refs.container;
      var firstChild = this.children()[0];

      function hasNext() {
        return container.scrollWidth > container.scrollLeft + container.clientWidth + delta;
      }

      function hasPrev() {
        var _firstChild$getBoundi, _firstChild$getBoundi2;

        if (container.scrollLeft === 0) {
          return false;
        }

        var containerVWLeft = container.getBoundingClientRect().left;
        var firstChildLeft = (_firstChild$getBoundi = firstChild === null || firstChild === void 0 ? void 0 : (_firstChild$getBoundi2 = firstChild.getBoundingClientRect()) === null || _firstChild$getBoundi2 === void 0 ? void 0 : _firstChild$getBoundi2.left) !== null && _firstChild$getBoundi !== void 0 ? _firstChild$getBoundi : 0;
        return Math.abs(containerVWLeft - firstChildLeft) >= delta;
      }

      return {
        left: container.scrollLeft,
        width: container.clientWidth,
        scrollWidth: container.scrollWidth,
        hasNext: hasNext(),
        hasPrev: hasPrev()
      };
    }
  }
});function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}function createInjectorSSR(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
    }
    if (!context)
        return () => { };
    if (!('styles' in context)) {
        context._styles = context._styles || {};
        Object.defineProperty(context, 'styles', {
            enumerable: true,
            get: () => context._renderStyles(context._styles)
        });
        context._renderStyles = context._renderStyles || renderStyles;
    }
    return (id, style) => addStyle(id, style, context);
}
function addStyle(id, css, context) {
    const group =  css.media || 'default' ;
    const style = context._styles[group] || (context._styles[group] = { ids: [], css: '' });
    if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        let code = css.source;
        style.css += code + '\n';
    }
}
function renderStyles(styles) {
    let css = '';
    for (const key in styles) {
        const style = styles[key];
        css +=
            '<style data-vue-ssr-id="' +
                Array.from(style.ids).join(' ') +
                '"' +
                (style.media ? ' media="' + style.media + '"' : '') +
                '>' +
                style.css +
                '</style>';
    }
    return css;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "vue-horizontal",
    staticStyle: {
      "position": "relative",
      "display": "flex"
    }
  }, [_vm.button && _vm.hasPrev ? _vm._ssrNode("<div role=\"button\"" + _vm._ssrClass("v-hl-btn v-hl-btn-prev", {
    'v-hl-btn-between': _vm.buttonBetween
  }) + " data-v-3b4b3782>", "</div>", [_vm._t("btn-prev", [_c('svg', {
    staticClass: "v-hl-svg",
    attrs: {
      "viewBox": "0 0 24 24",
      "aria-label": "horizontal scroll area navigate to previous button"
    }
  }, [_c('path', {
    attrs: {
      "d": "m9.8 12 5 5a1 1 0 1 1-1.4 1.4l-5.7-5.7a1 1 0 0 1 0-1.4l5.7-5.7a1 1 0 0 1 1.4 1.4l-5 5z"
    }
  })])])], 2) : _vm._e(), _vm._ssrNode(" "), _vm.button && _vm.hasNext ? _vm._ssrNode("<div role=\"button\"" + _vm._ssrClass("v-hl-btn v-hl-btn-next", {
    'v-hl-btn-between': _vm.buttonBetween
  }) + " data-v-3b4b3782>", "</div>", [_vm._t("btn-next", [_c('svg', {
    staticClass: "v-hl-svg",
    attrs: {
      "viewBox": "0 0 24 24",
      "aria-label": "horizontal scroll area navigate to next button"
    }
  }, [_c('path', {
    attrs: {
      "d": "m14.3 12.1-5-5a1 1 0 0 1 1.4-1.4l5.7 5.7a1 1 0 0 1 0 1.4l-5.7 5.7a1 1 0 0 1-1.4-1.4l5-5z"
    }
  })])])], 2) : _vm._e(), _vm._ssrNode(" "), _vm._ssrNode("<div" + _vm._ssrClass("v-hl-container", {
    'v-hl-responsive': _vm.responsive,
    'v-hl-scroll': _vm.scroll,
    'v-hl-snap-start': _vm.snap === 'start',
    'v-hl-snap-center': _vm.snap === 'center',
    'v-hl-snap-end': _vm.snap === 'end'
  }) + " data-v-3b4b3782>", "</div>", [_vm._t("default")], 2)], 2);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-3b4b3782_0", {
    source: ".v-hl-btn[data-v-3b4b3782]{position:absolute;align-self:center;z-index:1;top:0;bottom:0;display:flex;align-items:center;cursor:pointer}.v-hl-btn-prev[data-v-3b4b3782]{left:0}.v-hl-btn-prev.v-hl-btn-between[data-v-3b4b3782]{transform:translateX(-50%)}.v-hl-btn-next[data-v-3b4b3782]{right:0}.v-hl-btn-next.v-hl-btn-between[data-v-3b4b3782]{transform:translateX(50%)}.v-hl-svg[data-v-3b4b3782]{width:40px;height:40px;margin:6px;padding:6px;border-radius:20px;box-sizing:border-box;background:#fff;color:#000;fill:currentColor;box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24)}.v-hl-container[data-v-3b4b3782]{display:flex;width:100%;margin:0;padding:0;border:none;box-sizing:content-box;overflow-x:scroll;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}.v-hl-container>*[data-v-3b4b3782]{flex-shrink:0;box-sizing:border-box;min-height:1px}.v-hl-snap-start>*[data-v-3b4b3782]{scroll-snap-align:start}.v-hl-snap-center>*[data-v-3b4b3782]{scroll-snap-align:center}.v-hl-snap-end>*[data-v-3b4b3782]{scroll-snap-align:end}.v-hl-container[data-v-3b4b3782]:not(.v-hl-scroll){scrollbar-width:none;-ms-overflow-style:none;padding-bottom:30px;margin-bottom:-30px;clip-path:inset(0 0 30px 0)}.v-hl-container[data-v-3b4b3782]:not(.v-hl-scroll)::-webkit-scrollbar{width:0!important;height:0!important}.v-hl-responsive>*[data-v-3b4b3782]{width:100%;margin-right:24px}.v-hl-responsive[data-v-3b4b3782]>:last-child{margin-right:0}@media (min-width:640px){.v-hl-responsive>*[data-v-3b4b3782]{width:calc((100% - 24px)/ 2)}}@media (min-width:768px){.v-hl-responsive>*[data-v-3b4b3782]{width:calc((100% - 48px)/ 3)}}@media (min-width:1024px){.v-hl-responsive>*[data-v-3b4b3782]{width:calc((100% - 72px)/ 4)}}@media (min-width:1280px){.v-hl-responsive>*[data-v-3b4b3782]{width:calc((100% - 96px)/ 5)}}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = "data-v-3b4b3782";
/* module identifier */

var __vue_module_identifier__ = "data-v-3b4b3782";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, createInjectorSSR, undefined);// Import vue component
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// install function executed by Vue.use()
var install = function installVueHorizontal(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('VueHorizontal', __vue_component__);
}; // Create module definition for Vue.use()


var plugin = {
  install: install
}; // To auto-install on non-es builds, when vue is found
// eslint-disable-next-line no-redeclare

/* global window, global */

{
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }
} // Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
// eslint-disable-next-line @typescript-eslint/no-explicit-any


__vue_component__.install = install; // Export component by default
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports.default=__vue_component__;