let streamsByCourse = {
    BTech:["CSE","ECE","ME","Civil"],
    MTech:["CSE","ECE","ME","Civil"],
    BCA:["General"],
    MCA:["General"],
    BBA:["General"],
    MBA:["Marketing","Finance","HR"],
    "B.COM":["Commerce"],
    "M.COM":["Commerce"],
    PHD:["Research"]
};

let colleges = {};
let holidays = [];

function updateStreams(){

    let course = document.getElementById("course").value;
    let stream = document.getElementById("stream");

    stream.innerHTML = "";

    streamsByCourse[course].forEach(x=>{
        stream.innerHTML += `<option>${x}</option>`;
    });
}

updateStreams();

function addCourse(){

    let college = document.getElementById("college").value;
    let course = document.getElementById("course").value;
    let stream = document.getElementById("stream").value;
    let semester = document.getElementById("semester").value;
    let subjects = document.getElementById("subjects").value;

    if(!subjects){
        alert("Enter subjects");
        return;
    }

    if(!colleges[college]){
        colleges[college] = [];
    }

    colleges[college].push({
        course,
        stream,
        semester,
        subjects: subjects.split(",").map(s=>s.trim())
    });

    document.getElementById("subjects").value = "";
    document.getElementById("semester").selectedIndex = 0;
    document.getElementById("course").selectedIndex = 0;
    updateStreams();
    
    document.getElementById("stream").selectedIndex = 0;

    showPreview();
}

function showPreview(){

    let html = "";

    for(let college in colleges){

        html += `<h3>${college}</h3>`;

        colleges[college].forEach((c,i)=>{

            html += `<div style="margin-bottom:8px">
            <b>${c.course} ${c.stream} - ${c.semester}</b>
            <button onclick="editCourse('${college}',${i})">Edit</button>
            <button onclick="removeCourse('${college}',${i})">Remove</button><br>`;

            c.subjects.forEach((s,si)=>{
                html += `${s} <button onclick="removeSubject('${college}',${i},${si})">x</button> `;
            });

            html += "</div>";
        });
    }

    preview.innerHTML = html;
}
function removeCourse(college,index){
    colleges[college].splice(index,1);

    if(colleges[college].length===0){
        delete colleges[college];
    }

    showPreview();
}

function removeSubject(college,courseIndex,subjectIndex){
    colleges[college][courseIndex].subjects.splice(subjectIndex,1);
    showPreview();
}
function editCourse(college,index){

    let c = colleges[college][index];

    document.getElementById("course").value = c.course;

    updateStreams();

    document.getElementById("stream").value = c.stream;
    document.getElementById("semester").value = c.semester;
    document.getElementById("subjects").value = c.subjects.join(",");

    colleges[college].splice(index,1);

    if(colleges[college].length===0){
        delete colleges[college];
    }

    showPreview();
}
function addHoliday(){

    let h = holidayDate.value;

    if(h){
        holidays.push(new Date(h).toDateString());
        holidayDate.value="";
        showHolidays();
    }
}

function showHolidays(){

    let html="<b>Holidays:</b> ";

    holidays.forEach((h,i)=>{
        html += `${h} <button onclick="removeHoliday(${i})">x</button> `;
    });

    holidayList.innerHTML = html;
}

function removeHoliday(i){
    holidays.splice(i,1);
    showHolidays();
}

function getNextWorkingDate(date){

    let d = new Date(date);

    while(true){

        let day = d.getDay();

        if(skipSunday.checked && day===0){ d.setDate(d.getDate()+1); continue; }
        if(skipSaturday.checked && day===6){ d.setDate(d.getDate()+1); continue; }
        if(holidays.includes(d.toDateString())){ d.setDate(d.getDate()+1); continue; }

        break;
    }

    return d;
}

function generate(){

    if(Object.keys(colleges).length==0 || !startDate.value){
        alert("Add courses and start date");
        return;
    }

    let gap = Number(document.getElementById("gap").value);
    let slots = Number(document.getElementById("slots").value);

    let set = new Set();

    for(let col in colleges){
        colleges[col].forEach(c=>{
            c.subjects.forEach(s=>set.add(s));
        });
    }

    let subjects = Array.from(set);

    let current = new Date(startDate.value);
    let slotIndex = 0;
    let subjectDates = {};

    subjects.forEach(s=>{

        current = getNextWorkingDate(current);

        subjectDates[s] = {
            date: current.toDateString(),
            slot: (slotIndex%slots==0) ? "Morning" : "Evening"
        };

        slotIndex++;

        if(slotIndex%slots==0) current.setDate(current.getDate()+gap);
    });

    let html = "<table><tr><th>College</th><th>Course</th><th>Stream</th><th>Semester</th><th>Subject</th><th>Date</th><th>Slot</th></tr>";

    for(let col in colleges){
        colleges[col].forEach(c=>{
            c.subjects.forEach(s=>{
                html+=`<tr>
                <td>${col}</td>
                <td>${c.course}</td>
                <td>${c.stream}</td>
                <td>${c.semester}</td>
                <td>${s}</td>
                <td>${subjectDates[s].date}</td>
                <td>${subjectDates[s].slot}</td>
                </tr>`;
            });
        });
    }

    html+="</table>";

    result.innerHTML = html;
}

async function exportPDF(){

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.autoTable({html:"#result table",startY:10});

    doc.save("datesheet.pdf");
}

function exportExcel(){

    let table = document.querySelector("#result table");

    if(!table){ alert("Generate first"); return; }

    let html = table.outerHTML.replace(/ /g,"%20");

    let link=document.createElement("a");
    link.href="data:application/vnd.ms-excel,"+html;
    link.download="datesheet.xls";
    link.click();
}
function logout(){
    sessionStorage.removeItem("loggedIn");
    window.location.replace("login.html");
}


function disableSystem(){
    localStorage.setItem("system","OFF");
    alert("System Disabled by Admin");
    logout();
}
