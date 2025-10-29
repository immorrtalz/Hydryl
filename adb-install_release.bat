if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
cd src-tauri/gen/android/app/build/outputs/apk/universal/release && adb install app-universal-release.apk