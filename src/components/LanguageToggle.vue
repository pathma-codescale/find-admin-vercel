<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const toggleLanguage = () => {
    const newLocale = locale.value === 'en' ? 'fr' : 'en'
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
}
</script>

<template>
    <button @click.stop="toggleLanguage" class="flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors
           dark:text-white text-black hover:bg-gray-700/20 dark:hover:bg-gray-500/30">
        <span v-if="locale === 'en'" class="fi fi-gb"></span>
        <span v-if="locale === 'fr'" class="fi fi-fr"></span>
        {{ locale.toUpperCase() }}
    </button>
</template>
