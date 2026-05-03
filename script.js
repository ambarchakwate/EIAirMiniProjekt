const TOKEN = "10125e979cb5b6f41288d714e1a6a7552ba92b76";


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



function calculateAQI(pm25){

    let aqi = 0;


    if(pm25 <= 12)
        aqi = (pm25 / 12) * 50;


    else if(pm25 <= 35)
        aqi =
        ((pm25 - 12) / 23)
        * 50 + 50;


    else if(pm25 <= 55)
        aqi =
        ((pm25 - 35) / 20)
        * 50 + 100;


    else if(pm25 <= 150)
        aqi =
        ((pm25 - 55) / 95)
        * 50 + 150;


    else
        aqi =
        ((pm25 - 150) / 100)
        * 100 + 200;


    return Math.round(aqi);

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
        !geoData.results ||
        !geoData.results.length
    ){

        alert("City not found");
        return;

    }


    const place =
    geoData.results[0];


    const lat =
    place.latitude;


    const lon =
    place.longitude;


    const aq =
    await fetch(

`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`

    );


    const aqData =
    await aq.json();


    const pm25 =
    aqData.hourly.pm2_5[0];


    const aqi =
    calculateAQI(pm25);


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

        aqi:aqi

    });

}



/* LOCATION */

function getLocation(){

    navigator.geolocation.getCurrentPosition(

        async pos=>{

            const lat =
            pos.coords.latitude;


            const lon =
            pos.coords.longitude;


            let locationName =
            "Current Location";


            const geo =
            await fetch(

`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`

            );


            const geoData =
            await geo.json();


            if(
                geoData.address
            ){

                const a =
                geoData.address;


                locationName = [

                    a.city ||
                    a.town ||
                    a.village,

                    a.state,

                    a.country

                ]
                .filter(Boolean)
                .join(", ");

            }


            const aq =
            await fetch(

`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5`

            );


            const aqData =
            await aq.json();


            const pm25 =
            aqData.hourly.pm2_5[0];


            const aqi =
            calculateAQI(pm25);


            showResult({

                city:{
                    name:locationName
                },

                aqi:aqi

            });

        }

    );

}



/* RESULT */

function showResult(data){

    localStorage.setItem(
        "latestAQI",
        JSON.stringify(data)
    );


    saveHistory(data);


    byId("result")
    .innerHTML = `

        <div class="card">

            <h2>
                ${data.city.name}
            </h2>

            <div class="aqi">
                ${data.aqi}
            </div>

            <button onclick="goDashboard()">

                ${text[lang]
                .openDashboard}

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
                    text[lang]
                    .graph,


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

            ${text[lang].aqi}:
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


    const report = `

AIR QUALITY REPORT

Location:
${data.city.name}

AQI:
${data.aqi}

Generated:
${new Date()
.toLocaleString()}

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



/* SUGGESTIONS */

async function fetchSuggestions(query){

    const box =
    byId("suggestions");


    if(
        !box ||
        query.length < 2
    ){

        box.innerHTML = "";
        return;

    }


    const res =
    await fetch(

`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`

    );


    const data =
    await res.json();


    box.innerHTML = "";


    data.forEach(place=>{

        const div =
        document.createElement(
            "div"
        );


        div.className =
        "suggestion-item";


        div.innerText =
        place.display_name;


        div.onclick =
        ()=>{

            byId("city")
            .value =
            place.display_name;


            box.innerHTML =
            "";

        };


        box.appendChild(
            div
        );

    });

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
