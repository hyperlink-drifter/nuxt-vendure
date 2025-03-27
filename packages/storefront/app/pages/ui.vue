<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <h2>{{ t('ui') }}</h2>
  <div>
    <NuxtLinkLocale to="/">{{ t('welcome') }}</NuxtLinkLocale>
  </div>
  <div>
    <NuxtLinkLocale to="/products">{{ t('products') }}</NuxtLinkLocale>
  </div>
  <div>
    <SwitchLocalePathLink locale="en">english</SwitchLocalePathLink>
  </div>
  <div>
    <SwitchLocalePathLink locale="fr">français</SwitchLocalePathLink>
  </div>
  <div>
    <SwitchLocalePathLink locale="uk">українська мова</SwitchLocalePathLink>
  </div>
  <div>
    <SwitchLocalePathLink locale="de">deutsch</SwitchLocalePathLink>
  </div>
  <Button>Click me</Button>
</template>
