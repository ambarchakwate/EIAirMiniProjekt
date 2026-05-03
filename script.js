const TOKEN =
"10125e979cb5b6f41288d714e1a6a7552ba92b76";


let lang =
localStorage.getItem("lang") || "en";


const text = {

    en:{
        temp:"Temperature",
        humidity:"Humidity",
        wind:"Wind",
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
        temp:"तापमान",
        humidity:"नमी",
        wind:"हवा",
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
        temp:"तापमान",
        humidity:"आर्द्रता",
        wind:"वारा",
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
        temp:"Temperatur",
        humidity:"Luftfeuchtigkeit",
        wind:"Wind",
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


function byId(id){
    return document.getElementById(id);
}


function setLang(l){
    lang = l;
    localStorage.setItem("lang", l);
    location.reload();
}


function applyLang(){

    const t = text[lang];

    if(byId("sidebarTitle"))
        byId("sidebarTitle").innerText = t.sidebarTitle;

    if(byId("title"))
        byId("title").innerText = t.title;

    if(byId("navHome"))
        byId("navHome").innerText = t.home;

    if(byId("navDash"))
        byId("navDash").innerText = t.dashboard;

    if(byId("navReport"))
        byId("navReport").innerText = t.report;

    if(byId("city"))
        byId("city").placeholder = t.city;

    if(byId("searchBtn"))
        byId("searchBtn").innerText = t.search;

    if(byId("locBtn"))
        byId("locBtn").innerText = t.location;

    const downloadBtn =
        document.querySelector(".download-btn");

    if(downloadBtn)
        downloadBtn.innerText = t.download;
}


function showResult(data){

    localStorage.setItem(
        "latestAQI",
        JSON.stringify(data)
    );

    saveHistory(data);

    byId("result").innerHTML = `

        <div class="card">

            <h2>
                ${data.city.name}
            </h2>

            <div class="aqi">
                ${data.aqi}
            </div>

            <button onclick="goDashboard()">
                ${text[lang].openDashboard}
            </button>

        </div>

    `;
}


function saveHistory(data){

    let history =
        JSON.parse(
            localStorage.getItem(
                "aqiHistory"
            )
        ) || [];

    history.push({
        date:new Date()
            .toLocaleDateString(),
        aqi:data.aqi
    });

    history = history.slice(-7);

    localStorage.setItem(
        "aqiHistory",
        JSON.stringify(history)
    );
}


async function searchCity(){

    const city =
        byId("city").value;

    if(!city) return;

    showResult({
        city:{name:city},
        aqi:Math.floor(
            Math.random()*200
        )
    });
}


function getLocation(){

    showResult({
        city:{
            name:"Current Location"
        },
        aqi:Math.floor(
            Math.random()*200
        )
    });
}


function renderDashboard(){

    if(!byId("chart")) return;

    const history =
        JSON.parse(
            localStorage.getItem(
                "aqiHistory"
            )
        ) || [];

    new Chart(
        byId("chart"),
        {
            type:"line",
            data:{
                labels:
                    history.map(
                        x=>x.date
                    ),
                datasets:[{
                    label:
                        text[lang].graph,
                    data:
                        history.map(
                            x=>x.aqi
                        )
                }]
            }
        }
    );
}


function renderReport(){

    if(!byId("report")) return;

    const data =
        JSON.parse(
            localStorage.getItem(
                "latestAQI"
            )
        );

    if(!data) return;

    byId("report").innerHTML = `

        <div class="card">

            <h2>
                ${data.city.name}
            </h2>

            ${text[lang].aqi}:
            ${data.aqi}

        </div>

    `;
}


function downloadReport(){

    const data =
        JSON.parse(
            localStorage.getItem(
                "latestAQI"
            )
        );

    if(!data) return;

    const report = `

AIR QUALITY REPORT

Location:
${data.city.name}

AQI:
${data.aqi}

Generated:
${new Date().toLocaleString()}

`;

    const blob =
        new Blob(
            [report],
            {
                type:"text/plain"
            }
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        URL.createObjectURL(
            blob
        );

    link.download =
        "aqi-report.txt";

    link.click();
}


function goDashboard(){
    location.href =
    "dashboard.html";
}


function goReport(){
    location.href =
    "report.html";
}


document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        applyLang();

        if(byId("searchBtn"))
            byId("searchBtn")
            .onclick =
            searchCity;

        if(byId("locBtn"))
            byId("locBtn")
            .onclick =
            getLocation;

        if(byId("chart"))
            renderDashboard();

        if(byId("report"))
            renderReport();
    }
);
