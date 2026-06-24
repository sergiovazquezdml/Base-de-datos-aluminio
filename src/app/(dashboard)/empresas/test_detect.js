const fs = require('fs');
const path = require('path');

const detectCountry = (phone, city, companyName) => {
  const normPhone = phone.replace(/[^+\d]/g, '').trim();
  const normCity = city.toLowerCase().trim();
  const normName = companyName.toLowerCase().trim();

  // 1. Check by city first
  if (normCity.includes("dubai") || normCity.includes("abu dhabi")) return "UAE";
  if (normCity.includes("vadodara")) return "India";
  if (normCity.includes("melbourne") || normCity.includes("melboure") || normCity.includes("sydney") || normCity.includes("laverton") || normCity.includes("brisbane") || normCity.includes("gnangara") || normCity.includes("truganina") || normCity.includes("currumbin") || normCity.includes("central coast")) return "Australia";
  if (normCity.includes("ambato")) return "Ecuador";
  if (normCity.includes("buttrio") || normCity.includes("brescia") || normCity.includes("pisticci")) return "Italia";
  if (normCity.includes("padrón")) return "España";
  if (normCity.includes("funza")) return "Colombia";
  if (normCity.includes("mostar")) return "Bosnia y Herzegovina";
  if (normCity.includes("bratislava")) return "Eslovaquia";
  
  const usCities = ["charlotte", "union", "wylie", "portage", "fond du lac", "fondu du lac", "fort scott", "fonda", "gwinn", "houston", "waxahachie", "bristol", "trenton", "sanford", "cressona", "ohio", "michigan", "florida", "texas", "california", "atlanta", "chicago", "new york"];
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

  // 2. Check by phone number prefix
  if (normPhone.startsWith("+52") || normPhone.startsWith("52")) return "México";
  if (normPhone.startsWith("+61") || normPhone.startsWith("61")) return "Australia";
  if (normPhone.startsWith("+34") || normPhone.startsWith("34")) return "España";
  if (normPhone.startsWith("+49") || normPhone.startsWith("49")) return "Alemania";
  if (normPhone.startsWith("+39") || normPhone.startsWith("39")) return "Italia";
  if (normPhone.startsWith("+971") || normPhone.startsWith("971")) return "UAE";
  if (normPhone.startsWith("+91") || normPhone.startsWith("91")) return "India";
  if (normPhone.startsWith("+60") || normPhone.startsWith("60")) return "Malasia";
  if (normPhone.startsWith("+82") || normPhone.startsWith("82")) return "Corea del Sur";
  if (normPhone.startsWith("+86") || normPhone.startsWith("86")) return "China";
  if (normPhone.startsWith("+852") || normPhone.startsWith("852")) return "China";
  if (normPhone.startsWith("+57") || normPhone.startsWith("57")) return "Colombia";
  if (normPhone.startsWith("+593") || normPhone.startsWith("593")) return "Ecuador";
  if (normPhone.startsWith("+58") || normPhone.startsWith("58")) return "Venezuela";
  if (normPhone.startsWith("+886") || normPhone.startsWith("886")) return "Taiwán";
  if (normPhone.startsWith("+32") || normPhone.startsWith("32")) return "Bélgica";
  if (normPhone.startsWith("+31") || normPhone.startsWith("31")) return "Países Bajos";
  if (normPhone.startsWith("+33") || normPhone.startsWith("33")) return "Francia";
  if (normPhone.startsWith("+47") || normPhone.startsWith("47")) return "Noruega";
  if (normPhone.startsWith("+974") || normPhone.startsWith("974")) return "Qatar";
  if (normPhone.startsWith("+966") || normPhone.startsWith("966")) return "Arabia Saudita";
  if (normPhone.startsWith("+968") || normPhone.startsWith("968")) return "Omán";
  if (normPhone.startsWith("+965") || normPhone.startsWith("965")) return "Kuwait";
  if (normPhone.startsWith("+973") || normPhone.startsWith("973")) return "Bahrein";
  if (normPhone.startsWith("+998") || normPhone.startsWith("998")) return "Uzbekistán";
  if (normPhone.startsWith("+387") || normPhone.startsWith("387")) return "Bosnia y Herzegovina";
  if (normPhone.startsWith("+421") || normPhone.startsWith("421")) return "Eslovaquia";
  if (normPhone.startsWith("+254") || normPhone.startsWith("254")) {
    if (normName.includes("south africa") || normCity.includes("gqeberha") || normCity.includes("johannesburg") || normCity.includes("cape town") || normCity.includes("east london")) {
      return "Sudáfrica";
    }
    return "Kenia";
  }
  if (normPhone.startsWith("+27") || normPhone.startsWith("27")) return "Sudáfrica";
  if (normPhone.startsWith("+1") || (normPhone.startsWith("1") && normPhone.length === 11)) return "Estados Unidos";

  // 3. Fallback based on text in company name
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
  if (normName.includes("san. ve tic") || normName.includes("san. tic") || normName.includes("ltd. şti") || normName.includes("ltd. sti")) return "Turquía";
  if (normName.includes("kaiser aluminum") || normName.includes("national extrusion") || normName.includes("superior extrusion") || normName.includes("honeywell") || normName.includes("universal alloys")) return "Estados Unidos";

  return "México";
};

