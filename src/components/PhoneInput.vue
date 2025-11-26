
<script setup lang="ts">
import { ref } from "vue"
import { countries, type Country } from "../constants/countries" 

const selectedCountry = ref<Country>(countries[0])
const phoneNumber = ref("")
const dropdownOpen = ref(false)

function selectCountry(c: Country) {
  selectedCountry.value = c
  dropdownOpen.value = false
}

function getFullNumber() {
  return `${selectedCountry.value.dial}${phoneNumber.value}`
}
</script>

