/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: ['class'],
    content: [ './app/**/*.{js,ts,jsx,tsx,mdx}',],
  theme: {
  	extend: {
  		colors: {
  			custom: {
  				darkgray: ' #110C6D',
  				darkblue: '#0E04E1',
  				dsds: '#110E40',
  				yellowlg: '#FAEA1C',
  				grayer: '#EEEEEE',
  				grayest: '#BEC0C7',
  				clairblue: '#95ACE1',
  				bluesuperclair: '#E4E8F0',
  				bluewhite: '#B4C0FA',
  				bluebackground: '#768BF6'
  			},
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
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)'
  			],
  			mono: [
  				'var(--font-roboto-mono)'
  			],
  			jers: [
  				'var(--font-jersey-10)'
  			]
  		},
  		screens: {
  			'custom-xl': '1150px',
  			mdnmin: '750px',
  			maxxl: {
  				max: '1150px'
  			},
  			mdn: {
  				max: '750px'
  			},
  			mpx: {
  				max: '450px'
  			}
  		},
  		keyframes: {
  			ltor: {
  				'0%': {
  					backgroundColor: 'red'
  				},
  				'25%': {
  					backgroundColor: 'yellow'
  				},
  				'75%': {
  					backgroundColor: 'blue'
  				},
  				'100%': {
  					backgroundColor: 'green'
  				}
  			},
  			ltorimage: {
  				'0%': {
  					backgroundImage: 'url("/images/240_F_203267618_5sJT4B5xyZzSmIsqSq2jImfLiL7TpjBk.jpg")'
  				},
  				'50%': {
  					backgroundImage: 'url("/images/240_F_112280116_28jgDJQv4zmJYHxI5ZDW7eZPTlRUvGRn.jpg")'
  				},
  				'100%': {
  					backgroundImage: 'url("/images/1000_F_329744547_jfN8tUkA33BxvJWrRNVea7VHdOr429Hb.jpg")'
  				}
  			},
  			ltoro: {
  				'0%': {
  					backgroundImage: 'url("/images/240_F_203267618_5sJT4B5xyZzSmIsqSq2jImfLiL7TpjBk.jpg")',
  					backgroundSize: 'cover',
  					opacity: 0.5
  				},
  				'50%': {
  					backgroundImage: 'url("/images/240_F_112280116_28jgDJQv4zmJYHxI5ZDW7eZPTlRUvGRn.jpg")',
  					backgroundSize: '110%',
  					opacity: 0.8
  				},
  				'100%': {
  					backgroundImage: 'url("/images/1000_F_329744547_jfN8tUkA33BxvJWrRNVea7VHdOr429Hb.jpg")',
  					backgroundSize: 'cover',
  					opacity: 1
  				}
  			}
  		},
  		animation: {
  			ltorwork: 'ltorimage 10s linear  infinite '
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
    plugins: [require("tailwindcss-animate")]
}

