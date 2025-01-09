# Breaking Changes in Vue 3

Below we can find a list of breaking changes in Vue 3 (compared to Vue 2.7) and it also includes the migration from webpack to vite.

1. **Global API Changes**
   - **Description:** Vue 3 introduces a new global API structure. For example, `Vue.extend`, `Vue.nextTick`, and `Vue.set` are no longer available. Instead, you use `createApp` and other methods from the vue package.
   - **Complexity:** Medium
   - **Type:** Vue

2. **v-model Behavior Change**
   - **Description:** In Vue 3, `v-model` replaces `v-bind.sync` and uses `modelValue` and `update:modelValue` instead of `value` and `input`. This affects custom components using `v-model`.
   - **Complexity:** Medium
   - **Type:** Vue

3. **Key Modifiers for v-on**
   - **Description:** Vue 3 removes support for key codes (e.g., `v-on:keyup.13`). Instead, use named keys (e.g., `v-on:keyup.enter`).
   - **Complexity:** Low
   - **Type:** Vue

4. **Event Bus Pattern**
   - **Description:** Vue 3 removes the `$on`, `$off`, and `$once` methods. If you rely on an event bus, you’ll need to replace it with an external library like `mitt` or refactor your code.
   - **Complexity:** Medium
   - **Type:** Vue

5. **Filters Removal**
   - **Description:** Vue 3 removes the filters feature. You’ll need to replace filters with computed properties or methods.
   - **Complexity:** Medium
   - **Type:** Vue

6. **Scoped Slots Change**
   - **Description:** In Vue 3, scoped slots are unified with regular slots. The `slot` attribute is replaced with `v-slot`.
   - **Complexity:** Medium
   - **Type:** Vue

7. **Lifecycle Hook Changes**
   - **Description:** The `beforeDestroy` and `destroyed` hooks are renamed to `beforeUnmount` and `unmounted` in Vue 3.
   - **Complexity:** Low
   - **Type:** Vue

8. **Vue.set and Vue.delete Removal**
   - **Description:** Vue 3’s reactivity system no longer requires `Vue.set` or `Vue.delete` for adding or removing reactive properties.
   - **Complexity:** Low
   - **Type:** Vue

9. **Webpack to Vite Migration**
   - **Description:** Vite uses ES modules by default and has a different configuration format compared to Webpack. You’ll need to update your build configuration and ensure compatibility with Vite’s dev server.
   - **Complexity:** High
   - **Type:** ViteJS

10. **Plugin Compatibility**
    - **Description:** Some Vue 2 plugins may not be compatible with Vue 3. You’ll need to check for Vue 3-compatible versions or find alternatives.
    - **Complexity:** Medium
    - **Type:** Vue

11. **Vue Router and Vuex Upgrades**
    - **Description:** Vue 3 requires Vue Router 4 and Vuex 4. These versions have breaking changes, so you’ll need to update your routing and state management code.
    - **Complexity:** Medium
    - **Type:** Vue

12. **Custom Directives API Change**
    - **Description:** The lifecycle hooks for custom directives have been renamed to align with component lifecycle hooks (e.g., `bind` becomes `beforeMount`).
    - **Complexity:** Low
    - **Type:** Vue

13. **Vue.prototype Replacement**
    - **Description:** In Vue 3, `Vue.prototype` is replaced with `app.config.globalProperties` for adding global properties or methods.
    - **Complexity:** Low
    - **Type:** Vue

14. **Async Component API Change**
    - **Description:** Vue 3 changes the API for defining async components. The `resolve` and `reject` functions are replaced with `defineAsyncComponent`.
    - **Complexity:** Medium
    - **Type:** Vue

15. **Vite-Specific Changes**
    - **Description:** Vite uses ES modules and has a different approach to handling static assets, environment variables, and CSS. You’ll need to update your project configuration and imports accordingly.
    - **Complexity:** High
    - **Type:** ViteJS