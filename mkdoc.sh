SRC="${1:?source}"
TGT="${2:?target}"
TIT="${3:?title}"
TGT="web/public/api/v1/web/nuvolaris/default/microbots/$TGT"
cat <<EOF >$TGT
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="utf-8" />
  <link rel="icon" type="image/x-icon" href="/api/v1/web/nuvolaris/default/microbots/favicon.ico">
  <link rel="stylesheet" href="/api/v1/web/nuvolaris/default/microbots/build/bundle.css" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
EOF
echo "<title>$TIT</title></head><body>" >>$TGT
cat <<EOF >>$TGT
<main class="wrapper">
  <section class="container">
    <div class="row">
      <div class="column column-center column-offset">
EOF
pandoc $SRC >>$TGT
echo '</div></div></section></main>'>>$TGT
echo '</body></html>'>>$TGT
