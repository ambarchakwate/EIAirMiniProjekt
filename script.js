const TOKEN =
"10125e979cb5b6f41288d714e1a6a7552ba92b76";


let lang =
localStorage.getItem("lang") || "en";


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



function setLang(l){

    lang = l;

    localStorage.setItem(
        "lang",
        l
    );

    applyLang();

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



async function fetchAQI(url){

    const response =
    await fetch(url);


    const json =
    await response.json();


    return json.data;

}



async function searchCity(){

    const city =
    byId("city").value;


    const data =
    await fetchAQI(

        `https://api.waqi.info/feed/${city}/?token=${TOKEN}`

    );


    showResult(data);

}



function getLocation(){

    navigator.geolocation.getCurrentPosition(

        async pos=>{

            const data =
            await fetchAQI(

`https://api.waqi.info/feed/geo:${pos.coords.latitude};${pos.coords.longitude}/?token=${TOKEN}`

            );


            showResult(data);

        }

    );

}



function showResult(data){

    localStorage.setItem(

        "latestAQI",

        JSON.stringify(data)

    );


    saveHistory(data);


    const t =
    text[lang];


    byId("result").innerHTML = `

        <div class="card">

            <h2>
                ${data.city.name}
            </h2>


            <div class="aqi">

                ${data.aqi}

            </div>


            <button
                onclick="goDashboard()">

                ${t.openDashboard}

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



function renderDashboard(){

    const history =

        JSON.parse(

            localStorage.getItem(
                "aqiHistory"
            )

        ) || [];


    const t =
    text[lang];


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
                    t.graph,


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


            AQI :
            ${data.aqi}

        </div>

    `;


    applyLang();

}



function downloadReport(){

    const stored =

    localStorage.getItem(
        "latestAQI"
    );



    if(!stored){

        alert(
            "Search a location first"
        );

        return;

    }



    const data =
    JSON.parse(
        stored
    );



    const location =

        data.city &&
        data.city.name

        ?

        data.city.name

        :

        "Unknown";



    const aqi =

        data.aqi

        ?

        data.aqi

        :

        "Unknown";



    let advice =
    "Good";



    if(aqi > 150){

        advice =
        "Unhealthy";

    }

    else if(aqi > 75){

        advice =
        "Moderate";

    }



    const text =

`AIR QUALITY REPORT

==============================

Location : ${location}

AQI : ${aqi}

Generated : ${new Date().toLocaleString()}

Health Status : ${advice}

==============================
`;



    const blob =

    new Blob(

        [text],

        {

            type:
            "text/plain"

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



    document.body
    .appendChild(
        link
    );



    link.click();



    document.body
    .removeChild(
        link
    );

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

                "keypress",

                function(e){

                    if(
                        e.key === "Enter"
                    ){

                        searchCity();

                    }

                }

            );

        }

    }

);