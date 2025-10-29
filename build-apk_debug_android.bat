if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
cd src-tauri && cargo sweep --stamp && npm run tauri android build -- --apk true --debug