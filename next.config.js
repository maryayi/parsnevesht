module.exports = {
  output: "export",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },
  images: {
    unoptimized: true,
  },
}
