<template lang="pug">
    .alert-list-filter-control(@click="e=>e.stopPropagation()"
      v-b-tooltip.hover.viewport
      :title="$t('common.results_toolbar.filter_button_tooltip')"
    )
      v-select(
        ref="select"
        searcheable="false" 
        :clearable="false"
        v-model="selectedValue"
        @input="onChange"
        class=""
        :append-to-body="true" :calculate-position="withPopper"
      :options="options")
        template( v-slot:search="{ attributes, events }")
          FilterIcon.icon(:fillColor="colors.color_denim" v-bind="attributes"
              )
    </template>
    <script>
    import { removeNativeTooltipFromMaterialIconsMixin } from '@/mixins/icons-mixin.js'
    import { createPopper } from '@popperjs/core'
    import colors from '@/styles/colors'
    import FilterIcon from 'vue-material-design-icons/Filter.vue'
    import $ from 'jquery'
    
    export default {
      components: {
        FilterIcon,
      },
      mixins: [removeNativeTooltipFromMaterialIconsMixin],
      props: {
        size: {
          type: Number,
          default: 16,
        },
        color: {
          type: String,
          default: '--color-black',
        },
        value: {
          type: String,
          default: '',
        },
      },
      data() {
        return {
          selectedValue: this.value,
          colors,
        }
      },
      computed: {
        style() {
          return `font-size:${this.size}px; color: var(${this.color})`
        },
        options() {
          return [
            {
              label: this.$t('alerts.main_search.results_filter.none'),
              value: 'NONE',
            },
            {
              label: this.$t('alerts.main_search.results_filter.ack'),
              value: 'ACK',
            },
            {
              label: this.$t('alerts.main_search.results_filter.noack'),
              value: 'NOACK',
            },
          ]
        },
      },
      mounted() {
        $(window).on(
          'click',
          (this.onClick = () => {
            if (this.$refs.select) {
              this.$refs.select.open = false
            }
          })
        )
      },
      destroyed() {
        $(window).off('click', this.onClick)
        $(window).on('keyup', this.onKeyUp)
      },
      methods: {
        onChange() {
          this.$emit('input', this.selectedValue.value)
        },
        withPopper(dropdownList, component, { width }) {
          /**
           * We need to explicitly define the dropdown width since
           * it is usually inherited from the parent with CSS.
           */
          dropdownList.style.width = 'fit-content'
    
          /**
           * Here we position the dropdownList relative to the $refs.toggle Element.
           *
           * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
           * the dropdownList overlap by 1 pixel.
           *
           * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
           * wrapper so that we can set some styles for when the dropdown is placed
           * above.
           */
          const popper = createPopper(component.$refs.toggle, dropdownList, {
            placement: 'right-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -1],
                },
              },
              {
                name: 'toggleClass',
                enabled: true,
                phase: 'write',
                fn({ state }) {
                  component.$el.classList.toggle('drop-down', true)
                },
              },
            ],
          })
        },
      },
    }
    </script>
    <style lang="scss">
    .alert-list-filter-control em {
      color: var(--color-black);
      margin-top: 10px;
    }
    .alert-list-filter-control .vs__selected {
      font-size: 10px;
      display: none;
    }
    .alert-list-filter-control .vs__dropdown-toggle {
      border: 0px;
      width: fit-content;
      cursor: pointer;
      padding-bottom: 0px;
    }
    .alert-list-filter-control .vs__actions {
      display: none;
    }
    .alert-list-filter-control .vs--single.vs--open .vs__selected {
      display: none;
    }
    .alert-list-filter-control button {
      position: relative;
      bottom: -4px;
    }
    </style>
    