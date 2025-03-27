<script setup lang="ts">
const { t } = useI18n();
const { data } = await useFetch('/api/products');
</script>

<template>
  <h2>{{ t('products') }}</h2>
  <pre>
    {{ data }}
  </pre>
</template>
