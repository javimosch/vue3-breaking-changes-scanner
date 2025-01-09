# Migration Example: AlertListFilterControl Component

This document provides a focused guide to migrating the `AlertListFilterControl.vue` component from Vue 2.7 to Vue 3, highlighting only the necessary changes based on the examination of `AlertListFilterControl.vue`.

## Key Changes for Migration

### 1. Modify v-model Implementation
- **Action:**
  - Change `@input` to `v-model` using `modelValue` and `update:modelValue` directly on the `v-select` component.

### 2. Adjust Lifecycle Hooks
- **Action:**
  - Rename `destroyed` to `unmounted` in the component's lifecycle hooks.

### 3. Refactor Scoped Slots
- **Action:**
  - Ensure the `v-slot:search` syntax is correctly implemented in the template.

## Conclusion
By implementing these focused changes, you can successfully migrate the `AlertListFilterControl.vue` component to Vue 3, ensuring it functions correctly with the new features and improvements.
