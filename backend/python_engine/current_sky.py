import sys
import json
from datetime import datetime, timezone

def get_current_sky():
    """Calcola le posizioni planetarie per l'istante corrente (UTC). Non richiede luogo."""
    try:
        import swisseph as swe

        now = datetime.now(timezone.utc)
        jd = swe.julday(now.year, now.month, now.day,
                        now.hour + now.minute / 60.0 + now.second / 3600.0)

        zodiac_signs = [
            "Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine",
            "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci"
        ]

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

        pianeti = []
        for name, code in planets_map.items():
            pos, _ = swe.calc_ut(jd, code)
            lon = pos[0]
            sign_idx = int(lon // 30)
            deg_in_sign = lon % 30
            pianeti.append({
                "nome": name,
                "segno": zodiac_signs[sign_idx],
                "gradi": round(deg_in_sign, 2),
                "lon_assoluta": round(lon, 2)
            })

        return {
            "timestamp": now.strftime("%Y-%m-%dT%H:%M:00Z"),
            "pianeti": pianeti
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = get_current_sky()
    print(json.dumps(result))
