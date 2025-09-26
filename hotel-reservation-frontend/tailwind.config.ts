// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // در اینجا می توانیم رنگ های سفارشی را برای Dynamic Theming اضافه کنیم (در گام 1.4)
      colors: {
        'primary-brand': 'var(--color-primary-brand)',
        'secondary-brand': 'var(--color-secondary-brand)',
      },
    },
  },
  // پلاگین های مورد نیاز برای RTL
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    // افزونه ای برای استفاده آسان تر از کلاس های منطقی در صورت نیاز به افزودن قابلیت های RTL
    // اگر از کلاس های منطقی (ms-*, me-*) استفاده کنید، نیازی به پلاگین rtl نیست.
  ],
}

export default config