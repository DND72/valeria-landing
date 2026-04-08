
import sys
import json
import os
from datetime import datetime, timezone, timedelta
import swisseph as swe

# Imposta il percorso delle effemeridi (se1 files)
EPHE_PATH = os.path.join(os.path.dirname(__file__), 'ephe')
swe.set_ephe_path(EPHE_PATH)

# Forza l'output in UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def calculate_weekly_transits(natal_planets, start_date):
    """
    Scansiona i prossimi 7 giorni e trova i transiti significativi.
    """
    asps_found = []
    configs = [
        (0, "Congiunzione", 3),
        (180, "Opposizione", 3),
        (90, "Quadrato", 2.5),
        (120, "Trigono", 2.5)
    ]
    
    body_codes = [
        (swe.SUN, "Sole"), (swe.MOON, "Luna"), (swe.MERCURY, "Mercurio"),
        (swe.VENUS, "Venere"), (swe.MARS, "Marte"), (swe.JUPITER, "Giove")
    ]

    for day in range(7):
        current_dt = start_date + timedelta(days=day)
        jd = swe.julday(current_dt.year, current_dt.month, current_dt.day, 12.0) # Mezzogiorno
        
        # Calcoliamo posizioni attuali per questo giorno
        daily_planets = []
        for code, name in body_codes:
            res, _ = swe.calc_ut(jd, code)
            daily_planets.append({"nome": name, "lon": res[0]})
            
        # Troviamo aspetti con i natali
        for cp in daily_planets:
            for np in natal_planets:
                diff = abs(cp["lon"] - np["lon_assoluta"])
                if diff > 180: diff = 360 - diff
                
                for angle, name, orb in configs:
                    if abs(diff - angle) < 1.0: # Orb molto stretto per eventi giornalieri
                        asps_found.append({
                            "giorno": current_dt.strftime("%A %d %B"),
                            "transito": f"{cp['nome']} {name} al tuo {np['nome']} natale",
                            "tipo": name
                        })
                        
    return asps_found

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Dati natali mancanti."}))
        sys.exit(1)
        
    try:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            natal_data = json.load(f)
        
        natal_p = natal_data.get("pianeti", [])
        now = datetime.now(timezone.utc)
        
        results = calculate_weekly_transits(natal_p, now)
        print(json.dumps(results, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": f"Errore scansione settimanale: {str(e)}"}))
