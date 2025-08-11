<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Welcome to VVN Booking
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              About VVN Booking
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              VVN Booking is a comprehensive student management system designed for teachers and fitness studios. 
              It helps you manage students, packages, classes, and bookings with local-first storage.
            </p>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>• Student management and tracking</li>
              <li>• Package and credit system</li>
              <li>• Class scheduling and booking</li>
              <li>• Transaction history</li>
              <li>• Location management</li>
            </ul>
          </div>
          
          <div class="flex space-x-4">
            <NuxtLink 
              to="/login" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center text-sm transition-colors"
            >
              Login
            </NuxtLink>
            <NuxtLink 
              to="/register" 
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md text-center text-sm transition-colors"
            >
              Register
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a public page - no authentication required
// PouchDB will not be initialized when visiting this page

definePageMeta({
  auth: false // This tells the auth middleware to skip authentication
})
</script> 