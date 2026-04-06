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

        # Pianeti veloci
        fast = [
            ("Sole",     swe.SUN,     "veloce"),
            ("Luna",     swe.MOON,    "veloce"),
            ("Mercurio", swe.MERCURY, "veloce"),
            ("Venere",   swe.VENUS,   "veloce"),
            ("Marte",    swe.MARS,    "veloce"),
        ]
        # Pianeti lenti + Chirone (centauro)
        slow = [
            ("Giove",    swe.JUPITER, "lento"),
            ("Saturno",  swe.SATURN,  "lento"),
            ("Urano",    swe.URANUS,  "lento"),
            ("Nettuno",  swe.NEPTUNE, "lento"),
            ("Plutone",  swe.PLUTO,   "lento"),
            ("Chirone",  swe.CHIRON,  "lento"),
        ]
        # Asteroidi principali
        asteroids = [
            ("Cerere",   swe.CERES,   "asteroide"),
            ("Pallade",  swe.PALLAS,  "asteroide"),
            ("Giunone",  swe.JUNO,    "asteroide"),
            ("Vesta",    swe.VESTA,   "asteroide"),
        ]
        # Punti speciali
        specials = [
            ("Lilith",     swe.MEAN_APOG, "punto"),
            ("Nodo Nord",  swe.MEAN_NODE, "punto"),
        ]

        pianeti = []

        def calc_body(name, code, cat):
            pos, _ = swe.calc_ut(jd, code)
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

        for name, code, cat in (fast + slow + asteroids + specials):
            try:
                pianeti.append(calc_body(name, code, cat))
            except Exception:
                pass  # Se un corpo non è disponibile, lo saltiamo

        # Nodo Sud = Nodo Nord + 180°
        nodo_nord = next((p for p in pianeti if p["nome"] == "Nodo Nord"), None)
        if nodo_nord:
            sud_lon = (nodo_nord["lon_assoluta"] + 180) % 360
            sud_sign_idx = int(sud_lon // 30)
            pianeti.append({
                "nome": "Nodo Sud",
                "segno": zodiac_signs[sud_sign_idx],
                "gradi": round(sud_lon % 30, 2),
                "lon_assoluta": round(sud_lon, 2),
                "categoria": "punto"
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
