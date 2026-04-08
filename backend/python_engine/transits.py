
import sys
import json
import os
import swisseph as swe

# Imposta il percorso delle effemeridi (se1 files)
EPHE_PATH = os.path.join(os.path.dirname(__file__), 'ephe')
swe.set_ephe_path(EPHE_PATH)

def calculate_transits(natal_planets, current_planets):
    """
    Compara i pianeti natali con i pianeti attuali per trovare gli aspetti (transiti).
    """
    transits = []
    
    # Configurazioni aspetti per i transiti: (angolo, nome, orbita_stretta)
    # Per i transiti si usa un'orbita più stretta (max 2-3 gradi) per precisione quotidiana
    configs = [
        (0, "Congiunzione", 3),
        (180, "Opposizione", 3),
        (120, "Trigono", 2.5),
        (90, "Quadrato", 2.5),
        (60, "Sestile", 2)
    ]
    
    for cp in current_planets:
        for np in natal_planets:
            # Calcoliamo la differenza angolare
            diff = abs(cp["lon_assoluta"] - np["lon_assoluta"])
            if diff > 180: diff = 360 - diff
            
            for angle, name, orb in configs:
                if abs(diff - angle) <= orb:
                    transits.append({
                        "pianeta_attuale": cp["nome"],
                        "pianeta_natale": np["nome"],
                        "tipo": name,
                        "orbita": round(abs(diff - angle), 2),
                        "intensita": round(100 * (1 - abs(diff - angle)/orb), 1) # Percentuale di forza del transito
                    })
                    
    return transits

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Dati natali o attuali mancanti."}))
        sys.exit(1)
        
    try:
        natal_data = json.loads(sys.argv[1])
        current_data = json.loads(sys.argv[2])
        
        # Estraiamo le liste pianeti
        natal_p = natal_data.get("pianeti", [])
        current_p = current_data.get("pianeti", [])
        
        results = calculate_transits(natal_p, current_p)
        print(json.dumps(results, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
