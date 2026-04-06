import sys
import json
import math
from datetime import datetime, timezone, timedelta

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
        elements_map = {
            "Ariete": "Fuoco", "Leone": "Fuoco", "Sagittario": "Fuoco",
            "Toro": "Terra", "Vergine": "Terra", "Capricorno": "Terra",
            "Gemelli": "Aria", "Bilancia": "Aria", "Acquario": "Aria",
            "Cancro": "Acqua", "Scorpione": "Acqua", "Pesci": "Acqua"
        }

        def moon_sun_angle(jd_t):
            """Calcola la differenza d'elongazione Luna-Sole (0-360)."""
            sun,  _ = swe.calc_ut(jd_t, swe.SUN)
            moon, _ = swe.calc_ut(jd_t, swe.MOON)
            return (moon[0] - sun[0]) % 360.0

        def find_phase_crossing(target_angle, jd_start, jd_end):
            """
            Trova con bisection il momento in cui l'elongazione Luna-Sole ≡ target_angle.
            - step 0.5 gg (12h): la Luna avanza ~6° per step, mai più di 90° → nessun crossing mancato
            - bisection 50 iterazioni → precisione < 1 secondo
            """
            step    = 0.5   # 12 ore (sicuro: Luna percorre ~6°, molto < 90°)
            results = []
            t = jd_start
            while t < jd_end:
                d0 = (moon_sun_angle(t)        - target_angle) % 360.0
                d1 = (moon_sun_angle(t + step) - target_angle) % 360.0
                # Crossing rilevato: d0 vicino a 360 (appena prima) e d1 vicino a 0 (appena dopo)
                if d0 > 350.0 and d1 < 10.0:
                    lo, hi = t, t + step
                    for _ in range(50):
                        mid = (lo + hi) / 2
                        dm  = (moon_sun_angle(mid) - target_angle) % 360.0
                        # dm > 180 → siamo PRIMA del target → avanza (lo = mid)
                        # dm < 180 → siamo DOPO  il target → torna  (hi = mid)
                        if dm > 180.0:
                            lo = mid
                        else:
                            hi = mid
                    results.append((lo + hi) / 2)
                t += step
            return results

        def jd_to_gmt(jd_val):
            if not jd_val or jd_val <= 0: return "--:--"
            _, _, _, h = swe.revjul(jd_val)
            return f"{int(h):02d}:{int((h - int(h)) * 60):02d}"

        def calc_body(name, code, cat, flags=swe.FLG_SWIEPH):
            pos, _ = swe.calc_ut(jd, code, flags)
            lon = pos[0]
            sign_name = zodiac_signs[int(lon // 30)]
            return {
                "nome": name, "segno": sign_name, "gradi": round(lon % 30, 2),
                "lon_assoluta": round(lon, 2), "categoria": cat,
                "elemento": elements_map.get(sign_name, "")
            }

        # ── Corpi Celesti ────────────────────────────────
        pianeti = []
        for name, code, cat in [
            ("Sole",     swe.SUN,     "veloce"), ("Luna",    swe.MOON,    "veloce"),
            ("Mercurio", swe.MERCURY, "veloce"), ("Venere",  swe.VENUS,   "veloce"),
            ("Marte",    swe.MARS,    "veloce"), ("Giove",   swe.JUPITER, "lento"),
            ("Saturno",  swe.SATURN,  "lento"),  ("Urano",   swe.URANUS,  "lento"),
            ("Nettuno",  swe.NEPTUNE, "lento"),  ("Plutone", swe.PLUTO,   "lento"),
            ("Chirone",  swe.CHIRON,  "lento"),
        ]:
            try: pianeti.append(calc_body(name, code, cat))
            except: pass

        # Asteroidi
        SE_AST_OFFSET = 10000
        for name, swe_const, iau_num in [
            ("Cerere",  getattr(swe, 'CERES',  None), 1),
            ("Pallade", getattr(swe, 'PALLAS', None), 2),
            ("Giunone", getattr(swe, 'JUNO',   None), 3),
            ("Vesta",   getattr(swe, 'VESTA',  None), 4),
        ]:
            for code in filter(None, [swe_const, SE_AST_OFFSET + iau_num]):
                try:
                    pianeti.append(calc_body(name, code, "asteroide"))
                    break
                except: continue

        for name, code, cat in [("Lilith", swe.MEAN_APOG, "punto"), ("Nodo Nord", swe.MEAN_NODE, "punto")]:
            try: pianeti.append(calc_body(name, code, cat))
            except: pass

        nn = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nn:
            sl = (nn["lon_assoluta"] + 180) % 360
            sn = zodiac_signs[int(sl // 30)]
            pianeti.append({"nome": "Nodo Sud", "segno": sn, "gradi": round(sl%30,2),
                            "lon_assoluta": round(sl,2), "categoria": "punto",
                            "elemento": elements_map.get(sn, "")})

        # ── Fase Lunare Corrente ──────────────────────────
        moon_entry  = next((p for p in pianeti if p["nome"] == "Luna"), None)
        phase_angle = moon_sun_angle(jd)
        illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100

        phase_table = [
            (11.25,  "Luna Nuova",        "🌑"),
            (78.75,  "Luna Crescente",    "🌒"),
            (101.25, "Primo Quarto",      "🌓"),
            (168.75, "Gibbosa Crescente", "🌔"),
            (191.25, "Luna Piena",        "🌕"),
            (258.75, "Gibbosa Calante",   "🌖"),
            (281.25, "Ultimo Quarto",     "🌗"),
            (360.0,  "Luna Calante",      "🌘"),
        ]
        phase_name, moon_icon = "Luna Nuova", "🌑"
        for limit, pname, picon in phase_table:
            if phase_angle < limit:
                phase_name, moon_icon = pname, picon
                break

        # ── Calendario Fasi Mensili con Bisection ────────
        monthly_phases = []
        try:
            # Finestra: da 3 gg prima del mese a 3 gg dopo la fine
            first_day = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
            if now.month == 12:
                last_day = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
            else:
                last_day = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)

            jd_start = swe.julday(first_day.year, first_day.month, first_day.day, 0) - 3
            jd_end   = swe.julday(last_day.year,  last_day.month,  last_day.day,  0) + 3

            phase_targets = [
                (0.0,   "Luna Nuova",    "🌑"),
                (90.0,  "Primo Quarto",  "🌓"),
                (180.0, "Luna Piena",    "🌕"),
                (270.0, "Ultimo Quarto", "🌗"),
            ]

            jd_month_start = jd_start + 3  # data esatta del 1° del mese
            jd_month_end   = jd_end   - 3  # data esatta del last_day

            all_found = []
            for target, p_name, p_icon in phase_targets:
                crossings = find_phase_crossing(target, jd_start, jd_end)
                for jd_cross in crossings:
                    # Solo nel mese corrente
                    if jd_month_start <= jd_cross <= jd_month_end:
                        yr, mo, dy, h = swe.revjul(jd_cross)
                        hr, mn = int(h), int((h - int(h)) * 60)
                        # Posizione Luna in quel momento
                        mp, _ = swe.calc_ut(jd_cross, swe.MOON)
                        m_sign = zodiac_signs[int(mp[0] // 30)]
                        all_found.append({
                            "fase": p_name, "icona": p_icon,
                            "giorno": int(dy), "ora_gmt": f"{hr:02d}:{mn:02d}",
                            "segno": m_sign, "elemento": elements_map.get(m_sign, ""),
                            "jd": jd_cross
                        })

            all_found.sort(key=lambda x: x["jd"])
            for pf in all_found:
                del pf["jd"]
            monthly_phases = all_found

        except Exception as e:
            monthly_phases = [{"error": str(e)}]

        # ── Eclissi ───────────────────────────────────────
        VISIBILITY_LOOKUP = {
            "2026-02-17": "Antartide, Sud Oceano Indiano",
            "2026-08-12": "Groenlandia, Islanda, Spagna, Nord America",
            "2027-02-06": "Sud America, Africa",
            "2027-08-02": "Gibilterra, Nord Africa, Arabia Saudita",
            "2026-03-03": "Pacifico, Australia, Americhe",
            "2026-08-28": "Europa, Africa, America",
            "2027-02-21": "Americhe, Europa, Africa",
            "2027-07-18": "Oceano Indiano, Africa",
            "2027-08-17": "Pacifico, Sud America",
        }

        eclipses = []
        for jd_s, is_sol in [(jd, True), (jd, False)]:
            js = jd_s
            for _ in range(5):
                try:
                    if is_sol:
                        r  = swe.sol_eclipse_when_glob(js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd + 730: break
                        s, e = jd_to_gmt(tr[1]), jd_to_gmt(tr[4])
                        dur  = f"{int((tr[4]-tr[1])*1440)//60}h {int((tr[4]-tr[1])*1440)%60}m"
                        t    = ("Totale","🌑") if r[0] & swe.ECL_TOTAL else (("Anulare","🔆") if r[0] & swe.ECL_ANNULAR else ("Parziale","🌒"))
                        cat  = "Solare"
                    else:
                        r  = swe.lun_eclipse_when(js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd + 730: break
                        ts, te = (tr[5] if tr[5]>0 else tr[1]), (tr[6] if tr[6]>0 else tr[2])
                        s, e = jd_to_gmt(ts), jd_to_gmt(te)
                        dur  = f"{int((te-ts)*1440)//60}h {int((te-ts)*1440)%60}m"
                        t    = ("Totale","🌕") if r[0] & swe.ECL_TOTAL else (("Penombrale","🌔") if r[0] & swe.ECL_PENUMBRAL else ("Parziale","🌓"))
                        cat  = "Lunare"

                    dt  = swe.revjul(jm)
                    dk  = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                    eclipses.append({
                        "tipo": cat, "sottotipo": t[0], "emoji": t[1],
                        "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}",
                        "gmt_inizio": s, "gmt_fine": e, "durata": dur,
                        "visibilità": VISIBILITY_LOOKUP.get(dk, "Visibilità globale"),
                        "jd": round(jm, 2)
                    })
                    js = jm + 30
                except: break

        eclipses.sort(key=lambda x: x["jd"])
        for ex in eclipses: del ex["jd"]

        return {
            "timestamp":     now.strftime("%Y-%m-%dT%H:%M:00Z"),
            "pianeti":       pianeti,
            "eclissi":       eclipses,
            "luna": {
                "fase":          phase_name,
                "icona":         moon_icon,
                "illuminazione": round(illumination, 1),
                "angolo":        round(phase_angle, 2),
                "segno":         moon_entry["segno"]    if moon_entry else "N/A",
                "elemento":      moon_entry["elemento"] if moon_entry else "N/A",
            },
            "fasi_mensili": monthly_phases
        }
    except Exception as e:
        return {"error": str(e), "traceback": __import__('traceback').format_exc()}

if __name__ == "__main__":
    print(json.dumps(get_current_sky(), ensure_ascii=False, indent=2))