// Simple CSV parser
const parseCSV = (csvText) => {
  const lines = [];
  const linesRaw = csvText.split(/\r?\n/);
  for (const line of linesRaw) {
    if (!line.trim()) continue;
    const row = [];
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

const filePath = path.join('c:', 'Users', 'sergio.vazquez', 'OneDrive - INTERLUB SA DE CV', 'Escritorio', 'Empresas Aluminio.csv');
const content = fs.readFileSync(filePath, 'utf-8');
const parsed = parseCSV(content);

const headers = parsed[0].map(h => h.toLowerCase().replace(/_/g, '').trim());
const nameIdx = headers.findIndex(h => h.includes("empresa") || h.includes("company") || h.includes("nombre") || h.includes("planta"));
const cityIdx = headers.findIndex(h => h.includes("ciudad") || h.includes("estado") || h.includes("city") || h.includes("state") || h.includes("location") || h.includes("direccion") || h.includes("dirección"));
const phoneIdx = headers.findIndex(h => h.includes("telefono") || h.includes("teléfono") || h.includes("phone"));

console.log("Analyzing detectCountry fallbacks with final rules...");
for (let i = 1; i < parsed.length; i++) {
  const row = parsed[i];
  if (row.length === 0 || (row.length === 1 && !row[0])) continue;

  const name = row[nameIdx] || "";
  const city = cityIdx !== -1 && row[cityIdx] ? row[cityIdx].trim() : "";
  const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : "";

  const detected = detectCountry(phone, city, name);

  const lowerName = name.toLowerCase();
  const lowerCity = city.toLowerCase();

  let likelyNonMexico = false;
  let expectedCountry = "";

  if (detected === "México") {
    if (lowerName.includes("s.a.") || lowerName.includes("sa de cv") || lowerName.includes("s.a. de c.v.") || lowerName.includes("mexico") || lowerName.includes("méxico") || lowerCity.includes("guadalajara") || lowerCity.includes("monterrey") || lowerCity.includes("san luis potosí") || lowerCity.includes("querétaro") || lowerCity.includes("puebla") || lowerCity.includes("aguascalientes")) {
      // Correctly Mexico
    } else {
      if (lowerName.includes("pty ltd") || lowerName.includes("ltd") || lowerName.includes("inc") || lowerName.includes("corp") || lowerName.includes("gmbh") || lowerName.includes("s.a.s") || lowerName.includes("sp. z o.o.") || lowerName.includes("s.p.a.") || lowerName.includes("co.")) {
        likelyNonMexico = true;
        expectedCountry = "Check (Ltd/Inc/GmbH)";
      }
      if (phone.startsWith("+27") || phone.startsWith("27") || lowerName.includes("south africa")) {
        likelyNonMexico = true;
        expectedCountry = "Sudáfrica";
      }
      if (phone.startsWith("+254") || phone.startsWith("254") || lowerName.includes("kenya")) {
        likelyNonMexico = true;
        expectedCountry = "Kenia";
      }
      if (lowerCity.includes("melboure") || lowerCity.includes("melbourne") || lowerCity.includes("sydney")) {
        likelyNonMexico = true;
        expectedCountry = "Australia";
      }
    }
  }

  if (likelyNonMexico) {
    console.log(`Row ${i + 1}: Name: "${name}" | City: "${city}" | Phone: "${phone}" | Detected: "${detected}" | Likely: "${expectedCountry}"`);
  }
}
