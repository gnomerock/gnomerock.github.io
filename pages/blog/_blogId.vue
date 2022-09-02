<template>
  <div class="container m-8">
    <article>
      <h1>{{ page.title }}</h1>
      <nuxt-content :document="page" />
    </article>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params }) {
    const page = await $content('blog').where({ slug: params.blogId }).fetch()
    return {
      page
    }
  }
}
</script>