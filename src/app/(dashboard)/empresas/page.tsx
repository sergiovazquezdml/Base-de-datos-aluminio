"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { useLanguage } from "@/lib/i18n-context";
import { statusColors, statusLabels, formatCurrency, formatPercent } from "@/lib/utils";
import { useAuth, useRole } from "@/lib/auth-context";
import {
  Building2, Search, Plus, ChevronRight,
  MapPin, Factory, MoreHorizontal, Download, Upload, X, Info, AlertTriangle, CheckCircle2
} from "lucide-react";
import type { CompanyType } from "@/lib/types";

const TYPE_FILTERS: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Clientes Activos", value: "cliente_activo" },
  { label: "Prospectos", value: "prospecto" },
  { label: "Ex-clientes", value: "ex_cliente" },
];

export default function EmpresasPage() {
  const { empresas, plantas, addEmpresa, updateEmpresa, addPlanta, updatePlanta, clearDatabase, usuarios } = useStore();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"table" | "cards">("table");
  const { user } = useAuth();
  const role = useRole();
  const isSpecialAdmin = user?.email?.toLowerCase() === "sergio.vazquez@interlub.com" || role === "direccion";

  // CSV Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState<{
    successCount: number;
    errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- CSV IMPORTER HELPERS ---
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const headers = ["nombre_comercial", "razon_social", "pais", "ciudad_estado", "tipo_cuenta", "hubspot_id", "consultor"];
    const rows = [
      ["Aluminios del Pacífico", "Aluminios del Pacífico SA de CV", "México", "Mazatlán, Sinaloa", "cliente_activo", "", "Roberto Jiménez"],
      ["EuroAlu Systems Ltd", "", "España", "Madrid", "prospecto", "982172", "María López"]
    ];
    downloadCSV("plantilla_importacion_empresas.csv", headers, rows);
  };

  const detectCountry = (phone: string, city: string, companyName: string): string => {
    const normCity = city.toLowerCase().trim();
    const normName = companyName.toLowerCase().trim();

    // 1. Unambiguous Phone Prefix Check (Starts with + or normalized 00 -> +)
    const phoneParts = phone.split(/[\/,;]|\b(?:o|y|or|whatsapp|ext\.?)\b/i)
      .map(p => p.replace(/[^+\d]/g, '').trim().replace(/^00/, '+'))
      .filter(p => p.length > 0);

    for (const p of phoneParts) {
      if (p.startsWith("+")) {
        if (p.startsWith("+52")) return "México";
        if (p.startsWith("+61")) return "Australia";
        if (p.startsWith("+34")) return "España";
        if (p.startsWith("+49")) return "Alemania";
        if (p.startsWith("+39")) return "Italia";
        if (p.startsWith("+971")) return "UAE";
        if (p.startsWith("+91")) return "India";
        if (p.startsWith("+60")) return "Malasia";
        if (p.startsWith("+82")) return "Corea del Sur";
        if (p.startsWith("+86")) return "China";
        if (p.startsWith("+852")) return "China";
        if (p.startsWith("+57")) return "Colombia";
        if (p.startsWith("+593")) return "Ecuador";
        if (p.startsWith("+58")) return "Venezuela";
        if (p.startsWith("+886")) return "Taiwán";
        if (p.startsWith("+32")) return "Bélgica";
        if (p.startsWith("+31")) return "Países Bajos";
        if (p.startsWith("+33")) return "Francia";
        if (p.startsWith("+47")) return "Noruega";
        if (p.startsWith("+974")) return "Qatar";
        if (p.startsWith("+966")) return "Arabia Saudita";
        if (p.startsWith("+968")) return "Omán";
        if (p.startsWith("+965")) return "Kuwait";
        if (p.startsWith("+973")) return "Bahrein";
        if (p.startsWith("+998")) return "Uzbekistán";
        if (p.startsWith("+387")) return "Bosnia y Herzegovina";
        if (p.startsWith("+421")) return "Eslovaquia";
        if (p.startsWith("+43")) return "Austria";
        if (p.startsWith("+30")) return "Grecia";
        if (p.startsWith("+420")) return "República Checa";
        if (p.startsWith("+40")) return "Rumania";
        if (p.startsWith("+54")) return "Argentina";
        if (p.startsWith("+359")) return "Bulgaria";
        if (p.startsWith("+351")) return "Portugal";
        if (p.startsWith("+503")) return "El Salvador";
        if (p.startsWith("+502")) return "Guatemala";
        if (p.startsWith("+504")) return "Honduras";
        if (p.startsWith("+506")) return "Costa Rica";
        if (p.startsWith("+595")) return "Paraguay";
        if (p.startsWith("+598")) return "Uruguay";
        if (p.startsWith("+90")) return "Turquía";
        if (p.startsWith("+46")) return "Suecia";
        if (p.startsWith("+355")) return "Albania";
        if (p.startsWith("+62")) return "Indonesia";
        if (p.startsWith("+27")) return "Sudáfrica";
        if (p.startsWith("+254")) {
          if (normName.includes("south africa") || normCity.includes("gqeberha") || normCity.includes("johannesburg") || normCity.includes("cape town") || normCity.includes("east london")) {
            return "Sudáfrica";
          }
          return "Kenia";
        }
        if (p.startsWith("+1")) {
          if (normCity.includes("cambridge") || p.startsWith("+1519") || normName.includes("canada") || normCity.includes("surrey") || p.startsWith("+1604")) return "Canadá";
          return "Estados Unidos";
        }
      }
    }

    // 2. Check by City & Name (middle priority)
    if (normCity.includes("dubai") || normCity.includes("abu dhabi")) return "UAE";
    if (normCity.includes("vadodara")) return "India";
    if (normCity.includes("melbourne") || normCity.includes("melboure") || normCity.includes("sydney") || normCity.includes("laverton") || normCity.includes("brisbane") || normCity.includes("gnangara") || normCity.includes("truganina") || normCity.includes("currumbin") || normCity.includes("central coast")) return "Australia";
    if (normCity.includes("ambato")) return "Ecuador";
    if (normCity.includes("buttrio") || normCity.includes("brescia") || normCity.includes("pisticci")) return "Italia";
    if (normCity.includes("padrón") || normCity.includes("valencia") || normCity.includes("albacete") || normCity.includes("alicante") || (normCity.includes("madrid") && !phoneParts.some(p => p.startsWith("+57") || p.startsWith("57")))) return "España";
    if (normCity.includes("funza")) return "Colombia";
    if (normCity.includes("mostar")) return "Bosnia y Herzegovina";
    if (normCity.includes("bratislava")) return "Eslovaquia";
    if (normCity.includes("athens") || normCity.includes("larisa") || normCity.includes("periochi")) return "Grecia";
    if (normCity.includes("oradea") || normCity.includes("lumina") || normCity.includes("slatina") || normCity.includes("timișoara") || normCity.includes("timisoara")) return "Rumania";
    if (normCity.includes("buenos aires")) return "Argentina";
    if (normCity.includes("shumen")) return "Bulgaria";
    if (normCity.includes("braga")) return "Portugal";
    if (normCity.includes("san salvador")) return "El Salvador";
    if (normCity.includes("guatemala")) return "Guatemala";
    if (normCity.includes("curva")) return "Honduras";
    if (normCity.includes("santo domingo")) return "Costa Rica";
    if (normCity.includes("montevideo")) return "Uruguay";
    if (normCity.includes("eyup") || normCity.includes("uskudar") || normCity.includes("diyarbakir") || normCity.includes("selcuklu") || normCity.includes("istanbul") || normCity.includes("kocaeli")) return "Turquía";
    if (normCity.includes("telfs")) return "Austria";
    if (normCity.includes("tiranë") || normCity.includes("tirana")) return "Albania";
    if (normCity.includes("seda")) return "Suecia";
    if (normCity.includes("surrey") || normCity.includes("cambridge") || normName.includes("canada")) return "Canadá";

    const usCities = [
      "charlotte", "union", "wylie", "portage", "fond du lac", "fondu du lac", "fort scott", 
      "fonda", "gwinn", "houston", "waxahachie", "bristol", "trenton", "sanford", "cressona", 
      "ohio", "michigan", "florida", "texas", "california", "atlanta", "chicago", "new york",
      "carrollton", "powder springs", "spanish fork", "pittsburgh", "phoenix", "tifton",
      "smyrna", "elkhart", "orrville", "north jackson", "san diego", "millen", "gardena"
    ];
    if (usCities.some(uc => normCity.includes(uc))) return "Estados Unidos";

    if (normCity.includes("cape town") || normCity.includes("johannesburg") || normCity.includes("gqeberha") || normCity.includes("east london")) return "Sudáfrica";
    if (normCity.includes("nairobi") || normCity.includes("thika") || normCity.includes("juja") || normCity.includes("lehurutshe")) return "Kenia";
    if (normCity.includes("chungli") || normCity.includes("taoyuan") || normCity.includes("tainan") || normCity.includes("taipei") || normCity.includes("kaohsiung") || normCity.includes("changhua") || normCity.includes("taichung")) return "Taiwán";
    if (normCity.includes("penang") || normCity.includes("selangor") || normCity.includes("melaka") || normCity.includes("darul ehsan") || normCity.includes("shah alam")) return "Malasia";
    if (normCity.includes("gyeonggi") || normCity.includes("daegu") || normCity.includes("busan") || normCity.includes("jeollanam") || normCity.includes("daejeon") || normCity.includes("ulsan") || normCity.includes("changwon")) return "Corea del Sur";
    if (normCity.includes("tangerang") || normCity.includes("jawa") || normCity.includes("sidoarjo") || normCity.includes("jakarta") || normCity.includes("banten") || normCity.includes("surabaya")) return "Indonesia";
    if (normCity.includes("guangdong") || normCity.includes("zhejiang") || normCity.includes("shaoxing") || normCity.includes("kunshan") || normCity.includes("shenzhen") || normCity.includes("shanghai") || normCity.includes("wuxi") || normCity.includes("foshan") || normCity.includes("ningbo") || normCity.includes("beijing") || normCity.includes("suzhou") || normCity.includes("hubei") || normCity.includes("zhaoqing") || normCity.includes("dongguan") || normCity.includes("tianjin") || normCity.includes("wuhan") || normCity.includes("chongqing") || normCity.includes("guangzhou") || normCity.includes("fujian")) return "China";
    if (normCity.includes("hong kong") || normCity.includes("kowloon") || normCity.includes("tsim sha tsui") || normCity.includes("new territories") || normCity.includes("p.r.") || normCity.includes("p.r") || normCity.includes("china") || normCity.includes("jilin") || normCity.includes("liaoyuan") || normCity.includes("xinxiang") || normCity.endsWith(" shi")) return "China";
    if (normCity.includes("doha")) return "Qatar";
    if (normCity.includes("riyadh") || normCity.includes("dammam") || normCity.includes("jeddah") || normCity.includes("madinah") || normCity.includes("sudair") || normCity.includes("modon")) return "Arabia Saudita";
    if (normCity.includes("samail") || normCity.includes("sib") || normCity.includes("sohar") || normCity.includes("oman") || normCity.includes("al liwa") || normCity.includes("al-qabail")) return "Omán";
    if (normCity.includes("kuwait") || normCity.includes("sabhan") || normCity.includes("shuwaikh") || normCity.includes("abdulla")) return "Kuwait";
    if (normCity.includes("burgbrohl") || normCity.includes("neuss") || normCity.includes("minden") || normCity.includes("münchen") || normCity.includes("berlin") || normCity.includes("heilbronn") || normCity.includes("mühlacker") || normCity.includes("bad arolsen") || normCity.includes("neukirchen") || normCity.includes("bremen")) return "Alemania";
    if (normCity.includes("ledegem") || normCity.includes("oudenaarde") || normCity.includes("lokeren") || normCity.includes("hamme") || normCity.includes("courcelles") || normCity.includes("charleroi") || normCity.includes("raeren") || normCity.includes("eupen") || normCity.includes("malle") || normCity.includes("brecht") || normCity.includes("wommelgem")) return "Bélgica";
    if (normCity.includes("utrecht") || normCity.includes("vianen") || normCity.includes("eindhoven") || normCity.includes("venlo") || normCity.includes("zevenbergen") || normCity.includes("zwijndrecht") || normCity.includes("mifa") || normCity.includes("terheijden")) return "Países Bajos";
    if (normCity.includes("sèvremoine") || normCity.includes("albi") || normCity.includes("toulouse") || normCity.includes("nantes") || normCity.includes("compiègne") || normCity.includes("châteauroux") || normCity.includes("warneton") || normCity.includes("nice") || normCity.includes("viarmes") || normCity.includes("ham") || normCity.includes("pinon")) return "Francia";
    if (normCity.includes("sitra") || normCity.includes("askar") || normCity.includes("salmabad")) return "Bahrein";
    if (normCity.includes("istanbul") || normCity.includes("kocaeli")) return "Turquía";

    // 3. Ambiguous/Local Phone Prefix Check (unprefixed number starting with specific codes)
    for (const p of phoneParts) {
      if (p.startsWith("52") && p.length >= 11) return "México";
      if (p.startsWith("61") && p.length >= 11) return "Australia";
      if (p.startsWith("34") && p.length >= 11) return "España";
      if (p.startsWith("49") && p.length >= 11) return "Alemania";
      if (p.startsWith("39") && p.length >= 11) return "Italia";
      if (p.startsWith("971") && p.length >= 11) return "UAE";
      if (p.startsWith("91") && p.length >= 11) return "India";
      if (p.startsWith("60") && p.length >= 11) return "Malasia";
      if (p.startsWith("82") && p.length >= 11) return "Corea del Sur";
      if (p.startsWith("86") && p.length >= 11) return "China";
      if (p.startsWith("852") && p.length >= 11) return "China";
      if (p.startsWith("57") && p.length >= 11) return "Colombia";
      if (p.startsWith("593") && p.length >= 11) return "Ecuador";
      if (p.startsWith("58") && p.length >= 11) return "Venezuela";
      if (p.startsWith("886") && p.length >= 11) return "Taiwán";
      if (p.startsWith("32") && p.length >= 11) return "Bélgica";
      if (p.startsWith("31") && p.length >= 11) return "Países Bajos";
      if (p.startsWith("33") && p.length >= 11) return "Francia";
      if (p.startsWith("47") && p.length >= 11) return "Noruega";
      if (p.startsWith("974") && p.length >= 11) return "Qatar";
      if (p.startsWith("966") && p.length >= 11) return "Arabia Saudita";
      if (p.startsWith("968") && p.length >= 11) return "Omán";
      if (p.startsWith("965") && p.length >= 11) return "Kuwait";
      if (p.startsWith("973") && p.length >= 11) return "Bahrein";
      if (p.startsWith("998") && p.length >= 11) return "Uzbekistán";
      if (p.startsWith("387") && p.length >= 11) return "Bosnia y Herzegovina";
      if (p.startsWith("421") && p.length >= 11) return "Eslovaquia";
      if (p.startsWith("43") && p.length >= 11) return "Austria";
      if (p.startsWith("30") && p.length >= 11) return "Grecia";
      if (p.startsWith("420") && p.length >= 11) return "República Checa";
      if (p.startsWith("40") && p.length >= 11) return "Rumania";
      if (p.startsWith("54") && p.length >= 11) return "Argentina";
      if (p.startsWith("359") && p.length >= 11) return "Bulgaria";
      if (p.startsWith("351") && p.length >= 11) return "Portugal";
      if (p.startsWith("503") && p.length >= 11) return "El Salvador";
      if (p.startsWith("502") && p.length >= 11) return "Guatemala";
      if (p.startsWith("504") && p.length >= 11) return "Honduras";
      if (p.startsWith("506") && p.length >= 11) return "Costa Rica";
      if (p.startsWith("595") && p.length >= 11) return "Paraguay";
      if (p.startsWith("598") && p.length >= 11) return "Uruguay";
      if (p.startsWith("90") && p.length >= 11) return "Turquía";
      if (p.startsWith("46") && p.length >= 11) return "Suecia";
      if (p.startsWith("355") && p.length >= 11) return "Albania";
      if (p.startsWith("62") && p.length >= 11) return "Indonesia";
      if (p.startsWith("27") && p.length >= 11) return "Sudáfrica";
      if (p.startsWith("254") && p.length >= 11) return "Kenia";

      if (p.startsWith("1") && p.length === 11) {
        if (normCity.includes("cambridge") || p.startsWith("1519") || normName.includes("canada") || normCity.includes("surrey") || p.startsWith("1604")) return "Canadá";
        return "Estados Unidos";
      }

      // Known US/Canada/Mexico area codes (10 digit local format)
      if (p.length === 10) {
        if (p.startsWith("519") || p.startsWith("604")) return "Canadá";
        if (p.startsWith("800") || p.startsWith("877") || p.startsWith("469") || p.startsWith("770") || p.startsWith("508") || p.startsWith("801") || p.startsWith("623") || p.startsWith("229") || p.startsWith("940") || p.startsWith("615") || p.startsWith("574") || p.startsWith("330") || p.startsWith("619") || p.startsWith("478") || p.startsWith("310")) {
          return "Estados Unidos";
        }
        if (p.startsWith("449") || p.startsWith("33") || p.startsWith("81") || p.startsWith("55")) {
          return "México";
        }
      }
    }

    // 4. Fallback based on text in company name
    if (normName.includes("mexico") || normName.includes("méxico")) return "México";
    if (normName.includes("australia")) return "Australia";
    if (normName.includes("colombia")) return "Colombia";
    if (normName.includes("ecuador")) return "Ecuador";
    if (normName.includes("venezuela")) return "Venezuela";
    if (normName.includes("germany") || normName.includes("deutschland")) return "Alemania";
    if (normName.includes("belgium") || normName.includes("belgique") || normName.endsWith(".be")) return "Bélgica";
    if (normName.includes("netherlands") || normName.endsWith(".nl")) return "Países Bajos";
    if (normName.includes("france") || normName.endsWith(".fr")) return "Francia";
    if (normName.includes("south africa")) return "Sudáfrica";
    if (normName.includes("kenya")) return "Kenia";
    if (normName.includes("qatar")) return "Qatar";
    if (normName.includes("saudi")) return "Arabia Saudita";
    if (normName.includes("oman")) return "Omán";
    if (normName.includes("kuwait")) return "Kuwait";
    if (normName.includes("bahrain")) return "Bahrein";
    if (normName.includes("korea")) return "Corea del Sur";
    if (normName.includes("china")) return "China";
    if (normName.includes("taiwan")) return "Taiwán";
    if (normName.includes("san. ve tic") || normName.includes("san. tic") || normName.includes("ltd. şti") || normName.includes("ltd. sti") || normName.includes("alüminyum")) return "Turquía";
    if (normName.includes("kaiser aluminum") || normName.includes("national extrusion") || normName.includes("superior extrusion") || normName.includes("honeywell") || normName.includes("universal alloys")) return "Estados Unidos";
    if (normName.includes("canada")) return "Canadá";
    if (normName.includes("austria")) return "Austria";
    if (normName.includes("greece") || normName.includes("grecia")) return "Grecia";
    if (normName.includes("romania") || normName.includes("rumania")) return "Rumania";
    if (normName.includes("argentina")) return "Argentina";
    if (normName.includes("bulgaria")) return "Bulgaria";
    if (normName.includes("portugal")) return "Portugal";
    if (normName.includes("el salvador")) return "El Salvador";
    if (normName.includes("guatemala")) return "Guatemala";
    if (normName.includes("honduras")) return "Honduras";
    if (normName.includes("costa rica")) return "Costa Rica";
    if (normName.includes("paraguay")) return "Paraguay";
    if (normName.includes("uruguay")) return "Uruguay";
    if (normName.includes("sweden") || normName.includes("suecia")) return "Suecia";
    if (normName.includes("albania")) return "Albania";

    return "México";
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        
        // Simple CSV parser
        const parseCSV = (csvText: string): string[][] => {
          const lines: string[][] = [];
          const linesRaw = csvText.split(/\r?\n/);
          for (const line of linesRaw) {
            if (!line.trim()) continue;
            const row: string[] = [];
            let insideQuote = false;
            let current = "";
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                if (insideQuote && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  insideQuote = !insideQuote;
                }
              } else if (char === ',' && !insideQuote) {
                row.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            row.push(current.trim());
            lines.push(row);
          }
          return lines;
        };

        const parsed = parseCSV(text);
        if (parsed.length <= 1) {
          setImportResults({
            successCount: 0,
            errors: ["El archivo CSV está vacío o solo contiene encabezados."]
          });
          setIsImporting(false);
          return;
        }

        const headers = parsed[0].map(h => h.toLowerCase().replace(/_/g, '').trim());
        const nameIdx = headers.findIndex(h => h.includes("nombre") || h.includes("name") || h.includes("comercial"));
        const razonIdx = headers.findIndex(h => h.includes("razon") || h.includes("razón") || h.includes("social"));
        const countryIdx = headers.findIndex(h => h.includes("pais") || h.includes("country") || h.includes("país"));
        const cityIdx = headers.findIndex(h => h.includes("ciudad") || h.includes("estado") || h.includes("city") || h.includes("state") || h.includes("location"));
        const typeIdx = headers.findIndex(h => h.includes("tipo") || h.includes("cuenta") || h.includes("status"));
        const hsIdx = headers.findIndex(h => h.includes("hubspot") || h.includes("crm") || h.includes("id"));
        const consultorIdx = headers.findIndex(h => h.includes("consultor") || h.includes("asesor") || h.includes("owner"));
        const phoneIdx = headers.findIndex(h => h.includes("telefono") || h.includes("teléfono") || h.includes("phone"));

        if (nameIdx === -1) {
          setImportResults({
            successCount: 0,
            errors: ["No se encontró la columna obligatoria: 'nombre_comercial' (o 'nombre')."]
          });
          setIsImporting(false);
          return;
        }

        let successCount = 0;
        const errors: string[] = [];

        for (let idx = 1; idx < parsed.length; idx++) {
          const row = parsed[idx];
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          const nombreComercialVal = row[nameIdx] || "";
          if (!nombreComercialVal) {
            errors.push(`Fila ${idx + 1}: El nombre comercial es obligatorio.`);
            continue;
          }

          const razonSocialVal = razonIdx !== -1 && row[razonIdx] ? row[razonIdx].trim() : "";
          const ciudadEstadoVal = cityIdx !== -1 && row[cityIdx] ? row[cityIdx].trim() : "";
          const phoneVal = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : "";
          
          // Detect country dynamically using phone code and city
          let paisVal = "México";
          if (countryIdx !== -1 && row[countryIdx]) {
            paisVal = row[countryIdx].trim();
          } else {
            paisVal = detectCountry(phoneVal, ciudadEstadoVal, nombreComercialVal);
          }
          
          let tipoVal: "prospecto" | "cliente_activo" | "ex_cliente" = "prospecto";
          if (typeIdx !== -1 && row[typeIdx]) {
            const rawType = row[typeIdx].toLowerCase().trim();
            if (rawType.includes("activo") || rawType.includes("cliente")) tipoVal = "cliente_activo";
            else if (rawType.includes("ex")) tipoVal = "ex_cliente";
            else if (rawType.includes("prospecto")) tipoVal = "prospecto";
          }

          const hubspotIdVal = hsIdx !== -1 && row[hsIdx] ? row[hsIdx].trim() : "";
          
          let consultorIdVal: string | undefined = undefined;
          if (consultorIdx !== -1 && row[consultorIdx]) {
            const nameToSearch = row[consultorIdx].toLowerCase().trim();
            const matchingConsultor = usuarios.find(u => 
              (u.rol === "consultor" || 
               u.email?.toLowerCase() === "mrodino@interlub.com" || 
               u.email?.toLowerCase() === "sergio.vazquez@interlub.com") && 
              u.nombre.toLowerCase().includes(nameToSearch)
            );
            if (matchingConsultor) {
              consultorIdVal = matchingConsultor.id;
            }
          }

          // Check if company already exists
          const existing = empresas.find(e => 
            (hubspotIdVal && e.hubspotId === hubspotIdVal) ||
            e.nombreComercial.toLowerCase() === nombreComercialVal.toLowerCase().trim()
          );

          try {
            if (existing) {
              // Update existing company
              await updateEmpresa(existing.id, {
                pais: paisVal,
                ciudadEstado: ciudadEstadoVal,
                contactoTelefono: phoneVal.trim() || undefined
              });

              // Check and update plants
              const companyPlants = plantas.filter(p => p.empresaId === existing.id);
              if (companyPlants.length > 0) {
                for (const plant of companyPlants) {
                  await updatePlanta(plant.id, {
                    pais: paisVal,
                    ciudadDireccion: ciudadEstadoVal
                  });
                }
              } else {
                // If it has no plant, create default one
                await addPlanta({
                  empresaId: existing.id,
                  nombre: existing.nombreComercial,
                  pais: paisVal,
                  ciudadDireccion: ciudadEstadoVal,
                  notasGenerales: "Creada automáticamente al actualizar la empresa.",
                  areasPresentes: ["area-3"]
                });
              }
            } else {
              // Create new company (which automatically spawns default plant via store-context)
              await addEmpresa({
                nombreComercial: nombreComercialVal.trim(),
                razonSocial: razonSocialVal.trim() || undefined,
                pais: paisVal,
                ciudadEstado: ciudadEstadoVal,
                tipo: tipoVal,
                segmento: "Extrusión de aluminio",
                hubspotId: hubspotIdVal.trim() || undefined,
                consultorId: consultorIdVal,
                contactoTelefono: phoneVal.trim() || undefined,
              });
            }
            successCount++;
          } catch (err: any) {
            errors.push(`Fila ${idx + 1}: Error - ${err.message || err}`);
          }
        }

        setImportResults({ successCount, errors });
      } catch (err: any) {
        setImportResults({
          successCount: 0,
          errors: [`Error de procesamiento: ${err.message || err}`]
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const handleClearCatalog = async () => {
    const ok = window.confirm("¿Estás seguro de que deseas eliminar todas las empresas, plantas y prensas? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      await clearDatabase();
      alert("Catálogo vaciado con éxito.");
    } catch (err: any) {
      alert("Error al vaciar el catálogo: " + err.message);
    }
  };

  const filtered = empresas.filter((e) => {
    // Consultors only see companies assigned to them
    const matchesConsultant = isSpecialAdmin || role !== "consultor" || e.consultorId === user?.id;
    if (!matchesConsultant) return false;

    const matchSearch =
      e.nombreComercial.toLowerCase().includes(search.toLowerCase()) ||
      (e.pais ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.ciudadEstado ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || e.tipo === typeFilter;
    return matchSearch && matchType;
  });

  const getPlantasCount = (empresaId: string) =>
    plantas.filter((p) => p.empresaId === empresaId).length;

  const getCompletitudProm = (empresaId: string) => {
    const pList = plantas.filter((p) => p.empresaId === empresaId);
    if (pList.length === 0) return 0;
    return Math.round(pList.reduce((a, p) => a + p.pctCompletitud, 0) / pList.length);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Empresas</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {empresas.length} empresas en la cartera global
          </p>
        </div>
        {role !== "consultor" && (
          <div className="flex items-center gap-2">
            <button
              className="btn-ghost"
              onClick={handleClearCatalog}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", padding: "0.5rem 1rem", color: "var(--interlub-red)", borderColor: "rgba(239, 68, 68, 0.2)" }}
            >
              <X size={15} /> Vaciar Catálogo
            </button>
            <button
              className="btn-ghost"
              onClick={() => setShowImportModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", padding: "0.5rem 1rem" }}
            >
              <Download size={15} style={{ transform: "rotate(180deg)" }} /> Importar CSV
            </button>
            <Link href="/empresas/nueva">
              <button className="btn-primary">
                <Plus size={15} /> Nueva Empresa
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="interlub-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="form-input"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="Buscar empresa, país, ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Type filter */}
          <div className="flex items-center gap-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                style={{
                  padding: "0.35rem 0.75rem", borderRadius: "7px", fontSize: "0.775rem",
                  fontWeight: 500, cursor: "pointer", border: "1px solid",
                  background: typeFilter === f.value ? "var(--interlub-red)" : "var(--bg-elevated)",
                  color: typeFilter === f.value ? "white" : "var(--text-secondary)",
                  borderColor: typeFilter === f.value ? "var(--interlub-red)" : "var(--bg-border)",
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1" style={{ marginLeft: "auto" }}>
            {(["table", "cards"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "0.35rem 0.625rem", borderRadius: "7px", fontSize: "0.75rem",
                  cursor: "pointer", border: "1px solid",
                  background: view === v ? "var(--bg-elevated)" : "transparent",
                  color: view === v ? "var(--text-primary)" : "var(--text-muted)",
                  borderColor: view === v ? "var(--bg-border)" : "transparent",
                }}
              >
                {v === "table" ? "≡ Lista" : "⊞ Tarjetas"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        Mostrando {filtered.length} de {empresas.length} empresas
      </p>

      {view === "table" && (
        <div className="interlub-card" style={{ overflow: "hidden" }}>
          <table className="interlub-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Tipo</th>
                <th className="hide-on-tablet">País / Ciudad</th>
                <th className="hide-on-laptop-large">Plantas</th>
                <th className="hide-on-laptop">Completitud</th>
                <th className="hide-on-desktop-small">Potencial/mes</th>
                <th className="hide-on-laptop">Consultor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((empresa, i) => {
                const plantasCount = getPlantasCount(empresa.id);
                const completitud = getCompletitudProm(empresa.id);
                const fillClass = completitud >= 80 ? "green" : completitud >= 40 ? "amber" : "red";
                const potencial = Math.floor(Math.random() * 200000 + 50000);
                return (
                  <tr
                    key={empresa.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms`, cursor: "pointer" }}
                    onClick={() => window.location.href = `/empresas/${empresa.id}`}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 32, height: 32, borderRadius: "8px",
                          background: "linear-gradient(135deg, var(--interlub-red) 0%, #8B5CF6 100%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", fontWeight: 700, color: "white", flexShrink: 0
                        }}>
                          {empresa.nombreComercial.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{empresa.nombreComercial}</p>
                          {empresa.razonSocial && empresa.razonSocial !== empresa.nombreComercial && (
                            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{empresa.razonSocial}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusColors[empresa.tipo as keyof typeof statusColors]}`}>
                        {statusLabels[empresa.tipo]}
                      </span>
                    </td>
                    <td className="hide-on-tablet">
                      <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
                        <MapPin size={12} />
                        {empresa.pais} {empresa.ciudadEstado ? `· ${empresa.ciudadEstado.split(',')[0]}` : ""}
                      </div>
                    </td>
                    <td className="hide-on-laptop-large">
                      <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                        <Factory size={13} />
                        <span style={{ fontSize: "0.875rem" }}>{plantasCount}</span>
                      </div>
                    </td>
                    <td className="hide-on-laptop">
                      <div style={{ minWidth: 80 }}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{formatPercent(completitud)}</span>
                        </div>
                        <div className="progress-bar-track" style={{ height: 4 }}>
                          <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${completitud}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="hide-on-desktop-small" style={{ color: "var(--accent-green)", fontWeight: 600, fontSize: "0.875rem" }}>
                      {formatCurrency(potencial)}
                    </td>
                    <td className="hide-on-laptop" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {empresa.consultor?.nombre ?? "—"}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Link href={`/empresas/${empresa.id}`}>
                        <button className="btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                          <ChevronRight size={14} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <Building2 size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
              <p style={{ fontSize: "0.875rem" }}>No se encontraron empresas con esos filtros</p>
            </div>
          )}
        </div>
      )}

      {/* Cards view */}
      {view === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {filtered.map((empresa, i) => {
            const plantasCount = getPlantasCount(empresa.id);
            const completitud = getCompletitudProm(empresa.id);
            const fillClass = completitud >= 80 ? "green" : completitud >= 40 ? "amber" : "red";
            return (
              <Link key={empresa.id} href={`/empresas/${empresa.id}`} style={{ textDecoration: "none" }}>
                <div className="interlub-card animate-fade-in" style={{ padding: "1.25rem", animationDelay: `${i * 50}ms`, cursor: "pointer" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: 38, height: 38, borderRadius: "10px",
                        background: "linear-gradient(135deg, var(--interlub-red) 0%, #8B5CF6 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700, color: "white",
                      }}>
                        {empresa.nombreComercial.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.2 }}>{empresa.nombreComercial}</p>
                        <span className={`status-badge ${statusColors[empresa.tipo as keyof typeof statusColors]}`} style={{ marginTop: "2px" }}>
                          {statusLabels[empresa.tipo]}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.875rem" }}>
                    {empresa.pais && (
                      <div className="flex items-center gap-1.5" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        <MapPin size={12} /> {empresa.pais}{empresa.ciudadEstado ? ` · ${empresa.ciudadEstado.split(',')[0]}` : ""}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <Factory size={12} /> {plantasCount} planta{plantasCount !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Completitud captura
                      </span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: completitud >= 80 ? "var(--accent-green)" : completitud >= 40 ? "var(--accent-amber)" : "var(--text-muted)" }}>
                        {formatPercent(completitud)}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${completitud}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="interlub-card animate-fade-in" style={{ width: "90%", maxWidth: 600, padding: "1.5rem", position: "relative", zIndex: 60 }}>
            {/* Styles for spinner */}
            <style>{`
              @keyframes modalSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .modal-spinner {
                animation: modalSpin 1s linear infinite;
              }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Importar Empresas desde CSV</h3>
              <button onClick={() => { setShowImportModal(false); setImportResults(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Guide */}
            {!importResults && !isImporting && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", padding: "1rem", borderRadius: "8px", fontSize: "0.8rem", lineHeight: 1.4 }}>
                  <p style={{ fontWeight: 700, marginBottom: "0.5rem" }} className="flex items-center gap-1.5">
                    <Info size={14} color="var(--interlub-red)" /> Instrucciones del archivo:
                  </p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem", color: "var(--text-secondary)" }}>
                    <li>Debe ser un archivo con extensión <strong>.csv</strong>.</li>
                    <li>La primera fila debe contener las cabeceras.</li>
                    <li>Columna obligatoria: <strong>nombre_comercial</strong>.</li>
                    <li>Columnas opcionales: <strong>razon_social</strong>, <strong>pais</strong>, <strong>ciudad_estado</strong>, <strong>tipo_cuenta</strong>, <strong>hubspot_id</strong>, <strong>consultor</strong>.</li>
                    <li>El valor de <code>tipo_cuenta</code> puede ser: <code>cliente_activo</code>, <code>prospecto</code> o <code>ex_cliente</code>.</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between" style={{ padding: "0.25rem 0" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>¿No tienes una plantilla?</span>
                  <button onClick={downloadTemplate} className="btn-ghost" style={{ fontSize: "0.775rem", padding: "0.35rem 0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Download size={13} /> Descargar Plantilla CSV
                  </button>
                </div>

                <div style={{
                  border: "2px dashed var(--bg-border)", borderRadius: "8px", padding: "2.5rem",
                  textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: "0.75rem", background: "var(--bg-secondary)", cursor: "pointer",
                  position: "relative"
                }}>
                  <Upload size={28} color="var(--text-muted)" />
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>Selecciona tu archivo CSV para iniciar</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>Las empresas se cargarán directamente en el sistema</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                  />
                </div>
              </div>
            )}

            {/* Importing Screen */}
            {isImporting && (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div className="modal-spinner" style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "3px solid var(--bg-border)", borderTopColor: "var(--interlub-red)",
                  margin: "0 auto 1rem"
                }} />
                <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Procesando e importando empresas...</p>
                <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "2px" }}>Sincronizando con Supabase Database...</p>
              </div>
            )}

            {/* Results Screen */}
            {importResults && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="flex items-center gap-2" style={{ color: importResults.errors.length > 0 ? "var(--accent-amber)" : "var(--accent-green)", fontWeight: 700 }}>
                  {importResults.errors.length > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                  <span>Proceso Completado</span>
                </div>

                <p style={{ fontSize: "0.85rem" }}>
                  Se importaron <strong>{importResults.successCount}</strong> empresas exitosamente.
                </p>

                {importResults.errors.length > 0 && (
                  <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--bg-border)", borderRadius: "8px", background: "rgba(245, 158, 11, 0.05)" }}>
                    <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, borderBottom: "1px solid var(--bg-border)", color: "var(--accent-amber)" }}>
                      Fila con Errores ({importResults.errors.length})
                    </div>
                    <ul style={{ padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", margin: 0, listStyleType: "none", fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                      {importResults.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end pt-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
                  <button onClick={() => { setShowImportModal(false); setImportResults(null); }} className="btn-primary" style={{ padding: "0.5rem 1.25rem" }}>
                    Cerrar y Actualizar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
