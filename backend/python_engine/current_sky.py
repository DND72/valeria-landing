import sys
import json
import math
import os
from datetime import datetime, timezone, timedelta
import swisseph as swe

# Forza l'output in UTF-8 per evitare errori su Windows (emojis)
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Imposta il percorso delle effemeridi (se1 files)
EPHE_PATH = os.path.join(os.path.dirname(__file__), 'ephe')
swe.set_ephe_path(EPHE_PATH)

def get_sky_for_jd(jd):
    """Calcola le posizioni di tutti i corpi celesti per un dato Julian Day."""
    try:
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

        all_bodies = [
            (swe.SUN,     "Sole",      "veloce"),
            (swe.MOON,    "Luna",      "veloce"),
            (swe.MERCURY, "Mercurio",  "veloce"),
            (swe.VENUS,   "Venere",    "veloce"),
            (swe.MARS,    "Marte",     "veloce"),
            (swe.JUPITER, "Giove",     "lento"),
            (swe.SATURN,  "Saturno",   "lento"),
            (swe.URANUS,  "Urano",     "lento"),
            (swe.NEPTUNE, "Nettuno",   "lento"),
            (swe.PLUTO,   "Plutone",   "lento"),
            (swe.CHIRON,  "Chirone",   "lento"),
            (swe.CERES,   "Cerere",    "asteroide"),
            (swe.PALLAS,  "Pallade",   "asteroide"),
            (swe.JUNO,    "Giunone",   "asteroide"),
            (swe.VESTA,   "Vesta",     "asteroide"),
            (swe.MEAN_APOG, "Lilith",  "punto"),
            (swe.MEAN_NODE, "Nodo Nord", "punto"),
        ]

        pianeti = []
        for code, name, cat in all_bodies:
            try:
                flags = swe.FLG_SWIEPH | swe.FLG_SPEED
                res_calc = swe.calc_ut(jd, code, flags)
                p_lon = res_calc[0][0]
                sign_idx = int((p_lon % 360) // 30)
                sign_name = zodiac_signs[sign_idx]
                pianeti.append({
                    "nome": name, 
                    "segno": sign_name, 
                    "gradi": round(p_lon % 30, 2),
                    "lon_assoluta": round(p_lon, 2), 
                    "categoria": cat,
                    "elemento": elements_map.get(sign_name, "")
                })
            except:
                pass

        nn = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nn:
            sl = (nn["lon_assoluta"] + 180) % 360
            sn = zodiac_signs[int(sl // 30)]
            pianeti.append({
                "nome": "Nodo Sud", "segno": sn, "gradi": round(sl % 30, 2), 
                "lon_assoluta": round(sl, 2), "categoria": "punto", 
                "elemento": elements_map.get(sn, "")
            })

        y, m, d, h = swe.revjul(jd)
        return {
            "date": f"{int(y)}-{int(m):02d}-{int(d):02d}",
            "pianeti": pianeti
        }
    except:
        return None

def get_current_sky(days=1):
    """Calcola le posizioni per oggi, o per i prossimi N giorni se days > 1."""
    try:
        now = datetime.now(timezone.utc)
        jd_now = swe.julday(now.year, now.month, now.day,
                        now.hour + now.minute / 60.0 + now.second / 3600.0)

        if days > 1:
            results = []
            for i in range(days):
                jd_target = jd_now + i
                snap = get_sky_for_jd(jd_target)
                if snap: results.append(snap)
            return results

        # Comportamento standard per days=1 (più dettagliato)
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

        snapshot = get_sky_for_jd(jd_now)
        pianeti = snapshot["pianeti"]

        # 2. FASI LUNARI
        def moon_sun_angle(jd_t):
            sun,  _ = swe.calc_ut(jd_t, swe.SUN)
            moon, _ = swe.calc_ut(jd_t, swe.MOON)
            return (moon[0] - sun[0]) % 360.0

        phase_angle = moon_sun_angle(jd_now)
        illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100
        
        phase_table = [
            (11.25, "Luna Nuova", "🌑"), (78.75, "Luna Crescente", "🌒"), 
            (101.25, "Primo Quarto", "🌓"), (168.75, "Gibbosa Crescente", "🌔"), 
            (191.25, "Luna Piena", "🌕"), (258.75, "Gibbosa Calante", "🌖"), 
            (281.25, "Ultimo Quarto", "🌗"), (360.00, "Luna Calante", "🌘")
        ]
        phase_name, moon_icon = "Luna Nuova", "🌑"
        for limit, pname, picon in phase_table:
            if phase_angle < limit:
                phase_name, moon_icon = pname, picon
                break

        # 3. ASCENDENTE E MEDIO CIELO (Default Roma)
        lat_roma, lon_roma = 41.9028, 12.4964
        cusps, ascmc = swe.houses(jd_now, lat_roma, lon_roma, b'P')
        asc_tot = ascmc[0]
        mc_tot = ascmc[1]

        # 4. CALENDARIO FASI
        def find_phase_crossing(target_angle, jd_start, jd_end):
            step, results = 0.5, []
            t = jd_start
            while t < jd_end:
                d0 = (moon_sun_angle(t) - target_angle) % 360.0
                d1 = (moon_sun_angle(t + step) - target_angle) % 360.0
                if d0 > 350.0 and d1 < 10.0:
                    lo, hi = t, t + step
                    for _ in range(50):
                        mid = (lo + hi) / 2
                        dm = (moon_sun_angle(mid) - target_angle) % 360.0
                        if dm > 180.0: lo = mid
                        else: hi = mid
                    results.append((lo + hi) / 2)
                t += step
            return results

        monthly_phases = []
        try:
            monday_diff = now.weekday()
            monday_date = now.date() - timedelta(days=monday_diff)
            jd_start_cal = swe.julday(monday_date.year, monday_date.month, monday_date.day, 0)
            jd_end_cal = jd_start_cal + 32
            
            phase_targets = [(0.0, "Luna Nuova", "🌑"), (90.0, "Primo Quarto", "🌓"), (180.0, "Luna Piena", "🌕"), (270.0, "Ultimo Quarto", "🌗")]
            months_it = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
            days_it = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
            
            all_found = []
            for target, p_name, p_icon in phase_targets:
                crossings = find_phase_crossing(target, jd_start_cal, jd_end_cal)
                for jd_cross in crossings:
                    y, m, d, h = swe.revjul(jd_cross)
                    dt_obj = datetime(int(y), int(m), int(d), tzinfo=timezone.utc)
                    wd_name = days_it[dt_obj.weekday()]
                    mo_name = months_it[int(m)-1]
                    mp, _ = swe.calc_ut(jd_cross, swe.MOON)
                    msign = zodiac_signs[int(mp[0] // 30)]
                    all_found.append({
                        "fase": p_name, "icona": p_icon, "data_full": f"{wd_name} {int(d)} {mo_name}",
                        "ora_gmt": f"{int(h):02d}:{int((h-int(h))*60):02d}", "segno": msign, 
                        "elemento": elements_map.get(msign, ""), "is_passata": jd_cross < jd_now, "jd": jd_cross
                    })
            all_found.sort(key=lambda x: x["jd"])
            monthly_phases = all_found[:6]
        except: pass

        # 5. ECLISSI
        eclipses = []
        VISIBILITY_LOOKUP = {"2026-02-17": "Antartide", "2026-08-12": "Spagna, Islanda", "2027-02-06": "Sud America", "2027-08-02": "Nord Africa"}
        try:
            for js_start, is_sol in [(jd_now, True), (jd_now, False)]:
                temp_js = js_start
                for _ in range(3):
                    if is_sol:
                        r = swe.sol_eclipse_when_glob(temp_js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd_now + 730: break
                        t = ("Totale","🌑") if r[0] & swe.ECL_TOTAL else (("Parziale","🌒"))
                        cat = "Solare"
                        start_jd = tr[1]
                        end_jd = tr[2]
                    else:
                        r = swe.lun_eclipse_when(temp_js, swe.FLG_SWIEPH, 0, False)
                        jm, tr = r[1][0], r[1]
                        if jm <= 0 or jm > jd_now + 730: break
                        t = ("Totale","🌕") if r[0] & swe.ECL_TOTAL else (("Parziale","🌓"))
                        cat = "Lunare"
                        start_jd = tr[5] if tr[5] > 0 else tr[1]
                        end_jd = tr[6] if tr[6] > 0 else tr[4]

                    dt = swe.revjul(jm)
                    dk = f"{int(dt[0])}-{int(dt[1]):02d}-{int(dt[2]):02d}"
                    
                    def jd_to_gmt(jt):
                        if jt <= 0: return ""
                        y, m, d, h = swe.revjul(jt)
                        return f"{int(h):02d}:{int((h-int(h))*60):02d}"

                    gmt_start = jd_to_gmt(start_jd)
                    gmt_end = jd_to_gmt(end_jd)
                    
                    duration = ""
                    if start_jd > 0 and end_jd > 1000:
                        dur_m = int(round((end_jd - start_jd) * 24 * 60))
                        if dur_m > 0:
                            hp = dur_m // 60
                            mp = dur_m % 60
                            duration = f"{hp}h {mp}m" if hp > 0 else f"{mp}m"
                        else:
                            duration = "Pochi minuti"

                    eclipses.append({
                        "tipo": cat, "sottotipo": t[0], "emoji": t[1], 
                        "data": f"{int(dt[2]):02d}/{int(dt[1]):02d}/{int(dt[0])}", 
                        "visibilità": VISIBILITY_LOOKUP.get(dk, "Visibilità globale"), 
                        "gmt_inizio": gmt_start, "gmt_fine": gmt_end, "durata": duration, "jd": jm
                    })
                    temp_js = jm + 30
            eclipses.sort(key=lambda x: x["jd"])
        except: pass

        return {
            "timestamp": now.strftime("%Y-%m-%dT%H:%M:00Z"),
            "pianeti": pianeti,
            "eclissi": eclipses,
            "ascendente_totale": round(asc_tot, 2),
            "mc_totale": round(mc_tot, 2),
            "luna": { 
                "fase": phase_name, "icona": moon_icon, "illuminazione": round(illumination, 1), 
                "angolo": round(phase_angle, 2), "segno": next((p["segno"] for p in pianeti if p["nome"] == "Luna"), "N/A"),
                "elemento": next((p["elemento"] for p in pianeti if p["nome"] == "Luna"), "N/A")
            },
            "fasi_mensili": monthly_phases,
            "timeline_lunare": snapshot.get("timeline_lunare", [])
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        days_arg = 1
        if len(sys.argv) > 1:
            try: days_arg = int(sys.argv[1])
            except: pass
        print(json.dumps(get_current_sky(days_arg), ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({"error": f"Errore fatale: {str(e)}"}))
