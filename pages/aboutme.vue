<template>
  <div class="container m-8">
    <nuxt-content :document="page" />

    <hr>
    <h5>Latest languges i used in the past year.</h5>
    <figure class="w-96"><embed src="https://wakatime.com/share/@gnomerock/bac93692-f52c-416d-8cb4-6e8c159ef2d1.svg"></embed></figure>
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