fromdos $1
echo "[ " $(cat $1 | grep '// Time' | sed 's#\(.\{24\}\)Time 00:\(.\{6\}\)...\(.\{7\}\)..\{9\}\(.*$\).*#{ Time: "\2", Note: "\3", Event: "\4"},#g' | sed 's/\(\w\+\)\:/\"\1\"\:/g') " {} ]" >/tmp/t.json
python -mjson.tool /tmp/t.json
