<script setup lang="ts">
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { getQualitiesOptions } from '@/constants/selectorOptionsNew'
import ActionButtonSet from '@/components/ActionButtonSet.vue'
import UserStatus from '@/components/UserStatus.vue'

const { t } = useI18n()

interface CandidateData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  profilePhotoUrl?: string
  dateOfBirth?: string
  status?: string
  isBanned?: boolean
  isViewed?: boolean
  location?: { locationName?: string }
  schedules?: string[]
  qualities?: string[]
}

interface Props {
  candidates?: CandidateData[]
  loading?: boolean
  itemsPerPage?: number
  totalCount?: number
  currentPage?: number
  hasNextPage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  candidates: () => [],
  loading: false,
  itemsPerPage: 10,
  totalCount: 0,
  currentPage: 1,
  hasNextPage: false,
})

const emit = defineEmits<{
  ban: [candidateId: string, isBanned: boolean]
  view: [candidateId: string]
  edit: [candidateId: string]
  delete: [candidateId: string]
  'page-change': [page: number]
}>()

const availableQualities = getQualitiesOptions(t)

const qualityLabelsMap = computed(() => {
  return availableQualities.reduce((acc: Record<string, string>, quality: any) => {
    acc[quality.value] = quality.label
    return acc
  }, {})
})

const getQualityLabel = (qualityValue: string) => {
  return qualityLabelsMap.value[qualityValue] || qualityValue
}

const filteredCandidates = computed(() => props.candidates || [])

const maxVisibleSkills = 3
const showSkillsMap = ref<Record<string, boolean>>({})

const toggleSkills = (id: string) => {
  showSkillsMap.value[id] = !showSkillsMap.value[id]
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const handleBan = (candidateId: string, isBanned: boolean) => {
  emit('ban', candidateId, isBanned)
}

const handleView = (id: string) => emit('view', id)
const handleEdit = (id: string) => emit('edit', id)
const handleDelete = (id: string) => emit('delete', id)

const loadNextPage = () => {
  emit('page-change', props.currentPage + 1)
}

const loadPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}
</script>

