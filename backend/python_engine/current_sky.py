import sys
import json
from datetime import datetime, timezone

def get_current_sky():
    """Calcola le posizioni di tutti i corpi celesti per l'istante corrente (UTC)."""
    try:
        import swisseph as swe

        now = datetime.now(timezone.utc)
        jd = swe.julday(now.year, now.month, now.day,
                        now.hour + now.minute / 60.0 + now.second / 3600.0)

        zodiac_signs = [
            "Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine",
            "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci"
        ]

        def jd_to_gmt(jd_val):
            """Converte Julian Day in HH:mm GMT."""
            if not jd_val or jd_val <= 0: return "--:--"
            y, m, d, h = swe.revjul(jd_val)
            hour = int(h)
            minute = int((h - hour) * 60)
            return f"{hour:02d}:{minute:02d}"

        def calc_body(name, code, cat, flags=swe.FLG_SWIEPH):
            """Calcola posizione di un corpo celeste con gestione errori."""
            pos, _ = swe.calc_ut(jd, code, flags)
            lon = pos[0]
            sign_idx = int(lon // 30)
            deg_in_sign = lon % 30
            return {
                "nome": name,
                "segno": zodiac_signs[sign_idx],
                "gradi": round(deg_in_sign, 2),
                "lon_assoluta": round(lon, 2),
                "categoria": cat
            }

        pianeti = []
        # Pianeti (già stabili)
        fast = [("Sole", swe.SUN, "veloce"), ("Luna", swe.MOON, "veloce"), ("Mercurio", swe.MERCURY, "veloce"), ("Venere", swe.VENUS, "veloce"), ("Marte", swe.MARS, "veloce")]
        slow = [("Giove", swe.JUPITER, "lento"), ("Saturno", swe.SATURN, "lento"), ("Urano", swe.URANUS, "lento"), ("Nettuno", swe.NEPTUNE, "lento"), ("Plutone", swe.PLUTO, "lento"), ("Chirone", swe.CHIRON, "lento")]
        
        for name, code, cat in (fast + slow):
            try: pianeti.append(calc_body(name, code, cat))
            except: pass

        # Asteroidi
        SE_AST_OFFSET = 10000 
        for name, swe_const, iau_num in [("Cerere", getattr(swe, 'CERES', None), 1), ("Pallade", getattr(swe, 'PALLAS', None), 2), ("Giunone", getattr(swe, 'JUNO', None), 3), ("Vesta", getattr(swe, 'VESTA', None), 4)]:
            for code in filter(None, [swe_const, SE_AST_OFFSET + iau_num]):
                try:
                    pianeti.append(calc_body(name, code, "asteroide"))
                    break
                except: continue

        # Punti speciali
        for name, code, cat in [("Lilith", swe.MEAN_APOG, "punto"), ("Nodo Nord", swe.MEAN_NODE, "punto")]:
            try: pianeti.append(calc_body(name, code, cat))
            except: pass

        nodo_nord = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nodo_nord:
            sud_lon = (nodo_nord["lon_assoluta"] + 180) % 360
            pianeti.append({"nome": "Nodo Sud", "segno": zodiac_signs[int(sud_lon // 30)], "gradi": round(sud_lon % 30, 2), "lon_assoluta": round(sud_lon, 2), "categoria": "punto"})

        # VISIBILITY LOOKUP
        VISIBILITY_LOOKUP = {
            "2026-02-17": "Antartide, Sud Oceano Indiano",
            "2026-08-12": "Groenlandia, Islanda, Spagna (Tot.), Nord America (parz.)",
            "2027-02-06": "Sud America (Cile, Argentina), Africa (Costa d'Avorio, Nigeria)",
            "2027-08-02": "Gibilterra, Nord Africa (Egitto, Libia), Arabia Saudita, Yemen",
            "2026-03-03": "Pacifico, Australia, Nord/Sud America, Est Asia",
            "2026-08-28": "Americhe (est), Europa, Africa, Medio Oriente",
            "2027-02-21": "Americhe, Europa, Africa, Asia Centrale",
            "2027-07-18": "Oceano Indiano, Africa, Australia",
            "2027-08-17": "Pacifico, Sud America, Oceania",
        }

        eclipses = []
        jd_start = jd
        jd_end   = jd + 730  

        # Eclissi Solari
        jd_search = jd_start
        while jd_search < jd_end:
            try:
                ret = swe.sol_eclipse_when_glob(jd_search, swe.FLG_SWIEPH, 0, False)
                tret = ret[1]       
                jd_max = tret[0]
                if jd_max <= 0 or jd_max > jd_end: break
                
                start_gmt = jd_to_gmt(tret[1]) # Primo contatto
                end_gmt   = jd_to_gmt(tret[4])   # Ultimo contatto
                duration_h = (tret[4] - tret[1]) * 24
                dur_m = int(round(duration_h * 60))
                dur_str = f"{dur_m // 60}h {dur_m % 60}m"

                etype = ret[0]
                tipo, emoji = ("Totale", "🌑") if etype & swe.ECL_TOTAL else (("Anulare", "🔆") if etype & swe.ECL_ANNULAR else ("Parziale", "🌒"))

                dt = swe.revjul(jd_max)
                date_key = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                eclipses.append({
                    "tipo": "Solare", "sottotipo": tipo, "emoji": emoji,
                    "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}",
                    "gmt_inizio": start_gmt, "gmt_fine": end_gmt, "durata": dur_str,
                    "visibilità": VISIBILITY_LOOKUP.get(date_key, "Visibilità varie (Check Online)"),
                    "jd": round(jd_max, 2)
                })
                jd_search = jd_max + 30 
            except: break

        # Eclissi Lunari
        jd_search = jd_start
        while jd_search < jd_end:
            try:
                ret = swe.lun_eclipse_when(jd_search, swe.FLG_SWIEPH, 0, False)
                tret = ret[1]
                jd_max = tret[0]
                if jd_max <= 0 or jd_max > jd_end: break
                
                # Per le lunari, cerchiamo inizio penombra (5) o inizio parzialità (1)
                t_start = tret[5] if tret[5] > 0 else tret[1]
                t_end = tret[6] if tret[6] > 0 else tret[2]
                
                start_gmt = jd_to_gmt(t_start)
                end_gmt   = jd_to_gmt(t_end)
                duration_h = (t_end - t_start) * 24
                dur_m = int(round(duration_h * 60))
                dur_str = f"{dur_m // 60}h {dur_m % 60}m"

                etype = ret[0]
                tipo, emoji = ("Totale", "🌕") if etype & swe.ECL_TOTAL else (("Penombrale", "🌔") if etype & swe.ECL_PENUMBRAL else ("Parziale", "🌓"))

                dt = swe.revjul(jd_max)
                date_key = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                eclipses.append({
                    "tipo": "Lunare", "sottotipo": tipo, "emoji": emoji,
                    "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}",
                    "gmt_inizio": start_gmt, "gmt_fine": end_gmt, "durata": dur_str,
                    "visibilità": VISIBILITY_LOOKUP.get(date_key, "Visibile dove è notte"),
                    "jd": round(jd_max, 2)
                })
                jd_search = jd_max + 30
            except: break

        eclipses.sort(key=lambda e: e["jd"])
        for e in eclipses: del e["jd"]

        return {"timestamp": now.strftime("%Y-%m-%dT%H:%M:00Z"), "pianeti": pianeti, "eclissi": eclipses}
    except Exception as e: return {"error": str(e), "traceback": __import__('traceback').format_exc()}

if __name__ == "__main__":
    result = get_current_sky()
    print(json.dumps(result, ensure_ascii=False))
