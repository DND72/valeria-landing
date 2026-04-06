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
            if not jd_val or jd_val <= 0: return "--:--"
            y, m, d, h = swe.revjul(jd_val)
            hour, minute = int(h), int((h - int(h)) * 60)
            return f"{hour:02d}:{minute:02d}"

        def calc_body(name, code, cat, flags=swe.FLG_SWIEPH):
            pos, _ = swe.calc_ut(jd, code, flags)
            lon = pos[0]
            sign_idx = int(lon // 30)
            deg_in_sign = lon % 30
            return {
                "nome": name, "segno": zodiac_signs[sign_idx], "gradi": round(deg_in_sign, 2),
                "lon_assoluta": round(lon, 2), "categoria": cat
            }

        pianeti = []
        fast_list = [("Sole", swe.SUN, "veloce"), ("Luna", swe.MOON, "veloce"), ("Mercurio", swe.MERCURY, "veloce"), ("Venere", swe.VENUS, "veloce"), ("Marte", swe.MARS, "veloce")]
        slow_list = [("Giove", swe.JUPITER, "lento"), ("Saturno", swe.SATURN, "lento"), ("Urano", swe.URANUS, "lento"), ("Nettuno", swe.NEPTUNE, "lento"), ("Plutone", swe.PLUTO, "lento"), ("Chirone", swe.CHIRON, "lento")]
        
        for name, code, cat in (fast_list + slow_list):
            try: pianeti.append(calc_body(name, code, cat))
            except: pass

        # Asteroidi & Punti Speciali (già implementati)
        SE_AST_OFFSET = 10000 
        for name, swe_const, iau_num in [("Cerere", getattr(swe, 'CERES', None), 1), ("Pallade", getattr(swe, 'PALLAS', None), 2), ("Giunone", getattr(swe, 'JUNO', None), 3), ("Vesta", getattr(swe, 'VESTA', None), 4)]:
            for code in filter(None, [swe_const, SE_AST_OFFSET + iau_num]):
                try: 
                    pianeti.append(calc_body(name, code, "asteroide"))
                    break
                except: continue

        for name, code, cat in [("Lilith", swe.MEAN_APOG, "punto"), ("Nodo Nord", swe.MEAN_NODE, "punto")]:
            try: pianeti.append(calc_body(name, code, cat))
            except: pass

        # Nodo Sud
        nn = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nn:
            sl = (nn["lon_assoluta"] + 180) % 360
            pianeti.append({"nome": "Nodo Sud", "segno": zodiac_signs[int(sl//30)], "gradi": round(sl%30, 2), "lon_assoluta": round(sl, 2), "categoria": "punto"})

        # ─────────────────────────────────────────
        # CALCOLO FASE LUNARE
        # ─────────────────────────────────────────
        sun_pos, _ = swe.calc_ut(jd, swe.SUN)
        moon_pos, _ = swe.calc_ut(jd, swe.MOON)
        # Differenza di fase (0-360)
        phase_angle = (moon_pos[0] - sun_pos[0]) % 360
        
        # Percentuale di illuminazione (approssimata da angolo di fase)
        # 0 o 360 = Luna Nuova (0%), 180 = Luna Piena (100%)
        import math
        illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100

        # Nome Fase
        if phase_angle < 11.25 or phase_angle > 348.75: phase_name, moon_icon = "Luna Nuova", "🌑"
        elif phase_angle < 78.75:  phase_name, moon_icon = "Luna Crescente", "🌒"
        elif phase_angle < 101.25: phase_name, moon_icon = "Primo Quarto", "🌓"
        elif phase_angle < 168.75: phase_name, moon_icon = "Gibbosa Crescente", "🌔"
        elif phase_angle < 191.25: phase_name, moon_icon = "Luna Piena", "🌕"
        elif phase_angle < 258.75: phase_name, moon_icon = "Gibbosa Calante", "🌖"
        elif phase_angle < 281.25: phase_name, moon_icon = "Ultimo Quarto", "🌗"
        else: phase_name, moon_icon = "Luna Calante", "🌘"

        # ─────────────────────────────────────────
        # ECLISSI (Lookup + Calcolo già stabili)
        # ─────────────────────────────────────────
        VISIBILITY_LOOKUP = {
            "2026-02-17": "Antartide, Sud Oceano Indiano", "2026-08-12": "Groenlandia, Islanda, Spagna (Tot.), Nord America (parz.)",
            "2027-02-06": "Sud America, Africa Occidentale", "2027-08-02": "Gibilterra, Nord Africa, Arabia Saudita, Yemen",
            "2026-03-03": "Pacifico, Australia, Americhe, Est Asia", "2026-08-28": "Americhe (est), Europa, Africa, Medio Oriente",
            "2027-02-21": "Americhe, Europa, Africa, Asia Centrale", "2027-07-18": "Oceano Indiano, Africa, Australia", "2027-08-17": "Pacifico, Sud America, Oceania",
        }

        eclipses = []
        for jd_s, is_sol in [(jd, True), (jd, False)]:
            js = jd_s
            for _ in range(5):
                try:
                    if is_sol:
                        r = swe.sol_eclipse_when_glob(js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd+730: break
                        s, e = jd_to_gmt(tr[1]), jd_to_gmt(tr[4])
                        d = f"{int((tr[4]-tr[1])*1440)//60}h {int((tr[4]-tr[1])*1440)%60}m"
                        t = ("Totale", "🌑") if r[0] & swe.ECL_TOTAL else (("Anulare", "🔆") if r[0] & swe.ECL_ANNULAR else ("Parziale", "🌒"))
                        cat_type = "Solare"
                    else:
                        r = swe.lun_eclipse_when(js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd+730: break
                        ts, te = (tr[5] if tr[5]>0 else tr[1]), (tr[6] if tr[6]>0 else tr[2])
                        s, e = jd_to_gmt(ts), jd_to_gmt(te)
                        d = f"{int((te-ts)*1440)//60}h {int((te-ts)*1440)%60}m"
                        t = ("Totale", "🌕") if r[0] & swe.ECL_TOTAL else (("Penombrale", "🌔") if r[0] & swe.ECL_PENUMBRAL else ("Parziale", "🌓"))
                        cat_type = "Lunare"

                    dt = swe.revjul(jm)
                    dk = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                    eclipses.append({"tipo": cat_type, "sottotipo": t[0], "emoji": t[1], "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}", "gmt_inizio": s, "gmt_fine": e, "durata": d, "visibilità": VISIBILITY_LOOKUP.get(dk, "Visibilità globale/notturna"), "jd": round(jm,2)})
                    js = jm + 30
                except: break

        eclipses.sort(key=lambda x: x["jd"])
        for ex in eclipses: del ex["jd"]

        return {
            "timestamp": now.strftime("%Y-%m-%dT%H:%M:00Z"),
            "pianeti": pianeti,
            "eclissi": eclipses,
            "luna": {
                "fase": phase_name,
                "icona": moon_icon,
                "illuminazione": round(illumination, 1),
                "angolo": round(phase_angle, 2)
            }
        }
    except Exception as e: return {"error": str(e)}

if __name__ == "__main__":
    print(json.dumps(get_current_sky(), ensure_ascii=False))
