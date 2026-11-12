/**
 * Env-dependent config layered on top of app.json.
 *
 * Maps: iOS uses Apple Maps (no key). Android uses Google Maps and needs
 * GOOGLE_MAPS_ANDROID_API_KEY (set it in EAS env vars / your shell before
 * `expo prebuild` or `expo run:android`). Without it the Android map is blank.
 */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ["react-native-maps", { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
  ],
});
