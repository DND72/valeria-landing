import sys
import json
import os
from datetime import datetime
import pytz
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import swisseph as swe

# Forza l'output in UTF-8 per evitare errori su Windows (emojis)
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Imposta il percorso delle effemeridi (se1 files)
EPHE_PATH = os.path.join(os.path.dirname(__file__), 'ephe')
swe.set_ephe_path(EPHE_PATH)

def get_astrology_data(birth_date_str, birth_time_str, city_name):
    try:
        # 1. GEOCODING
        geolocator = Nominatim(user_agent="nonsolotarocchi_app")
        location = geolocator.geocode(city_name)
        if not location:
            return {"error": "Città non trovata"}
        
        geo_lat, geo_lon = location.latitude, location.longitude
        
        # 2. TIMEZONE & UTC
        tf = TimezoneFinder()
        tz_name = tf.timezone_at(lng=geo_lon, lat=geo_lat)
        if not tz_name:
            return {"error": "Fuso orario non trovato"}
            
        local_tz = pytz.timezone(tz_name)
        naive_dt = datetime.strptime(f"{birth_date_str} {birth_time_str}", "%Y-%m-%d %H:%M")
        local_dt = local_tz.localize(naive_dt)
        utc_dt = local_dt.astimezone(pytz.utc)
        
        # 3. SWISSEPH SETUP
        swe_jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                            utc_dt.hour + utc_dt.minute/60.0 + utc_dt.second/3600.0)

        # 4. CALCOLO CASE (Placidus)
        # Note: pyswisseph returns a 12-element tuple for cusps (0-indexed)
        # and an 8-10 element tuple for ascmc.
        cusps, ascmc = swe.houses(swe_jd, geo_lat, geo_lon, b'P')
        
        asc_deg = ascmc[0]
        mc_deg = ascmc[1]
        vertex_deg = ascmc[3]
        
        zodiac_signs = [
            "Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine",
            "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci"
        ]

        def get_sign_info(lon_abs):
            s_idx = int((lon_abs % 360) // 30)
            return zodiac_signs[s_idx], round(lon_abs % 30, 2)

        def get_house(lon_abs):
            if not cusps or len(cusps) < 12: return None
            # cusps[0] is House 1, cusps[11] is House 12
            for i in range(12):
                c1 = cusps[i]
                c2 = cusps[i+1] if i < 11 else cusps[0]
                if c1 < c2:
                    if c1 <= lon_abs < c2: return i + 1
                else: # Passaggio per 0°
                    if lon_abs >= c1 or lon_abs < c2: return i + 1
            return 1

        # 5. CALCOLO PIANETI
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

        pianeti_calcolati = []
        for code, name, cat in all_bodies:
            try:
                # Use SWIEPH flags for high precision
                flags = swe.FLG_SWIEPH | swe.FLG_SPEED
                res = swe.calc_ut(swe_jd, code, flags)
                pos = res[0]
                lon = pos[0]
                sign_name, deg_in_sign = get_sign_info(lon)
                pianeti_calcolati.append({
                    "nome": name,
                    "segno": sign_name,
                    "gradi": deg_in_sign,
                    "lon_assoluta": round(lon, 2),
                    "casa": get_house(lon % 360),
                    "categoria": cat
                })
            except Exception:
                # Skip bodies that fail (e.g. missing ephemeris files)
                pass

        # Nodo Sud
        nn = next((p for p in pianeti_calcolati if p["nome"] == "Nodo Nord"), None)
        if nn:
            sud_lon = (nn["lon_assoluta"] + 180) % 360
            sign_name, deg_in_sign = get_sign_info(sud_lon)
            pianeti_calcolati.append({
                "nome": "Nodo Sud", "segno": sign_name, "gradi": deg_in_sign,
                "lon_assoluta": round(sud_lon, 2), "casa": get_house(sud_lon), "categoria": "punto"
            })

        # Vertex & Fortuna
        # Parte della Fortuna = (Asc + Luna - Sole) mod 360
        sole_lon = next((p["lon_assoluta"] for p in pianeti_calcolati if p["nome"] == "Sole"), 0)
        luna_lon = next((p["lon_assoluta"] for p in pianeti_calcolati if p["nome"] == "Luna"), 0)
        pof_lon = (asc_deg + luna_lon - sole_lon) % 360
        
        v_sign, v_deg = get_sign_info(vertex_deg)
        pof_sign, pof_deg = get_sign_info(pof_lon)

        pianeti_calcolati += [
            {"nome": "Vertex", "segno": v_sign, "gradi": v_deg, "lon_assoluta": round(vertex_deg, 2), 
             "casa": get_house(vertex_deg), "categoria": "punto"},
            {"nome": "Parte della Fortuna", "segno": pof_sign, "gradi": pof_deg, "lon_assoluta": round(pof_lon, 2), 
             "casa": get_house(pof_lon), "categoria": "punto"},
        ]

        # Formattazione Case
        case_list = []
        for i in range(12):
            c_lon = cusps[i]
            c_sign, c_deg = get_sign_info(c_lon)
            case_list.append({
                "numero": i + 1,
                "segno": c_sign,
                "gradi": c_deg,
                "lon_assoluta": round(c_lon, 2)
            })

        asc_sign, asc_deg_sign = get_sign_info(asc_deg)

        # 6. CALCOLO ASPETTI (Novità per Analisi 4000 parole)
        def get_aspects(pianeti):
            aspect_list = []
            # Definiamo i pianeti "maggiori" per evitare rumore (Sole fino a Plutone + Nodi)
            targets = [p for p in pianeti if p["categoria"] in ["veloce", "lento"] or "Nodo" in p["nome"]]
            
            # Configurazioni aspetti: (angolo, nome, orbita)
            configs = [
                (0, "Congiunzione", 8),
                (180, "Opposizione", 8),
                (120, "Trigono", 8),
                (90, "Quadrato", 7),
                (60, "Sestile", 5)
            ]
            
            for i in range(len(targets)):
                for j in range(i + 1, len(targets)):
                    p1 = targets[i]
                    p2 = targets[j]
                    
                    diff = abs(p1["lon_assoluta"] - p2["lon_assoluta"])
                    if diff > 180: diff = 360 - diff
                    
                    for angle, name, orb in configs:
                        if abs(diff - angle) <= orb:
                            aspect_list.append({
                                "p1": p1["nome"],
                                "p2": p2["nome"],
                                "tipo": name,
                                "orbita": round(abs(diff - angle), 2)
                            })
            return aspect_list

        aspects_calcolati = get_aspects(pianeti_calcolati)

        return {
            "citta": city_name,
            "coordinate": [geo_lat, geo_lon],
            "fuso_orario": tz_name,
            "ora_utc": utc_dt.strftime("%Y-%m-%d %H:%M UTC"),
            "ascendente_totale": round(asc_deg, 2),
            "mc_totale": round(mc_deg, 2),
            "segno": asc_sign,
            "grado_nel_segno": round(asc_deg_sign, 2),
            "pianeti": pianeti_calcolati,
            "case": case_list,
            "aspetti": aspects_calcolati
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Parametri mancanti."}))
        sys.exit(1)
    
    res = get_astrology_data(sys.argv[1], sys.argv[2], sys.argv[3])
    print(json.dumps(res))
