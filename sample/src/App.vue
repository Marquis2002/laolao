<template>
    <demo-component>
    </demo-component>
</template>

<script>
  import Demo from './components/Demo.vue'
  // import Title from "./components/Laolao.vue";

export default {
  name: 'App',
    components: {
        'demo-component': Demo
        // 'title-component': Title
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
