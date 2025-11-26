<template>
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
            <li v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.name" class="breadcrumb-item">
                <router-link v-if="breadcrumb.to && index < breadcrumbs.length - 1" :to="breadcrumb.to"
                    class="breadcrumb-link">
                    {{ $t(`breadcrumbs.${breadcrumb.name}`) }}
                </router-link>
                <span v-else class="breadcrumb-current" :class="{ 'current': index === breadcrumbs.length - 1 }">
                    {{ $t(`breadcrumbs.${breadcrumb.name}`) }}
                </span>
                <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">
                    /
                </span>
            </li>
        </ol>

        <!-- Heading -->
        <h2 class="text-xl text-black dark:text-white font-bold mt-1 mb-6">
            {{ $t(`breadcrumbs.${breadcrumbs[breadcrumbs.length - 1].name}`) }}
        </h2>
    </nav>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface Breadcrumb {
    name: string
    to?: string
}

const route = useRoute()
const { t } = useI18n()

const breadcrumbs = computed(() => {
    const routeBreadcrumbs = route.meta.breadcrumbs as Breadcrumb[] | undefined

    if (!routeBreadcrumbs) {
        return []
    }

    return routeBreadcrumbs
})
</script>

<style scoped>
.breadcrumb-nav {
    padding: 16px 0;
}

.breadcrumb-list {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 14px;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
}

.breadcrumb-link {
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s ease;
}

.breadcrumb-link:hover {
    color: #F94DAF;
}

.breadcrumb-current {
    color: #1e293b;
    font-weight: 500;
}

.breadcrumb-current.current {
    color: #FF00A2;
    text-decoration: underline;
}

.breadcrumb-separator {
    margin: 0 8px;
    color: #94a3b8;
    user-select: none;
}
</style>