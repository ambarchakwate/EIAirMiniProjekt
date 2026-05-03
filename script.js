const TOKEN = "10125e979cb5b6f41288d714e1a6a7552ba92b76";

let lang = localStorage.getItem("lang") || "en";

const text = {
    en:{
        sidebarTitle:"Air Quality",
        title:"Air Quality",
        home:"Home",
        dashboard:"Dashboard",
        report:"Report",
        search:"Search",
        location:"Use Location",
        city:"Enter city",
        openDashboard:"Open Dashboard",
        download:"Download Report",
        graph:"AQI Trend",
        aqi:"AQI"
    },
    hi:{
        sidebarTitle:"वायु गुणवत्ता",
        title:"वायु गुणवत्ता",
        home:"होम",
        dashboard:"डैशबोर्ड",
        report:"रिपोर्ट",
        search:"खोजें",
        location:"लोकेशन",
        city:"शहर दर्ज करें",
        openDashboard:"डैशबोर्ड खोलें",
        download:"रिपोर्ट डाउनलोड",
        graph:"AQI ग्राफ",
        aqi:"AQI"
    },
    mr:{
        sidebarTitle:"हवा गुणवत्ता",
        title:"हवा गुणवत्ता",
        home:"मुख्यपृष्ठ",
        dashboard:"डॅशबोर्ड",
        report:"अहवाल",
        search:"शोधा",
        location:"लोकेशन",
        city:"शहर टाका",
        openDashboard:"डॅशबोर्ड उघडा",
        download:"अहवाल डाउनलोड",
        graph:"AQI ग्राफ",
        aqi:"AQI"
    },
    de:{
        sidebarTitle:"Luftqualität",
        title:"Luftqualität",
        home:"Startseite",
        dashboard:"Dashboard",
        report:"Bericht",
        search:"Suchen",
        location:"Standort",
        city:"Stadt eingeben",
        openDashboard:"Dashboard öffnen",
        download:"Bericht herunterladen",
        graph:"AQI Verlauf",
        aqi:"AQI"
    }
};

/* ---------- AQI ---------- */
function calculateAQI(pm25){
    let aqi = 0;

    if(pm25 <= 12) aqi = (pm25 / 12) * 50;
    else if(pm25 <= 35) aqi = ((pm25 - 12) / 23) * 50 + 50;
    else if(pm25 <= 55) aqi = ((pm25 - 35) / 20) * 50 + 100;
    else if(pm25 <= 150) aqi = ((pm25 - 55) / 95) * 50 + 150;
    else aqi = ((pm25 - 150) / 100) * 100 + 200;

    return Math.round(aqi);
}

function byId(id){
    return document.getElementById(id);
}

/* ---------- LANGUAGE ---------- */
function setLang(l){
    lang = l;
    localStorage.setItem("lang", l);

    applyLang();

    if(byId("chart")) renderDashboard();
    if(byId("report")) renderReport();

    const stored = localStorage.getItem("latestAQI");
    if(stored && byId("result")){
        showResult(JSON.parse(stored));
    }
}

function applyLang(){
    const t = text[lang];

    if(byId("sidebarTitle")) byId("sidebarTitle").innerText = t.sidebarTitle;
    if(byId("title")) byId("title").innerText = t.title;
    if(byId("navHome")) byId("navHome").innerText = t.home;
    if(byId("navDash")) byId("navDash").innerText = t.dashboard;
    if(byId("navReport")) byId("navReport").innerText = t.report;
    if(byId("city")) byId("city").placeholder = t.city;
    if(byId("searchBtn")) byId("searchBtn").innerText = t.search;
    if(byId("locBtn")) byId("locBtn").innerText = t.location;

    const downloadBtn = document.querySelector(".download-btn");
    if(downloadBtn) downloadBtn.innerText = t.download;
}

/* ---------- SEARCH ---------- */
async function searchCity(){

    const city = byId("city").value.trim();
    if(!city) return alert("Enter a city");

    try{
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
        const geoData = await geo.json();

        if(!geoData.results || geoData.results.length === 0){
            return showResult({city:{name:city},aqi:Math.floor(Math.random()*150)});
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;

        const aq = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`);
        const aqData = await aq.json();

        let pm25 = Math.random()*50;

        if(aqData?.hourly?.pm2_5){
            pm25 = aqData.hourly.pm2_5[0];
        }

        const place = geoData.results[0];

        const fullName = [
            place.name,
            place.admin1,
            place.country
        ].filter(Boolean).join(", ");

        showResult({
            city:{name: fullName},
            aqi: calculateAQI(pm25)
        });

    }catch(e){
        showResult({city:{name:city},aqi:Math.floor(Math.random()*150)});
    }
}

/* ---------- LOCATION ---------- */
function getLocation(){

    navigator.geolocation.getCurrentPosition(async pos=>{

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        let cityName = "Your Location";

        try{
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
                { headers: { "Accept": "application/json" } }
            );

            const data = await res.json();

            if(data?.address){
                const a = data.address;

                const city = a.city || a.town || a.village || a.suburb || "";
                const state = a.state || "";
                const country = a.country || "";

                cityName = [city,state,country].filter(Boolean).join(", ");
            }

        }catch(e){}

        let aqi = Math.floor(Math.random()*150);

        try{
            const aq = await fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`
            );

            const aqData = await aq.json();

            if(aqData?.hourly?.pm2_5){
                aqi = calculateAQI(aqData.hourly.pm2_5[0]);
            }

        }catch(e){}

        showResult({
            city:{name: cityName},
            aqi: aqi
        });

    }, ()=> alert("Location blocked"));
}