<template>
  <div class="w-full border border-borderGray rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 sm:p-6 border-b border-borderGray">
      <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold text-black dark:text-white">
        All Candidates
      </h2>
    </div>

    <!-- Table Header (Desktop) -->
    <div class="hidden lg:block bg-darkPink/50 border-borderGray">
      <div
        class="grid grid-cols-12 gap-4 px-4 py-2 border-b font-medium text-sm text-black dark:text-white"
      >
        <div class="col-span-2">Candidate</div>
        <div class="col-span-1">Date of Birth</div>
        <div class="col-span-2">Location</div>
        <div class="col-span-2">Key Skills</div>
        <div class="col-span-2">Phone Number</div>
        <div class="col-span-2">Status</div>
        <div class="col-span-1 text-center">Actions</div>
      </div>
    </div>

    <!-- Candidates List -->
    <div class="divide-y divide-border-borderGray">
      <div v-if="props.loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-secondaryText mt-2">Loading candidates...</p>
      </div>

      <div v-else-if="filteredCandidates.length === 0" class="p-8 text-center">
        <p class="text-secondaryText">No candidates found</p>
      </div>

      <div v-else>
        <!-- Desktop -->
        <div class="hidden lg:block">
          <div
            v-for="candidate in filteredCandidates"
            :key="candidate.id"
            class="grid grid-cols-12 gap-4 px-4 py-2 border-b hover:bg-topBar/30 transition-colors duration-200 items-center"
          >
            <!-- Candidate -->
            <div class="col-span-2 flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="candidate.profilePhotoUrl"
                  :src="candidate.profilePhotoUrl"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-gray-100 font-bold text-sm">
                  {{ candidate.firstName?.charAt(0).toUpperCase()
                  }}{{ candidate.lastName?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-black dark:text-white truncate">
                  {{ candidate.firstName }} {{ candidate.lastName }}
                </h3>
                <p class="text-xs text-secondaryText truncate">{{ candidate.email }}</p>
              </div>
            </div>

            <!-- DOB -->
            <div class="col-span-1 text-xs text-black dark:text-white">
              {{ formatDate(candidate.dateOfBirth) }}
            </div>

            <!-- Location -->
            <div class="col-span-2 text-xs text-secondaryText">
              {{ candidate.location?.locationName ?? 'Unknown' }}
            </div>

            <!-- Key Skills -->
            <div class="col-span-2 relative">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(skill, index) in candidate.qualities?.slice(0, maxVisibleSkills)"
                  :key="index"
                  class="px-1 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                  >{{ getQualityLabel(skill) }}</span
                >
                <span
                  v-if="candidate.qualities && candidate.qualities.length > maxVisibleSkills"
                  class="px-1 py-1 text-xs rounded-full bg-white dark:bg-black text-black dark:text-white cursor-pointer"
                  @click="toggleSkills(candidate.id)"
                >
                  {{
                    showSkillsMap[candidate.id]
                      ? '-' + (candidate.qualities.length - maxVisibleSkills)
                      : '+' + (candidate.qualities.length - maxVisibleSkills)
                  }}
                </span>
              </div>
              <div
                v-if="showSkillsMap[candidate.id]"
                class="absolute top-full left-0 mt-1 p-2 bg-label dark:bg-topBar border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 flex flex-wrap gap-1 w-max"
              >
                <span
                  v-for="skill in candidate.qualities?.slice(maxVisibleSkills)"
                  :key="skill"
                  class="px-1 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                  >{{ getQualityLabel(skill) }}</span
                >
              </div>
            </div>

            <!-- Phone -->
            <div class="col-span-2 text-xs text-black dark:text-white">
              {{ candidate.phoneNumber ?? 'N/A' }}
            </div>

            <!-- Status -->
            <div class="col-span-2"><UserStatus :status="candidate.status ?? 'active'" /></div>

            <!-- Actions -->
            <div class="col-span-1 flex items-center justify-center space-x-1">
              <ActionButtonSet
                :item-id="candidate.id"
                :is-banned="candidate.isBanned"
                :is-viewed="candidate.isViewed"
                @ban="() => handleBan(candidate.id, !candidate.isBanned)"
                @view="handleView(candidate.id)"
                @edit="handleEdit(candidate.id)"
                @delete="handleDelete(candidate.id)"
              />
            </div>
          </div>
        </div>

        <!-- Mobile View -->
        <div class="lg:hidden">
          <div
            v-for="candidate in filteredCandidates"
            :key="candidate.id"
            class="p-4 hover:bg-topBar/30 transition-colors duration-200"
          >
            <div class="flex items-start space-x-3">
              <div
                class="w-12 h-12 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="candidate.profilePhotoUrl"
                  :src="candidate.profilePhotoUrl"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-gray-100 font-bold text-sm">
                  {{ candidate.firstName?.charAt(0).toUpperCase()
                  }}{{ candidate.lastName?.charAt(0).toUpperCase() }}
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-black dark:text-white truncate">
                      {{ candidate.firstName }} {{ candidate.lastName }}
                    </h3>
                    <p class="text-xs text-secondaryText truncate">{{ candidate.email }}</p>
                  </div>
                  <UserStatus :status="candidate.status ?? 'active'" />
                </div>

                <div class="mt-2 space-y-1 text-xs text-secondaryText">
                  <p>{{ candidate.location?.locationName ?? 'Unknown' }}</p>
                  <p>{{ formatDate(candidate.dateOfBirth) }}</p>
                  <p>{{ candidate.phoneNumber ?? 'N/A' }}</p>
                  <div class="flex flex-wrap gap-1 mt-1 relative">
                    <span
                      v-for="(skill, index) in candidate.qualities?.slice(0, maxVisibleSkills)"
                      :key="index"
                      class="px-2 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                      >{{ getQualityLabel(skill) }}</span
                    >
                    <span
                      v-if="candidate.qualities && candidate.qualities.length > maxVisibleSkills"
                      class="px-2 py-1 text-xs rounded-full bg-gray/20 text-black dark:text-white cursor-pointer"
                      @click="toggleSkills(candidate.id)"
                    >
                      {{
                        showSkillsMap[candidate.id]
                          ? '-' + (candidate.qualities.length - maxVisibleSkills)
                          : '+' + (candidate.qualities.length - maxVisibleSkills)
                      }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-2 mt-3">
                  <ActionButtonSet
                    :item-id="candidate.id"
                    :is-banned="candidate.isBanned"
                    :is-viewed="candidate.isViewed"
                    @ban="() => handleBan(candidate.id, !candidate.isBanned)"
                    @view="handleView(candidate.id)"
                    @edit="handleEdit(candidate.id)"
                    @delete="handleDelete(candidate.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between p-4 border-t border-borderGray">
      <div class="text-sm text-black dark:text-white">Page {{ props.currentPage }}</div>
      <div class="flex items-center space-x-2">
        <button
          @click="loadPreviousPage"
          :disabled="props.currentPage <= 1 || props.loading"
          class="px-3 py-1 text-sm border border-black dark:border-borderGray rounded text-black dark:text-white disabled:text-secondaryText disabled:border-border-borderGray disabled:cursor-not-allowed hover:bg-topBar transition-colors"
        >
          Previous
        </button>
        <button
          @click="loadNextPage"
          :disabled="!props.hasNextPage || props.loading"
          class="px-3 py-1 text-sm border border-black dark:border-borderGray rounded text-black dark:text-white disabled:text-secondaryText disabled:border-border-borderGray disabled:cursor-not-allowed hover:bg-topBar transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
