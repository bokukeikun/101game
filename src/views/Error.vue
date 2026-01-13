<template>
  <div class="error">
    <div class="error-top-info">
      <div class="error-logo-container">
        <img class="error-logo" :src="logoImage" alt="logo" />
      </div>
    </div>
    <h1>404</h1>
    <p>Sorry, the page you're looking for can not found.</p>
    <router-link to="/">
      <button class="game-button red">Go Back Home</button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import logoImage from '@/assets/images/logo.png'
</script>

<style lang="scss" scoped>
.error {
  min-height: 100vh;
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl;
  text-align: center;
  background-color: $background-color;
}

.error-top-info {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: $spacing-md;
}

.error-logo-container {
  width: 25%;
}

.error-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

h1 {
  font-size: $font-size-xl;
  color: $text-primary;
  margin: $spacing-lg 0;
}

p {
  font-size: $font-size-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.game-button {
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-lg;
  font-weight: bold;
  border: 2px solid white;
  border-radius: $border-radius-md;
  background-color: $error-color;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: darken($error-color, 10%);
    transform: scale(1.05);
  }

  &.red {
    background-color: $error-color;
  }
}
</style>
