<template>
  <div class="container m-8">
    <h1 class="text-blue-700">Gnomeblog</h1>
    <hr>
    <div v-for="blog in blogs" :key="blog.slug">{{blog.title}}</div>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }){
    let blogs = await $content('blog').fetch()

    return {
      blogs
    }
  }
}
</script>