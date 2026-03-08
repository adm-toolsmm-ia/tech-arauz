import type { Config } from 'tailwindcss';
import tokens from './design/tokens.json';

/**
 * Design tokens extracted from DTCG (Design Token Community Group) format
 * Integrated directly into Tailwind configuration for centralized token management
 * Tokens include: colors (44), typography (17), spacing (8), borders (9), shadows (5)
 */

// Helper: Extract color values from DTCG tokens
const extractColors = () => {
	const colors: Record<string, any> = {};

	// Primary colors
	if (tokens.colors.primary) {
		colors.primary = {};
		Object.entries(tokens.colors.primary).forEach(([key, val]: any) => {
			colors.primary[key] = val.$value;
		});
	}

	// Secondary colors
	if (tokens.colors.secondary) {
		colors.secondary = {};
		Object.entries(tokens.colors.secondary).forEach(([key, val]: any) => {
			colors.secondary[key] = val.$value;
		});
	}

	// Semantic colors
	if (tokens.colors.semantic) {
		Object.entries(tokens.colors.semantic).forEach(([key, val]: any) => {
			colors[key] = val.$value;
		});
	}

	// Grayscale
	if (tokens.colors.grayscale) {
		colors.gray = {};
		Object.entries(tokens.colors.grayscale).forEach(([key, val]: any) => {
			colors.gray[key] = val.$value;
		});
	}

	return colors;
};

// Helper: Extract spacing values from DTCG tokens
const extractSpacing = () => {
	const spacing: Record<string, string> = {};

	if (tokens.spacing) {
		Object.entries(tokens.spacing).forEach(([key, val]: any) => {
			spacing[key] = val.$value;
		});
	}

	return spacing;
};

// Helper: Extract typography from DTCG tokens
const extractTypography = () => {
	const typography: Record<string, any> = {};

	// Font families
	if (tokens.typography.fontFamily) {
		Object.entries(tokens.typography.fontFamily).forEach(([key, val]: any) => {
			typography[`fontFamily${key.charAt(0).toUpperCase() + key.slice(1)}`] = val.$value;
		});
	}

	// Font sizes
	if (tokens.typography.fontSize) {
		typography.fontSize = {};
		Object.entries(tokens.typography.fontSize).forEach(([key, val]: any) => {
			typography.fontSize[key] = val.$value;
		});
	}

	return typography;
};

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
				...extractColors(),
				// Fallback to CSS variables if tokens unavailable
				background: 'var(--background, hsl(0 0% 100%))',
				foreground: 'var(--foreground, hsl(0 0% 0%))',
				card: {
					DEFAULT: 'var(--card, hsl(0 0% 100%))',
					foreground: 'var(--card-foreground, hsl(0 0% 0%))'
				},
				popover: {
					DEFAULT: 'var(--popover, hsl(0 0% 100%))',
					foreground: 'var(--popover-foreground, hsl(0 0% 0%))'
				},
				muted: {
					DEFAULT: 'var(--muted, hsl(0 0% 95%))',
					foreground: 'var(--muted-foreground, hsl(0 0% 40%))'
				},
				accent: {
					DEFAULT: 'var(--accent, hsl(210 100% 50%))',
					foreground: 'var(--accent-foreground, hsl(0 0% 100%))'
				},
				destructive: {
					DEFAULT: 'var(--destructive, hsl(0 84% 60%))',
					foreground: 'var(--destructive-foreground, hsl(0 0% 100%))'
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
			// Spacing from DTCG tokens (xs=4px through 3xl=48px)
			spacing: extractSpacing(),

			// Border radius from DTCG tokens
			borderRadius: {
				...(tokens.borders?.radius && Object.entries(tokens.borders.radius).reduce((acc: any, [k, v]: any) => {
					acc[k] = v.$value;
					return acc;
				}, {})),
				// Fallback values
				lg: 'var(--radius, 0.5rem)',
				md: 'calc(var(--radius, 0.5rem) - 2px)',
				sm: 'calc(var(--radius, 0.5rem) - 4px)'
			},

			// Font family from DTCG tokens
			fontFamily: {
				...(tokens.typography?.fontFamily && Object.entries(tokens.typography.fontFamily).reduce((acc: any, [k, v]: any) => {
					acc[k === 'body' ? 'sans' : k] = v.$value.split(',').map((f: string) => f.trim());
					return acc;
				}, {})),
				// Fallback
				sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
				display: ['var(--font-dm-sans)', 'var(--font-inter)', 'system-ui', 'sans-serif']
			},

			// Font sizes from DTCG tokens
			fontSize: {
				...(tokens.typography?.fontSize && Object.entries(tokens.typography.fontSize).reduce((acc: any, [k, v]: any) => {
					acc[k] = v.$value;
					return acc;
				}, {}))
			},

			// Line heights from DTCG tokens
			lineHeight: {
				...(tokens.typography?.lineHeight && Object.entries(tokens.typography.lineHeight).reduce((acc: any, [k, v]: any) => {
					acc[k] = v.$value;
					return acc;
				}, {}))
			},

			// Box shadows from DTCG tokens
			boxShadow: {
				...(tokens.shadows && Object.entries(tokens.shadows).reduce((acc: any, [k, v]: any) => {
					acc[k] = v.$value;
					return acc;
				}, {})),
				// Fallback design system shadows
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
