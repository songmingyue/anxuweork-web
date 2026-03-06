<script setup lang="ts">
import DeviceUsage from './component/deviceUsage.vue'
import MatchRate from './component/matchRate.vue'
import FilmDailyUsage from './component/filmDailyUsage.vue'
import FilmMonthlyUsage from './component/filmMonthlyUsage.vue'
defineOptions({
  name: 'FilmStatistics'
})
</script>

<template>
  <div class="stats-page">
    <div class="stats-grid">
      <DeviceUsage />
      <MatchRate />
      <FilmMonthlyUsage />
      <FilmDailyUsage />
    </div>
  </div>
</template>
<style lang="less" scoped>
.stats-page {
  width: 100%;
  min-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
</style>
