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

        def jd_to_gmt(jd_val):
            if not jd_val or jd_val <= 0:
                return "--:--"
            y, m, d, h = swe.revjul(jd_val)
            hour = int(h)
            minute = int((h - hour) * 60)
            return f"{hour:02d}:{minute:02d}"

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
            try:
                pianeti.append(calc_body(name, code, cat))
            except Exception:
                pass

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
                except Exception:
                    continue

        for name, code, cat in [("Lilith", swe.MEAN_APOG, "punto"), ("Nodo Nord", swe.MEAN_NODE, "punto")]:
            try:
                pianeti.append(calc_body(name, code, cat))
            except Exception:
                pass

        nn = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nn:
            sl = (nn["lon_assoluta"] + 180) % 360
            sn = zodiac_signs[int(sl // 30)]
            pianeti.append({"nome": "Nodo Sud", "segno": sn, "gradi": round(sl % 30, 2), "lon_assoluta": round(sl, 2), "categoria": "punto", "elemento": elements_map.get(sn, "")})

        # ── Fase Lunare Corrente ──────────────────────────
        moon_entry = next((p for p in pianeti if p["nome"] == "Luna"), None)
        sun_pos,  _ = swe.calc_ut(jd, swe.SUN)
        moon_pos, _ = swe.calc_ut(jd, swe.MOON)
        phase_angle  = (moon_pos[0] - sun_pos[0]) % 360
        illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100

        phase_table = [
            (11.25,  "Luna Nuova",         "🌑"),
            (78.75,  "Luna Crescente",     "🌒"),
            (101.25, "Primo Quarto",       "🌓"),
            (168.75, "Gibbosa Crescente",  "🌔"),
            (191.25, "Luna Piena",         "🌕"),
            (258.75, "Gibbosa Calante",    "🌖"),
            (281.25, "Ultimo Quarto",      "🌗"),
            (348.75, "Luna Calante",       "🌘"),
            (360.0,  "Luna Nuova",         "🌑"),
        ]
        phase_name, moon_icon = "Luna Nuova", "🌑"
        for limit, pname, picon in phase_table:
            if phase_angle < limit:
                phase_name, moon_icon = pname, picon
                break

        # ── Calendario Fasi Lunari del Mese ──────────────
        # Cerchiamo tutte le 4 fasi principali del mese corrente
        # usando swe.pheno_ut o semplicemente iterando con moontransit
        monthly_phases = []
        try:
            # Inizio del mese precedente (per catturare anche la Luna Nuova di inizio mese)
            start_of_month  = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
            next_month      = now.replace(day=28) + timedelta(days=4)
            end_of_month    = next_month.replace(day=1) - timedelta(seconds=1)
            jd_month_start  = swe.julday(start_of_month.year, start_of_month.month, start_of_month.day, 0.0)
            jd_month_end    = swe.julday(end_of_month.year, end_of_month.month, end_of_month.day, 23.99)

            # swe.moontransit / swe.phason: usiamo moon_node_when per le 4 fasi
            # Fase: 0=LN, 1=Primo Quarto, 2=LP, 3=Ultimo Quarto
            PHASE_CODES = [
                (0, "Luna Nuova",       "🌑"),
                (1, "Primo Quarto",     "🌓"),
                (2, "Luna Piena",       "🌕"),
                (3, "Ultimo Quarto",    "🌗"),
            ]

            # Cerca dalla fine del mese precedente per non perdere eventi
            jd_search = jd_month_start - 5
            found_jds = set()

            for phase_code, p_name, p_icon in PHASE_CODES:
                js = jd_search
                # Cerca 2 occorrenze per coprire il mese
                for _ in range(2):
                    try:
                        r = swe.moontransit(js, swe.MOON, swe.FLG_SWIEPH, phase_code)
                        jd_phase = r[1]
                        if jd_phase <= 0:
                            break
                        # Solo se è nel mese corrente
                        if jd_month_start <= jd_phase <= jd_month_end:
                            if round(jd_phase, 1) not in found_jds:
                                found_jds.add(round(jd_phase, 1))
                                dt  = swe.revjul(jd_phase)
                                day = int(dt[2])
                                h   = dt[3]
                                hr  = int(h)
                                mn  = int((h - hr) * 60)
                                # Calcola la posizione della Luna in quel momento
                                mp, _ = swe.calc_ut(jd_phase, swe.MOON)
                                m_sign  = zodiac_signs[int(mp[0] // 30)]
                                m_elem  = elements_map.get(m_sign, "")
                                monthly_phases.append({
                                    "fase":     p_name,
                                    "icona":    p_icon,
                                    "giorno":   day,
                                    "ora_gmt":  f"{hr:02d}:{mn:02d}",
                                    "segno":    m_sign,
                                    "elemento": m_elem,
                                    "jd":       round(jd_phase, 4)
                                })
                        js = jd_phase + 7.4
                    except Exception:
                        break
        except Exception:
            pass

        # Ordina per data e rimuovi chiave jd
        monthly_phases.sort(key=lambda x: x.get("jd", 0))
        for ph in monthly_phases:
            ph.pop("jd", None)

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
                        r   = swe.sol_eclipse_when_glob(js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd + 730:
                            break
                        s, e = jd_to_gmt(tr[1]), jd_to_gmt(tr[4])
                        dur  = f"{int((tr[4]-tr[1])*1440)//60}h {int((tr[4]-tr[1])*1440)%60}m"
                        t    = ("Totale", "🌑") if r[0] & swe.ECL_TOTAL else (("Anulare", "🔆") if r[0] & swe.ECL_ANNULAR else ("Parziale", "🌒"))
                        cat  = "Solare"
                    else:
                        r   = swe.lun_eclipse_when(js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd + 730:
                            break
                        ts, te = (tr[5] if tr[5] > 0 else tr[1]), (tr[6] if tr[6] > 0 else tr[2])
                        s, e = jd_to_gmt(ts), jd_to_gmt(te)
                        dur  = f"{int((te-ts)*1440)//60}h {int((te-ts)*1440)%60}m"
                        t    = ("Totale", "🌕") if r[0] & swe.ECL_TOTAL else (("Penombrale", "🌔") if r[0] & swe.ECL_PENUMBRAL else ("Parziale", "🌓"))
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
                except Exception:
                    break

        eclipses.sort(key=lambda x: x["jd"])
        for ex in eclipses:
            del ex["jd"]

        return {
            "timestamp": now.strftime("%Y-%m-%dT%H:%M:00Z"),
            "pianeti":   pianeti,
            "eclissi":   eclipses,
            "luna": {
                "fase":          phase_name,
                "icona":         moon_icon,
                "illuminazione": round(illumination, 1),
                "angolo":        round(phase_angle, 2),
                "segno":         moon_entry["segno"]   if moon_entry else "N/A",
                "elemento":      moon_entry["elemento"] if moon_entry else "N/A",
            },
            "fasi_mensili": monthly_phases
        }
    except Exception as e:
        return {"error": str(e), "traceback": __import__('traceback').format_exc()}

if __name__ == "__main__":
    print(json.dumps(get_current_sky(), ensure_ascii=False, indent=2))
