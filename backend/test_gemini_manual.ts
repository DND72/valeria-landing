import * as dotenv from 'dotenv';
import path from 'path';
import { generateChartInterpretation } from './src/lib/gemini.js';

dotenv.config();

const chartData = {
  "citta": "Napoli",
  "coordinate": [40.8358846, 14.2487679],
  "fuso_orario": "Europe/Rome",
  "ora_utc": "1972-01-08 05:40 UTC",
  "ascendente_totale": 273.84,
  "mc_totale": 208.14,
  "segno": "Capricorno",
  "grado_nel_segno": 3.84,
  "pianeti": [
    { "nome": "Sole", "segno": "Capricorno", "gradi": 17.04, "lon_assoluta": 287.04, "casa": 1 },
    { "nome": "Luna", "segno": "Bilancia", "gradi": 13.49, "lon_assoluta": 193.49, "casa": 9 },
    { "nome": "Mercurio", "segno": "Sagittario", "gradi": 25.38, "lon_assoluta": 265.38, "casa": 12 },
    { "nome": "Venere", "segno": "Acquario", "gradi": 19.71, "lon_assoluta": 319.71, "casa": 2 },
    { "nome": "Marte", "segno": "Ariete", "gradi": 8.07, "lon_assoluta": 8.07, "casa": 3 },
    { "nome": "Giove", "segno": "Sagittario", "gradi": 23.94, "lon_assoluta": 263.94, "casa": 12 },
    { "nome": "Saturno", "segno": "Gemelli", "gradi": 0.08, "lon_assoluta": 60.08, "casa": 5 },
    { "nome": "Urano", "segno": "Bilancia", "gradi": 18.22, "lon_assoluta": 198.22, "casa": 9 },
    { "nome": "Nettuno", "segno": "Sagittario", "gradi": 4.32, "lon_assoluta": 244.32, "casa": 11 },
    { "nome": "Plutone", "segno": "Bilancia", "gradi": 2.05, "lon_assoluta": 182.05, "casa": 9 }
  ]
};

async function testInterpret() {
  console.log("--- TEST INTERPRETAZIONE MANUALE (Valeria - AstriOnLine Style) ---");
  try {
    const interpretation = await generateChartInterpretation(chartData, 'advanced');
    console.log("\n--- RISULTATO ---\n");
    console.log(interpretation);
  } catch (err) {
    console.error("ERRORE:", err);
  }
}

testInterpret();
