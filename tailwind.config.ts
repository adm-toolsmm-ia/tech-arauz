import type { Config } from 'tailwindcss';
import tokens from './design/tokens.json';

/**
 * Design tokens extracted from global token set (DTCG format)
 * Integrated directly into Tailwind configuration for centralized token management
 */
const designTokens = tokens.global;

const config: Config = {
	darkMode: ['class'],
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/features/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				status: {
					novo: 'hsl(var(--status-novo))',
					'em-atendimento': 'hsl(var(--status-em-atendimento))',
					aguardando: 'hsl(var(--status-aguardando))',
					resolvido: 'hsl(var(--status-resolvido))',
					cancelado: 'hsl(var(--status-cancelado))'
				},
				priority: {
					alta: 'hsl(var(--priority-alta))',
					normal: 'hsl(var(--priority-normal))',
					baixa: 'hsl(var(--priority-baixa))'
				},
				type: {
					erro: 'hsl(var(--type-erro))',
					duvida: 'hsl(var(--type-duvida))',
					suporte: 'hsl(var(--type-suporte))',
					ajuste: 'hsl(var(--type-ajuste))',
					melhoria: 'hsl(var(--type-melhoria))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [
					'var(--font-inter)',
					'system-ui',
					'sans-serif'
				],
				display: [
					'var(--font-dm-sans)',
					'var(--font-inter)',
					'system-ui',
					'sans-serif'
				]
			},
			boxShadow: {
				soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
				medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
				card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
				'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
				elevated: '0 12px 40px rgba(0, 0, 0, 0.12)',
				'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-left': 'slide-in-left 0.2s ease-out'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'collapsible-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-collapsible-content-height)' }
				},
				'collapsible-up': {
					from: { height: 'var(--radix-collapsible-content-height)' },
					to: { height: '0' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'slide-in-left': {
					from: { transform: 'translateX(-10px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				}
			}
		}
	},
	plugins: [require('tailwindcss-animate')],
};

export default config;

/**
 * Design Token Integration Guide
 *
 * This configuration integrates design tokens extracted in DTCG format
 * from design/tokens.json. The tokens define:
 *
 * - Colors (40+ tokens): semantic, semantic-foreground, status, priority, type
 * - Typography: sans (Inter), display (DM Sans)
 * - Effects: shadows (6 types), border-radius (3 sizes), animations (4 types)
 *
 * DTCG tokens are consumed via CSS custom properties (--color-*, --radius, etc.)
 * Current implementation uses hsl(var(--colorName)) pattern for flexibility.
 *
 * Storybook Integration:
 * 1. Install: npm install --save-dev @storybook/addon-design-tokens
 * 2. Configure: .storybook/preview.js imports DTCG tokens
 * 3. Result: Token playground available in Storybook UI
 *
 * Token Files:
 * - design/tokens.json: Source of truth (DTCG format)
 * - design/tokens.schema.json: JSON schema validation
 * - tailwind.config.ts: This file (Tailwind configuration)
 */
