<template>
  <div class="mt-8 flex relative lg:mt-0 lg:py-2 lg:pl-8">
    <i
      class="flex items-center justify-center w-8 h-8 text-gray-600 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:-left-7 lg:border lg:border-gray-200 lg:bg-white lg:rounded-lg lg:w-12 lg:h-12"
    >
      <slot name="icon"></slot>
    </i>
    <div class="flex-1 ml-4 lg:ml-0">
      <h3 class="text-xl font-medium mb-2 text-gray-100">
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>

    <div
      class="hidden lg:block absolute left-0 bottom-1/2 translate-y-6 w-px h-1/2 bg-gray-200 first:hidden"
    ></div>

    <div
      class="hidden lg:block absolute left-0 top-1/2 translate-y-6 w-px h-1/2 bg-gray-200 last:hidden"
    ></div>
  </div>
</template>
