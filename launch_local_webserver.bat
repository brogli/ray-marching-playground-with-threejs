START "webserver" python -m http.server 8001
START "firefox" "C:\Program Files\Mozilla Firefox\firefox.exe" -new-tab localhost:8001
