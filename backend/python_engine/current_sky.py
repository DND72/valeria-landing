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

        # Pianeti veloci
        fast = [
            ("Sole",     swe.SUN,     "veloce"),
            ("Luna",     swe.MOON,    "veloce"),
            ("Mercurio", swe.MERCURY, "veloce"),
            ("Venere",   swe.VENUS,   "veloce"),
            ("Marte",    swe.MARS,    "veloce"),
        ]
        # Pianeti lenti + Chirone
        slow = [
            ("Giove",   swe.JUPITER, "lento"),
            ("Saturno", swe.SATURN,  "lento"),
            ("Urano",   swe.URANUS,  "lento"),
            ("Nettuno", swe.NEPTUNE, "lento"),
            ("Plutone", swe.PLUTO,   "lento"),
            ("Chirone", swe.CHIRON,  "lento"),
        ]

        pianeti = []
        for name, code, cat in (fast + slow):
            try:
                pianeti.append(calc_body(name, code, cat))
            except Exception:
                pass

        # Asteroidi con triplo fallback
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

        # Punti speciali
        for name, code, cat in [
            ("Lilith",    swe.MEAN_APOG, "punto"),
            ("Nodo Nord", swe.MEAN_NODE, "punto"),
        ]:
            try:
                pianeti.append(calc_body(name, code, cat))
            except Exception:
                pass

        # Nodo Sud
        nodo_nord = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nodo_nord:
            sud_lon = (nodo_nord["lon_assoluta"] + 180) % 360
            pianeti.append({
                "nome": "Nodo Sud",
                "segno": zodiac_signs[int(sud_lon // 30)],
                "gradi": round(sud_lon % 30, 2),
                "lon_assoluta": round(sud_lon, 2),
                "categoria": "punto"
            })

        # ─────────────────────────────────────────
        # MAPPATURA VISIBILITÀ ECLISSI (2026-2027)
        # ─────────────────────────────────────────
        # Inserita come lookup perché calcolare i nomi dei paesi solo da coordinate 
        # sub-eclittiche in Python puro senza DB geo è impreciso.
        VISIBILITY_LOOKUP = {
            "2026-02-17": "Antartide, Sud Oceano Indiano",
            "2026-08-12": "Groenlandia, Islanda, Spagna, Nord America (parz.)",
            "2027-02-06": "Sud America (Cile, Argentina), Africa (Costa d'Avorio)",
            "2027-08-02": "Gibilterra, Nord Africa (Egitto), Arabia Saudita",
            "2026-03-03": "Pacifico, Australia, America, Asia Orientale",
            "2026-08-28": "Europa, Africa, America, Medio Oriente",
            "2027-02-20": "Europa, Africa, America, Asia Centrale",
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
                jd_eclipse = tret[0]
                if jd_eclipse <= 0 or jd_eclipse > jd_end:
                    break
                etype = ret[0]
                if etype & swe.ECL_TOTAL:
                    tipo, emoji = "Totale", "🌑"
                elif etype & swe.ECL_ANNULAR:
                    tipo, emoji = "Anulare", "🔆"
                else:
                    tipo, emoji = "Parziale", "🌒"

                dt = swe.revjul(jd_eclipse)
                date_str = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                eclipses.append({
                    "tipo": "Solare",
                    "sottotipo": tipo,
                    "emoji": emoji,
                    "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}",
                    "visibilità": VISIBILITY_LOOKUP.get(date_str, "Visibilità varie (Check Online)"),
                    "jd": round(jd_eclipse, 2)
                })
                jd_search = jd_eclipse + 30 
            except Exception:
                break

        # Eclissi Lunari
        jd_search = jd_start
        while jd_search < jd_end:
            try:
                ret = swe.lun_eclipse_when(jd_search, swe.FLG_SWIEPH, 0, False)
                tret = ret[1]
                jd_eclipse = tret[0]
                if jd_eclipse <= 0 or jd_eclipse > jd_end:
                    break
                etype = ret[0]
                if etype & swe.ECL_TOTAL:
                    tipo, emoji = "Totale", "🌕"
                elif etype & swe.ECL_PENUMBRAL:
                    tipo, emoji = "Penombrale", "🌔"
                else:
                    tipo, emoji = "Parziale", "🌓"

                dt = swe.revjul(jd_eclipse)
                date_str = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                eclipses.append({
                    "tipo": "Lunare",
                    "sottotipo": tipo,
                    "emoji": emoji,
                    "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}",
                    "visibilità": VISIBILITY_LOOKUP.get(date_str, "Visibile dove è notte"),
                    "jd": round(jd_eclipse, 2)
                })
                jd_search = jd_eclipse + 30
            except Exception:
                break

        eclipses.sort(key=lambda e: e["jd"])
        for e in eclipses:
            del e["jd"]

        return {
            "timestamp": now.strftime("%Y-%m-%dT%H:%M:00Z"),
            "pianeti": pianeti,
            "eclissi": eclipses
        }
    except Exception as e:
        return {"error": str(e), "traceback": __import__('traceback').format_exc()}

if __name__ == "__main__":
    result = get_current_sky()
    print(json.dumps(result, ensure_ascii=False))
