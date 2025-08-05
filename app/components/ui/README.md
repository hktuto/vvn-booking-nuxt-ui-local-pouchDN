# UI Components

## UiPageContainer

A standardized page container component that provides consistent padding across all pages with the ability to override it.

### Props

- `padding` (optional): Padding variant to use
  - `'none'`: No padding (`p-0`)
  - `'small'`: Small padding (`px-6 py-2`)
  - `'default'`: Default padding (`p-6`) - **default value**
  - `'large'`: Large padding (`p-8`)
  - `'custom'`: Custom padding classes (requires `customPadding` prop)

- `customPadding` (optional): Custom padding classes (only used when `padding` is `'custom'`)

### Usage

#### Basic Usage (Default Padding)
```vue
<template>
  <NuxtLayout name="default">
    <template #header>
      <!-- Header content -->
    </template>
    
    <UiPageContainer>
      <!-- Page content -->
    </UiPageContainer>
  </NuxtLayout>
</template>
```

#### Small Padding (for pages with tabs/menus)
```vue
<template>
  <NuxtLayout name="default">
    <template #header>
      <!-- Header content -->
    </template>
    
    <UiPageContainer padding="small">
      <MenuClass />
      <ClassTabContent />
    </UiPageContainer>
  </NuxtLayout>
</template>
```

#### Custom Padding
```vue
<template>
  <UiPageContainer padding="custom" custom-padding="px-8 py-4">
    <!-- Page content with custom padding -->
  </UiPageContainer>
</template>
```

#### No Padding
```vue
<template>
  <UiPageContainer padding="none">
    <!-- Page content without padding -->
  </UiPageContainer>
</template>
```

### Benefits

1. **Consistency**: All pages now use standardized padding
2. **Maintainability**: Easy to change padding across all pages from one place
3. **Flexibility**: Can override padding when needed
4. **Type Safety**: TypeScript support with proper prop types
5. **Accessibility**: Proper class binding and attribute forwarding

### Migration

All existing pages have been migrated to use `UiPageContainer`:

- **Default padding (`p-6`)**: Dashboard, Students, Packages, Transactions, Student Detail
- **Small padding (`px-6 py-2`)**: Classes, Bookings, Locations (pages with tabs/menus)
- **Custom spacing**: Student Detail page uses `class="space-y-6"` with default padding