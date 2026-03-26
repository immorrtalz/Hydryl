import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "vite-plugin-babel";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() =>
{
	return {
		define:
		{
			'import.meta.env.VITE_APP_BUILD_PROFILE': JSON.stringify(process.env.NODE_ENV)
		},

		plugins: [
			react({}),
			babel(
			{
				filter: /\.[jt]sx?$/,
				babelConfig:
				{
					presets: ["@babel/preset-typescript"],
					plugins: ["babel-plugin-react-compiler"],
				}
			})],

		build:
		{
			rolldownOptions:
			{
				output:
				{
					manualChunks(id: string) // Group npm packages into a 'vendor' chunk
					{
						if (id.includes('node_modules')) return 'vendor';
					}
				}
			}
		},

		// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
		//
		// 1. prevent vite from obscuring rust errors
		clearScreen: false,
		// 2. tauri expects a fixed port, fail if that port is not available

		server:
		{
			port: 1420,
			strictPort: true,
			host: true,
			hmr:
				{
					protocol: "ws",
					host,
					port: 1421,
				},
			watch:
			{
				// 3. tell vite to ignore watching `src-tauri`
				ignored: ["**/src-tauri/**"],
			},
		},
	};
});