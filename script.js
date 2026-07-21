// ===============================
// Date Filler - Script Part 1
// Core Functions
// ===============================

const inputBox = document.getElementById("input");
const outputBox = document.getElementById("output");

const pasteBtn = document.getElementById("pasteBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const processBtn = document.getElementById("processBtn");
const copyBtn = document.getElementById("copyBtn");

const downloadTxtBtn = document.getElementById("downloadTxtBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");


// Paste button
pasteBtn.onclick = async () => {

    try {

        const text = await navigator.clipboard.readText();

        inputBox.value = text;

    } catch {

        alert("Unable to access clipboard.");

    }

};


// Upload TXT file
uploadBtn.onclick = () => {

    fileInput.click();

};


fileInput.onchange = () => {

    const file = fileInput.files[0];

    if (!file) return;


    const reader = new FileReader();


    reader.onload = () => {

        inputBox.value = reader.result;

    };


    reader.readAsText(file);

};



// Copy output
copyBtn.onclick = () => {

    navigator.clipboard.writeText(outputBox.value);

    alert("Copied!");

};



// Download TXT
downloadTxtBtn.onclick = () => {

    downloadFile(
        outputBox.value,
        "output.txt",
        "text/plain"
    );

};


// Download CSV
downloadCsvBtn.onclick = () => {

    downloadFile(
        outputBox.value,
        "output.csv",
        "text/csv"
    );

};



function downloadFile(content, filename, type){

    const blob = new Blob(
        [content],
        {
            type:type
        }
    );


    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = filename;

    link.click();

}



// Temporary process button
// Parser will be added in Part 2

processBtn.onclick = () => {


    let games =
        parseGames(
            inputBox.value
        );


    let aligned =
        alignTimeline(
            games
        );



    let days =
        getRollingDays();



    let finalData =
        calculateRollingSum(
            aligned,
            days
        );



    outputBox.value =
        convertToTable(
            finalData
        );


};


    let games =
        parseGames(
            inputBox.value
        );


    let aligned =
        alignTimeline(
            games
        );


    outputBox.value =
        JSON.stringify(
            aligned,
            null,
            2
        );


};

    if(inputBox.value.trim() === ""){

        alert("Paste data first!");

        return;

    }


    outputBox.value =
        "Parser coming in Part 2...\n\n" +
        inputBox.value;

    // ===============================
// Date Filler - Script Part 2
// Roblox Data Parser
// ===============================


function parseGames(text){

    const lines = text.split("\n");

    let games = {};

    let currentGame = null;


    for(let line of lines){

        line = line.trim();


        if(line === ""){
            continue;
        }


        // Ignore image links
        if(line.startsWith("http")){
            continue;
        }



        // Detect game names
        // Example:
        // Tower of Hell        Murder Mystery 2

        if(
            !line.match(/\d{4}-\d{2}-\d{2}/)
        ){

            let names = line.split(/\s{2,}/);


            for(let name of names){

                if(name.trim() !== ""){

                    currentGame = name.trim();


                    if(!games[currentGame]){

                        games[currentGame] = [];

                    }

                }

            }


            continue;

        }




        // Read date + value

        let parts = line.split(/\s+/);


        let dateIndex = parts.findIndex(
            x => x.match(/\d{4}-\d{2}-\d{2}/)
        );


        if(dateIndex === -1){
            continue;
        }


        let date =
            parts[dateIndex]
            + " "
            + parts[dateIndex + 1];



        let value =
            parts[dateIndex + 2];



        if(currentGame && value){

            games[currentGame].push({

                date: new Date(date),

                value: Number(value)

            });

        }

    }


    return games;

}




// Replace temporary process button

processBtn.onclick = () => {


    let text = inputBox.value;


    let games = parseGames(text);



    outputBox.value =
        JSON.stringify(
            games,
            null,
            2
        );


};

};

// ===============================
// Date Filler - Script Part 3
// Timeline Alignment
// ===============================


