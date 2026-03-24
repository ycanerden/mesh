import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    define: {
        // gray-matter uses Buffer which isn't available in browser
        // We'll handle markdown parsing manually instead
    },
})
