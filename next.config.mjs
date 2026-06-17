// Build the Velite content layer before Next compiles.
// Turbopack-compatible hook (the legacy VeliteWebpackPlugin does not run under Turbopack,
// which is the default bundler in Next 16). Runs once per process tree via the env guard.
const isDev = process.argv.includes("dev");
const isBuild = process.argv.includes("build");
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = "1";
  const { build } = await import("velite");
  await build({ watch: isDev, clean: !isDev });
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
