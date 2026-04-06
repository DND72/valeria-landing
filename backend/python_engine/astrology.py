import sys
import json
import math
from datetime import datetime
import pytz
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder

def get_ascendant(birth_date_str, birth_time_str, city_name):
    try:
        # 1. GEOCODING: Otteniamo coordinate e fuso orario
        geolocator = Nominatim(user_agent="nonsolotarocchi_app")
        location = geolocator.geocode(city_name)
        if not location:
            return {"error": "Città non trovata"}
        
        lat, lon = location.latitude, location.longitude
        
        # 2. TIMEZONE: Gestione automatica ora legale (DST)
        tf = TimezoneFinder()
        tz_name = tf.timezone_at(lng=lon, lat=lat)
        if not tz_name:
            return {"error": "Fuso orario non trovato per la località specificata"}
            
        local_tz = pytz.timezone(tz_name)
        
        # Parsing della data e ora
        naive_dt = datetime.strptime(f"{birth_date_str} {birth_time_str}", "%Y-%m-%d %H:%M")
        local_dt = local_tz.localize(naive_dt)
        utc_dt = local_dt.astimezone(pytz.utc)
        
        # 3. CALCOLO TEMPO SIDERALE (LST)
        # Calcolo del Julian Day
        jd = 367 * utc_dt.year - int(7 * (utc_dt.year + int((utc_dt.month + 9) / 12)) / 4) + \
             int(275 * utc_dt.month / 9) + utc_dt.day + 1721013.5 + \
             (utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600) / 24
        
        T = (jd - 2451545.0) / 36525.0
        # Greenwich Mean Sidereal Time (GMST)
        gmst = (280.46061837 + 360.00770053608 * (jd - 2451545.0) + \
                0.000387933 * T**2 - T**3 / 38710000) % 360
        
        # Local Sidereal Time (LST)
        lst = (gmst + lon) % 360
        
        # 4. FORMULA TRIGONOMETRICA DELL'ASCENDENTE
        LST_rad = math.radians(lst)
        lat_rad = math.radians(lat)
        eps_rad = math.radians(23.439) # Obliquità dell'eclittica media
        
        # Usiamo atan2(y, x) per il calcolo corretto del quadrante (0-360°)
        y = math.cos(LST_rad)
        x = -(math.sin(LST_rad) * math.cos(eps_rad) + math.tan(lat_rad) * math.sin(eps_rad))
        
        asc_rad = math.atan2(y, x)
        asc_deg = math.degrees(asc_rad) % 360
        
        # 5. MAPPATURA SEGNI ZODIACALI
        zodiac_signs = [
            "Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine",
            "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci"
        ]
        
        sign_index = min(11, int((asc_deg % 360) // 30))
        sign_name = zodiac_signs[sign_index]
        deg_in_sign = asc_deg % 30
        
        # 6. CALCOLO EFFEMERIDI CON SWISSEPH
        import swisseph as swe
        
        swe_jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                            utc_dt.hour + utc_dt.minute/60.0 + utc_dt.second/3600.0)

        def calc_body(code, name, cat):
            pos, _ = swe.calc_ut(swe_jd, code)
            lon = pos[0]
            s_idx = min(11, int((lon % 360) // 30))
            return {
                "nome": name,
                "segno": zodiac_signs[s_idx],
                "gradi": round(lon % 30, 2),
                "lon_assoluta": round(lon, 2),
                "categoria": cat
            }

        all_bodies = [
            # Veloci
            (swe.SUN,     "Sole",      "veloce"),
            (swe.MOON,    "Luna",      "veloce"),
            (swe.MERCURY, "Mercurio",  "veloce"),
            (swe.VENUS,   "Venere",    "veloce"),
            (swe.MARS,    "Marte",     "veloce"),
            # Lenti + Chirone
            (swe.JUPITER, "Giove",     "lento"),
            (swe.SATURN,  "Saturno",   "lento"),
            (swe.URANUS,  "Urano",     "lento"),
            (swe.NEPTUNE, "Nettuno",   "lento"),
            (swe.PLUTO,   "Plutone",   "lento"),
            (swe.CHIRON,  "Chirone",   "lento"),
            # Asteroidi
            (swe.CERES,   "Cerere",    "asteroide"),
            (swe.PALLAS,  "Pallade",   "asteroide"),
            (swe.JUNO,    "Giunone",   "asteroide"),
            (swe.VESTA,   "Vesta",     "asteroide"),
            # Punti speciali
            (swe.MEAN_APOG, "Lilith",  "punto"),
            (swe.MEAN_NODE, "Nodo Nord", "punto"),
        ]

        pianeti_calcolati = []
        for code, name, cat in all_bodies:
            try:
                pianeti_calcolati.append(calc_body(code, name, cat))
            except Exception:
                pass

        # Nodo Sud = Nodo Nord + 180°
        nodo_nord = next((p for p in pianeti_calcolati if p["nome"] == "Nodo Nord"), None)
        if nodo_nord:
            sud_lon = (nodo_nord["lon_assoluta"] + 180) % 360
            pianeti_calcolati.append({
                "nome": "Nodo Sud", "segno": zodiac_signs[int(sud_lon // 30)],
                "gradi": round(sud_lon % 30, 2), "lon_assoluta": round(sud_lon, 2),
                "categoria": "punto"
            })

        case_calcolate = []
        try:
            cusps, ascmc = swe.houses(swe_jd, lat, lon, b'P')
            for i in range(1, 13):
                if i < len(cusps):
                    h_lon = cusps[i]
                    case_calcolate.append({
                        "numero": i,
                        "segno": zodiac_signs[min(11, int((h_lon % 360) // 30))],
                        "gradi": round(h_lon % 30, 2),
                        "lon_assoluta": round(h_lon, 2)
                    })
            
            # MC e Vertex (Punti ascmc)
            mc_totale = round(ascmc[1], 2) if len(ascmc) > 1 else 0
            vertex_lon = ascmc[3] if len(ascmc) > 3 else 0
        except Exception:
            cusps, ascmc = [], []
            mc_totale, vertex_lon = 0, 0
        vertex_sign = zodiac_signs[min(11, int((vertex_lon % 360) // 30))]
        
        # Parte della Fortuna = (Asc + Luna - Sole) mod 360
        sole_lon   = next((p["lon_assoluta"] for p in pianeti_calcolati if p["nome"] == "Sole"), 0)
        luna_lon   = next((p["lon_assoluta"] for p in pianeti_calcolati if p["nome"] == "Luna"), 0)
        pof_lon    = (asc_deg + luna_lon - sole_lon) % 360
        pof_sign   = zodiac_signs[min(11, int((pof_lon % 360) // 30))]

        pianeti_calcolati += [
            {"nome": "Vertex", "segno": vertex_sign, "gradi": round(vertex_lon % 30, 2),
             "lon_assoluta": round(vertex_lon, 2), "categoria": "punto"},
            {"nome": "Parte della Fortuna", "segno": pof_sign, "gradi": round(pof_lon % 30, 2),
             "lon_assoluta": round(pof_lon, 2), "categoria": "punto"},
        ]

        return {
            "citta": city_name,
            "coordinate": (lat, lon),
            "fuso_orario": tz_name,
            "ora_utc": utc_dt.strftime("%Y-%m-%d %H:%M UTC"),
            "ascendente_totale": round(asc_deg, 2),
            "mc_totale": mc_totale,
            "segno": sign_name,
            "grado_nel_segno": round(deg_in_sign, 2),
            "pianeti": pianeti_calcolati,
            "case": case_calcolate
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Parametri mancanti. Uso: python astrology.py 'YYYY-MM-DD' 'HH:MM' 'Città'"}))
        sys.exit(1)
        
    date_str = sys.argv[1]
    time_str = sys.argv[2]
    city = sys.argv[3]
    
    result = get_ascendant(date_str, time_str, city)
    print(json.dumps(result))

