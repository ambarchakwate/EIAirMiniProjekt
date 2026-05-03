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



function getLabel(key){

    return text[lang][key];

}



function setLang(l){

    lang = l;

    localStorage.setItem(
        "lang",
        l
    );

    location.reload();

}



function applyLang(){

    const t =
    text[lang];


    if(byId("sidebarTitle"))
        byId("sidebarTitle")
        .innerText =
        t.sidebarTitle;


    if(byId("title"))
        byId("title")
        .innerText =
        t.title;


    if(byId("navHome"))
        byId("navHome")
        .innerText =
        t.home;


    if(byId("navDash"))
        byId("navDash")
        .innerText =
        t.dashboard;


    if(byId("navReport"))
        byId("navReport")
        .innerText =
        t.report;


    if(byId("city"))
        byId("city")
        .placeholder =
        t.city;


    if(byId("searchBtn"))
        byId("searchBtn")
        .innerText =
        t.search;


    if(byId("locBtn"))
        byId("locBtn")
        .innerText =
        t.location;


    const downloadBtn =
    document.querySelector(
        ".download-btn"
    );


    if(downloadBtn)
        downloadBtn.innerText =
        t.download;

}



function calculateAQI(pm25){

    if(pm25 <= 12)
        return Math.round(
            (pm25 / 12) * 50
        );


    if(pm25 <= 35)
        return Math.round(
            ((pm25-12)/23)*50+50
        );


    if(pm25 <= 55)
        return Math.round(
            ((pm25-35)/20)*50+100
        );


    if(pm25 <= 150)
        return Math.round(
            ((pm25-55)/95)*50+150
        );


    return Math.round(
        ((pm25-150)/100)*100+200
    );

}



function getAQIClass(aqi){

    if(aqi <= 50)
        return "good";


    if(aqi <= 100)
        return "moderate";


    if(aqi <= 150)
        return "unhealthy";


    return "hazardous";

}



/* SEARCH */

async function searchCity(){

    const city =
    byId("city")
    .value
    .trim();


    if(!city) return;


    const geo =
    await fetch(

`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`

    );


    const geoData =
    await geo.json();


    if(
        !geoData.results
    ){

        alert("City not found");
        return;

    }


    const place =
    geoData.results[0];


    loadAQI(

        place.latitude,
        place.longitude,

        [

            place.name,
            place.admin1,
            place.country

        ]
        .filter(Boolean)
        .join(", ")

    );

}



/* LOCATION */

function getLocation(){

    navigator.geolocation.getCurrentPosition(

        pos=>{

            loadAQI(

                pos.coords.latitude,
                pos.coords.longitude,

                "Current Location"

            );

        }

    );

}



/* AQI LOAD */

async function loadAQI(
    lat,
    lon,
    cityName
){

    const res =
    await fetch(

`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,temperature_2m,relative_humidity_2m,windspeed_10m`

    );


    const data =
    await res.json();


    const pm25 =
    data.hourly.pm2_5[0];


    const aqi =
    calculateAQI(pm25);


    showResult({

        city:{
            name:cityName
        },

        aqi:aqi,

        temp:
        data.hourly.temperature_2m[0],

        humidity:
        data.hourly.relative_humidity_2m[0],

        wind:
        data.hourly.windspeed_10m[0]

    });

}



/* RESULT */

function showResult(data){

    localStorage.setItem(
        "latestAQI",
        JSON.stringify(data)
    );


    saveHistory(data);


    const colorClass =
    getAQIClass(
        data.aqi
    );


    byId("result")
    .innerHTML = `

        <div class="aqiWeatherCard ${colorClass}">

            <h2>
                ${data.city.name}
            </h2>

            <h1>
                AQI ${data.aqi}
            </h1>

            <div class="weatherGrid">

                <div>

                    ${getLabel("temp")}
                    <br>

                    ${data.temp}°C

                </div>

                <div>

                    ${getLabel("humidity")}
                    <br>

                    ${data.humidity}%

                </div>

                <div>

                    ${getLabel("wind")}
                    <br>

                    ${data.wind}

                </div>

            </div>

            <button onclick="goDashboard()">

                ${getLabel(
                    "openDashboard"
                )}

            </button>

        </div>

    `;

}



/* SUGGESTIONS */

async function fetchSuggestions(query){

    const box =
    byId("suggestions");


    if(query.length < 2){

        box.innerHTML = "";
        return;

    }


    const res =
    await fetch(

`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`

    );


    const data =
    await res.json();


    box.innerHTML = "";


    if(
        !data.results
    ) return;


    data.results.forEach(

        place=>{

            const div =
            document.createElement(
                "div"
            );


            div.className =
            "suggestion-item";


            div.innerText =

            [

                place.name,
                place.admin1,
                place.country

            ]
            .filter(Boolean)
            .join(", ");


            div.onclick =
            ()=>{

                byId("city")
                .value =
                place.name;


                box.innerHTML =
                "";

            };


            box.appendChild(
                div
            );

        }

    );

}



/* HISTORY */

function saveHistory(data){

    let history =

        JSON.parse(

            localStorage.getItem(
                "aqiHistory"
            )

        ) || [];


    history.push({

        date:
        new Date()
        .toLocaleDateString(),

        aqi:
        data.aqi

    });


    history =
    history.slice(-7);


    localStorage.setItem(

        "aqiHistory",

        JSON.stringify(history)

    );

}



/* DASHBOARD */

function renderDashboard(){

    if(!byId("chart"))
        return;


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
                    getLabel(
                        "graph"
                    ),

                    data:
                    history.map(
                        x=>x.aqi
                    )

                }]

            }

        }

    );

}



/* REPORT */

function renderReport(){

    if(!byId("report"))
        return;


    const data =

        JSON.parse(

            localStorage.getItem(
                "latestAQI"
            )

        );


    if(!data)
        return;


    byId("report")
    .innerHTML = `

        <div class="card">

            <h2>
                ${data.city.name}
            </h2>

            AQI:
            ${data.aqi}

        </div>

    `;

}



/* DOWNLOAD */

function downloadReport(){

    const data =

        JSON.parse(

            localStorage.getItem(
                "latestAQI"
            )

        );


    if(!data)
        return;


    const report =

`AIR QUALITY REPORT

Location:
${data.city.name}

AQI:
${data.aqi}

Generated:
${new Date().toLocaleString()}`;


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


        if(byId("city")){

            byId("city")
            .addEventListener(

                "input",

                e=>{

                    fetchSuggestions(
                        e.target.value
                    );

                }

            );


            byId("city")
            .addEventListener(

                "keypress",

                e=>{

                    if(
                        e.key==="Enter"
                    ){

                        searchCity();

                    }

                }

            );

        }


        if(byId("chart"))
            renderDashboard();


        if(byId("report"))
            renderReport();

    }

);
