<template>
  <div class="container m-8">
    <nuxt-content :document="page" />
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('aboutme').fetch()
    return {
      page
    }
  }
}
</script>