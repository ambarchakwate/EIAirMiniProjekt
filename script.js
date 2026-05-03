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


function byId(id){
    return document.getElementById(id);
}


/* REAL AQI */

function calculateAQI(pm25){

    let aqi = 0;

    if(pm25 <= 12) aqi = (pm25 / 12) * 50;
    else if(pm25 <= 35) aqi = ((pm25 - 12) / 23) * 50 + 50;
    else if(pm25 <= 55) aqi = ((pm25 - 35) / 20) * 50 + 100;
    else if(pm25 <= 150) aqi = ((pm25 - 55) / 95) * 50 + 150;
    else aqi = ((pm25 - 150) / 100) * 100 + 200;

    return Math.round(aqi);
}


/* LANGUAGE */

function setLang(l){

    lang = l;

    localStorage.setItem(
        "lang",
        l
    );

    applyLang();

    if(byId("chart"))
        renderDashboard();

    if(byId("report"))
        renderReport();

    const stored =
    localStorage.getItem(
        "latestAQI"
    );

    if(
        stored &&
        byId("result")
    ){
        showResult(
            JSON.parse(stored)
        );
    }

}


function applyLang(){

    const t = text[lang];

    if(byId("sidebarTitle"))
        byId("sidebarTitle").innerText =
        t.sidebarTitle;

    if(byId("title"))
        byId("title").innerText =
        t.title;

    if(byId("navHome"))
        byId("navHome").innerText =
        t.home;

    if(byId("navDash"))
        byId("navDash").innerText =
        t.dashboard;

    if(byId("navReport"))
        byId("navReport").innerText =
        t.report;

    if(byId("city"))
        byId("city").placeholder =
        t.city;

    if(byId("searchBtn"))
        byId("searchBtn").innerText =
        t.search;

    if(byId("locBtn"))
        byId("locBtn").innerText =
        t.location;

}


/* SEARCH */

async function searchCity(){

    const city =
    byId("city")
    .value
    .trim();

    if(!city) return;

    try{

        const geo =
        await fetch(

`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`

        );

        const geoData =
        await geo.json();

        if(
            !geoData.results ||
            !geoData.results.length
        ){
            alert("City not found");
            return;
        }

        const place =
        geoData.results[0];

        const aq =
        await fetch(

`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}&hourly=pm2_5`

        );

        const aqData =
        await aq.json();

        if(
            !aqData.hourly ||
            !aqData.hourly.pm2_5
        ){
            alert("AQI unavailable");
            return;
        }

        const fullName = [

            place.name,
            place.admin1,
            place.country

        ]
        .filter(Boolean)
        .join(", ");

        showResult({

            city:{
                name:fullName
            },

            aqi:
            calculateAQI(
                aqData.hourly.pm2_5[0]
            )

        });

    }

    catch(e){

        alert("Search failed");

    }

}


/* LOCATION */

function getLocation(){

    navigator.geolocation.getCurrentPosition(

        async pos=>{

            const lat =
            pos.coords.latitude;

            const lon =
            pos.coords.longitude;

            let cityName =
            "Your Location";

            try{

                const aq =
                await fetch(

`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`

                );

                const aqData =
                await aq.json();

                showResult({

                    city:{
                        name:cityName
                    },

                    aqi:
                    calculateAQI(
                        aqData.hourly.pm2_5[0]
                    )

                });

            }

            catch(e){

                alert(
                    "AQI unavailable"
                );

            }

        }

    );

}


/* COLORS */

function getAQILevel(aqi){

    if(aqi <= 50)
        return {
            text:"Good",
            color:"#2ecc71"
        };

    if(aqi <= 100)
        return {
            text:"Moderate",
            color:"#f1c40f"
        };

    if(aqi <= 150)
        return {
            text:"Unhealthy",
            color:"#e67e22"
        };

    if(aqi <= 200)
        return {
            text:"Very Unhealthy",
            color:"#e74c3c"
        };

    return {
        text:"Hazardous",
        color:"#8e44ad"
    };

}


/* RESULT */

function showResult(data){

    localStorage.setItem(
        "latestAQI",
        JSON.stringify(data)
    );

    saveHistory(data);

    const level =
    getAQILevel(
        data.aqi
    );

    byId("result").innerHTML = `

        <div class="card">

            <h2>
                ${data.city.name}
            </h2>

            <div class="aqi"
                 style="color:${level.color};">

                ${data.aqi}

            </div>

            <button onclick="goDashboard()">

                ${text[lang].openDashboard}

            </button>

        </div>

    `;

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

let chartInstance =
null;


function renderDashboard(){

    const history =
    JSON.parse(

        localStorage.getItem(
            "aqiHistory"
        )

    ) || [];


    if(chartInstance)
        chartInstance.destroy();


    chartInstance =
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


/* REPORT */

function renderReport(){

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


/* SUGGESTIONS */

async function fetchSuggestions(query){

    const box =
    byId("suggestions");

    if(!box) return;

    if(query.length < 2){

        box.innerHTML = "";
        return;

    }

    try{

        const res =
        await fetch(

`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`

        );

        const data =
        await res.json();

        box.innerHTML = "";

        if(!data.results)
            return;

        data.results.forEach(
            place=>{

                const div =
                document.createElement(
                    "div"
                );

                div.className =
                "suggestion-item";

                div.innerText = [

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

    catch(e){

        console.log(
            "Suggestion failed"
        );

    }

}


/* NAV */

function goDashboard(){
    location.href =
    "dashboard.html";
}


function goReport(){
    location.href =
    "report.html";
}


/* INIT */

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
