$f = "d:\GitHub\valeria-landing\src\pages\LiveSessionPage.tsx"
$l = Get-Content $f
$l[414..421] = "             {/* Auto-accettazione all'ingresso */}"
$l | Set-Content $f
