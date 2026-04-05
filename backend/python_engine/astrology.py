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
        
        sign_index = int(asc_deg // 30)
        sign_name = zodiac_signs[sign_index]
        deg_in_sign = asc_deg % 30
        
        # 6. CALCOLO EFFEMERIDI CON SWISSEPH
        import swisseph as swe
        
        # Swisseph lavora perfettamente in UTC
        swe_jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour + utc_dt.minute/60.0 + utc_dt.second/3600.0)
        
        planets_map = {
            "Sole": swe.SUN,
            "Luna": swe.MOON,
            "Mercurio": swe.MERCURY,
            "Venere": swe.VENUS,
            "Marte": swe.MARS,
            "Giove": swe.JUPITER,
            "Saturno": swe.SATURN,
            "Urano": swe.URANUS,
            "Nettuno": swe.NEPTUNE,
            "Plutone": swe.PLUTO
        }
        
        pianeti_calcolati = []
        for p_name, p_code in planets_map.items():
            pos, ret_flag = swe.calc_ut(swe_jd, p_code)
            p_lon = pos[0]
            p_sign_index = int(p_lon // 30)
            p_deg_in_sign = p_lon % 30
            pianeti_calcolati.append({
                "nome": p_name,
                "segno": zodiac_signs[p_sign_index],
                "gradi": round(p_deg_in_sign, 2)
            })
            
        # 7. CALCOLO CASE ASTROLOGICHE (Sistema Placidus)
        # houses_ex restituisce (cusps, ascmc)
        cusps, ascmc = swe.houses(swe_jd, lat, lon, b'P')
        
        case_calcolate = []
        # Le cuspidi sono nell'array `cusps`. L'indice va in genere da 1 a 12 (0 è vuoto/non usato o usato per offset).
        for i in range(1, 13):
            h_lon = cusps[i]
            h_sign_idx = int(h_lon // 30)
            h_deg_in_sign = h_lon % 30
            case_calcolate.append({
                "numero": i,
                "segno": zodiac_signs[h_sign_idx],
                "gradi": round(h_deg_in_sign, 2)
            })
        
        return {
            "citta": city_name,
            "coordinate": (lat, lon),
            "fuso_orario": tz_name,
            "ora_utc": utc_dt.strftime("%Y-%m-%d %H:%M UTC"),
            "ascendente_totale": round(asc_deg, 2),
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