function alignTimeline(games){


    let allDates = [];


    // Collect every date
    for(let game in games){

        for(let item of games[game]){

            allDates.push(
                item.date
            );

        }

    }



    if(allDates.length === 0){

        return {};

    }



    // Find start and end dates

    let startDate = new Date(
        Math.min(
            ...allDates.map(
                d => d.getTime()
            )
        )
    );


    let endDate = new Date(
        Math.max(
            ...allDates.map(
                d => d.getTime()
            )
        )
    );



    let timeline = [];

    let current = new Date(startDate);



    while(current <= endDate){


        timeline.push(
            new Date(current)
        );


        current.setDate(
            current.getDate() + 1
        );


    }



    let result = {};



    // Build aligned games

    for(let game in games){


        result[game] = {};



        for(let date of timeline){


            let key =
                formatDate(date);



            result[game][key] = 0;


        }



        for(let item of games[game]){


            let key =
                formatDate(item.date);



            result[game][key] =
                item.value;


        }

    }



    return {

        timeline,

        games: result

    };


}





function formatDate(date){

    let year =
        date.getFullYear();


    let month =
        String(
            date.getMonth()+1
        ).padStart(2,"0");


    let day =
        String(
            date.getDate()
        ).padStart(2,"0");



    return (
        year +
        "-" +
        month +
        "-" +
        day +
        " 14:00:00"
    );

}
// ===============================
// Date Filler - Script Part 4
// Rolling Sum Calculator
// ===============================


function getRollingDays(){

    let selected =
        document.getElementById(
            "rollingDays"
        ).value;


    if(selected === "custom"){

        let custom =
            Number(
                document.getElementById(
                    "customDays"
                ).value
            );


        return custom > 0 ? custom : 0;

    }


    return Number(selected);

}




function calculateRollingSum(alignedData, days){


    if(days <= 0){

        return alignedData;

    }



    let result = {

        timeline:
            alignedData.timeline,

        games:{}

    };




    for(let game in alignedData.games){


        let values =
            alignedData.games[game];


        result.games[game] = {};



        let dates =
            Object.keys(values);



        for(let i = 0; i < dates.length; i++){


            let sum = 0;



            let start =
                Math.max(
                    0,
                    i - days + 1
                );



            for(
                let x = start;
                x <= i;
                x++
            ){

                sum +=
                    values[dates[x]];

            }



            result.games[game][dates[i]]
                = sum;


        }

    }


    return result;

}
// ===============================
// Date Filler - Script Part 5
// Output Formatter
// ===============================


function convertToTable(data){


    let output = "";



    let games =
        Object.keys(
            data.games
        );



    // Header

    output += "Date".padEnd(25);



    for(let game of games){

        output +=
            game.padEnd(25);

    }


    output += "\n\n";



    // Rows

    for(let date of data.timeline){


        let formatted =
            formatDate(date);



        output +=
            formatted.padEnd(25);



        for(let game of games){


            let value =
                data.games[game][formatted];



            output +=
                String(value)
                .padEnd(25);


        }



        output += "\n";


    }



    return output;

}
// ===============================
// Date Filler - Script Part 6
// Export Improvements
// ===============================



function convertToCSV(data){


    let csv = "";

    let games =
        Object.keys(
            data.games
        );



    // Header

    csv += "Date";


    for(let game of games){

        csv +=
            "," +
            `"${game}"`;

    }


    csv += "\n";



    // Rows

    for(let date of data.timeline){


        let formatted =
            formatDate(date);



        csv += formatted;



        for(let game of games){


            let value =
                data.games[game][formatted];



            csv +=
                "," +
                value;


        }


        csv += "\n";


    }



    return csv;

}





// Store last processed data

let lastResult = null;



// Update process button to save data

processBtn.onclick = () => {


    let games =
        parseGames(
            inputBox.value
        );


    let aligned =
        alignTimeline(
            games
        );


    let days =
        getRollingDays();



    lastResult =
        calculateRollingSum(
            aligned,
            days
        );



    outputBox.value =
        convertToTable(
            lastResult
        );


};





// Better TXT download

downloadTxtBtn.onclick = () => {


    if(!lastResult){

        alert(
            "Process data first!"
        );

        return;

    }



    downloadFile(
        convertToTable(lastResult),
        "output.txt",
        "text/plain"
    );


};





// Better CSV download

downloadCsvBtn.onclick = () => {


    if(!lastResult){

        alert(
            "Process data first!"
        );

        return;

    }



    downloadFile(
        convertToCSV(lastResult),
        "output.csv",
        "text/csv"
    );


};
