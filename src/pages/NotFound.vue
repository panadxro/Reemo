<script>
export default {
  name: 'NotFoundPage'
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <router-link to="/" class="home-link">Volver al inicio</router-link>
    </div>  
  </div>    
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: #f8f9fa;
}

.not-found-content {
  max-width: 500px;
  padding: 2rem;
}

h1 {
  font-size: 5rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #0056b3;
}
</style>