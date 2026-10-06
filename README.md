# FMKorea Splash Patches

Morphe patch source for the FMKorea Android app (`com.fmkorea.m.fmk`).

The **Remove FMKorea splash logo** patch replaces FMKorea's startup `splash.png` resources with a transparent PNG, while leaving the normal launcher icon unchanged.

The patch is intentionally future-friendly: it scans every `res/drawable*` directory for `splash.png` at patch time and also declares a future-version app target. If FMKorea changes the splash resource name or implementation, the patch fails instead of silently modifying an unrelated file.

## Build

```bash
./gradlew buildAndroid
```

The generated `.mpp` bundle is written under `patches/build/libs/`.

## License

GPLv3. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