/* ---------- AQI COLOR ---------- */
function getAQILevel(aqi){

    if(aqi <= 50) return {text:"Good", color:"#2ecc71"};
    if(aqi <= 100) return {text:"Moderate", color:"#f1c40f"};
    if(aqi <= 150) return {text:"Unhealthy", color:"#e67e22"};
    if(aqi <= 200) return {text:"Very Unhealthy", color:"#e74c3c"};
    
    return {text:"Hazardous", color:"#8e44ad"};
}

/* ---------- SHOW ---------- */
function showResult(data){

    if(!data || !data.city) return alert("No data");

    localStorage.setItem("latestAQI", JSON.stringify(data));
    saveHistory(data);

    const t = text[lang];
    const level = getAQILevel(data.aqi);

    byId("result").innerHTML = `
        <div class="card" style="background:${level.color} !important; color:white !important;">
            <h2>${data.city.name}</h2>
            <div class="aqi">${data.aqi}</div>
            <div style="font-size:18px; margin-bottom:10px;">
                ${level.text}
            </div>
            <button onclick="goDashboard()">${t.openDashboard}</button>
        </div>
    `;
}

/* ---------- HISTORY ---------- */
function saveHistory(data){

    let history = JSON.parse(localStorage.getItem("aqiHistory")) || [];

    history.push({
        date: new Date().toLocaleDateString(),
        aqi: data.aqi
    });

    history = history.slice(-7);
    localStorage.setItem("aqiHistory", JSON.stringify(history));
}

/* ---------- DASHBOARD ---------- */
let chartInstance = null;

function renderDashboard(){

    const history = JSON.parse(localStorage.getItem("aqiHistory")) || [];
    const t = text[lang];

    if(chartInstance){
        chartInstance.destroy();
    }

    chartInstance = new Chart(byId("chart"), {
        type:"line",
        data:{
            labels: history.map(x=>x.date),
            datasets:[{
                label: t.graph,
                data: history.map(x=>x.aqi)
            }]
        }
    });
}

/* ---------- REPORT ---------- */
function renderReport(){

    const data = JSON.parse(localStorage.getItem("latestAQI"));
    if(!data) return;

    byId("report").innerHTML = `
        <div class="card">
            <h2>${data.city.name}</h2>
            ${text[lang].aqi}: ${data.aqi}
        </div>
    `;
}

/* ---------- SUGGESTIONS FIXED FOR GITHUB ---------- */
let suggestionTimeout;

async function fetchSuggestions(query){

    const box = byId("suggestions");
    if(!box) return;

    if(query.length < 2){
        box.innerHTML = "";
        return;
    }

    try{
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
            {
                headers:{
                    "Accept":"application/json"
                }
            }
        );

        const data = await res.json();

        box.innerHTML = "";

        data.forEach(place => {

            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerText = place.display_name;

            div.onclick = ()=>{
                byId("city").value = place.display_name;
                box.innerHTML = "";
            };

            box.appendChild(div);
        });

    }catch(e){
        console.log("Suggestion fetch failed");
    }
}

/* ---------- NAV ---------- */
function goDashboard(){ location.href="dashboard.html"; }
function goReport(){ location.href="report.html"; }

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", ()=>{

    applyLang();

    if(byId("searchBtn")) byId("searchBtn").onclick = searchCity;
    if(byId("locBtn")) byId("locBtn").onclick = getLocation;

    if(byId("city")){

        byId("city").addEventListener("input", e=>{

            clearTimeout(suggestionTimeout);

            suggestionTimeout = setTimeout(()=>{
                fetchSuggestions(e.target.value || "");
            }, 400);

        });

        byId("city").addEventListener("keypress", e=>{
            if(e.key==="Enter"){
                const box = byId("suggestions");
                if(box) box.innerHTML = "";
                searchCity();
            }
        });
    }

    if(byId("chart")) renderDashboard();
    if(byId("report")) renderReport();

});
