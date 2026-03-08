const SHEET_ID = "1kWJoIXDPWUjw4NCgKolCCtHdfPuyc_hUA8np7pejCDg";
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/Sheet1`;

let sheetData = [];

const collegeData = {

"Chandigarh Engineering College (CEC)":{

BTech:["CSE","ECE","ME","AIML","AIDS","CIVIL","CSE-DS","CSE-IOT","RAI"],
MTech:["CSE","ECE","ME","AIML","AIDS","CIVIL","CSE-DS","CSE-IOT","RAI"],
MBA:["General","MBA-BA","MBA-DM"]

},

"Chandigarh College of Engineering (CCE)":{

BTech:["Civil","ME"],
MTech:["Civil"]

},

"Chandigarh School of Business (CSB)":{

BBA:["General"],
BCA:["General"],
BAJMC:["General"],
BCom:["General"],
MBA:["General","MBA-FT",],
BSc:["B.Sc-FD","B.Sc-MM","B.Sc-IT","B.Sc-GWD","B.Sc-CS","B.Sc-RIT","B.Sc-BT","B.Sc-MLS","B.Sc-OTT","B.Sc-AOTT","B.Sc-FS","B.Sc-N&D"],
MCA:["General"]

},

"Chandigarh Pharmacy College (CPC)":{

BPharma:["General"],



},

"CGC University":{

BTech:["CSE","ECE","ME","Civil"],
MBA:["Marketing","Finance","HR"],
BBA:["General"],
BCA:["General"]


}


};

let colleges = {};
let holidays = [];

function updateCourses(){

let college = document.getElementById("college").value;
let courseSelect = document.getElementById("course");

courseSelect.innerHTML="";

let courses = Object.keys(collegeData[college]);

courses.forEach(c=>{
courseSelect.innerHTML += `<option value="${c}">${c}</option>`;
});

updateStreams();

}
/* STREAM UPDATE */

function updateStreams(){

let college = document.getElementById("college").value;
let course = document.getElementById("course").value;
let streamSelect = document.getElementById("stream");

streamSelect.innerHTML="";

let streams = collegeData[college][course];

streams.forEach(s=>{
streamSelect.innerHTML += `<option>${s}</option>`;
});

}
/* ADD COURSE */

function addCourse(){

let college = document.getElementById("college").value;
let course = document.getElementById("course").value;
let stream = document.getElementById("stream").value;
let semester = document.getElementById("semester").value;
let subjectsInput = document.getElementById("subjects").value;

if(!subjectsInput){
alert("Enter subjects");
return;
}

let subjects = [];

subjectsInput.split(",").forEach(s=>{

let parts = s.split("|");

if(parts.length < 2){
alert("Use format: CODE|Subject Name");
return;
}

subjects.push({
code: parts[0].trim(),
name: parts[1].trim()
});

});

if(!colleges[college]){
colleges[college] = [];
}

colleges[college].push({
course,
stream,
semester,
subjects
});

document.getElementById("subjects").value="";

showPreview();

}

/* PREVIEW */

function showPreview(){

let preview = document.getElementById("preview");

let html = "";

for(let college in colleges){

html += `<h3>${college}</h3>`;

colleges[college].forEach((c,i)=>{

html += `<div style="margin-bottom:10px">

<b>${c.course} ${c.stream} - ${c.semester}</b>

<button onclick="editCourse('${college}',${i})">Edit</button>
<button onclick="removeCourse('${college}',${i})">Remove</button>

<br>`;

c.subjects.forEach((s,si)=>{

html += `${s.code} - ${s.name}
<button onclick="removeSubject('${college}',${i},${si})">x</button> `;

});

html += "</div>";

});

}

preview.innerHTML = html;

}

/* REMOVE */

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

/* EDIT */

function editCourse(college,index){

let c = colleges[college][index];

document.getElementById("course").value = c.course;
updateStreams();

document.getElementById("stream").value = c.stream;
document.getElementById("semester").value = c.semester;

document.getElementById("subjects").value =
c.subjects.map(s=>`${s.code}|${s.name}`).join(",");

removeCourse(college,index);

}

/* HOLIDAYS */

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

/* WORKING DATE */

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

/* GENERATE DATESHEET */

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
c.subjects.forEach(s=>{
set.add(JSON.stringify(s));
});
});
}

let subjects = Array.from(set).map(s=>JSON.parse(s));

let current = new Date(startDate.value);
let slotIndex = 0;
let subjectDates = {};

subjects.forEach(s=>{

current = getNextWorkingDate(current);

let key = JSON.stringify(s);

subjectDates[key] = {
date: current.toDateString(),
slot:(slotIndex%slots==0)
? "9:00 AM - 12:00 PM"
: "2:00 PM - 5:00 PM"
};

slotIndex++;

if(slotIndex%slots==0){
current.setDate(current.getDate()+gap);
}

});

/* BUILD TABLE */

let html=`<table>
<tr>
<th>College</th>
<th>Course</th>
<th>Stream</th>
<th>Semester</th>
<th>Subject Code</th>
<th>Subject</th>
<th>Date</th>
<th>Time</th>
</tr>`;

for(let col in colleges){

colleges[col].forEach(c=>{

c.subjects.forEach(s=>{

let key = JSON.stringify(s);

html += `<tr>

<td>${col}</td>
<td>${c.course}</td>
<td>${c.stream}</td>
<td>${c.semester}</td>
<td>${s.code}</td>
<td>${s.name}</td>
<td>${subjectDates[key].date}</td>
<td>${subjectDates[key].slot}</td>

</tr>`;

});

});

}

html += "</table>";

result.innerHTML = html;

}

/* EXPORT PDF */

function exportPDF(){

let table = document.querySelector("#result table");

if(!table){
alert("Generate DateSheet first");
return;
}

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

let y = 15;

/* HEADER */

doc.setFontSize(18);
doc.text("CGC UNIVERSITY",105,y,{align:"center"});
y+=8;

doc.setFontSize(12);
doc.text("Office of Controller of Examination",105,y,{align:"center"});
y+=8;

doc.text("End Semester Examination Date Sheet",105,y,{align:"center"});
y+=10;

let year = new Date().getFullYear();

doc.setFontSize(11);
doc.text("Session: "+year,14,y);

y+=10;

/* TABLE */

doc.autoTable({
html: table,
startY: y,
styles:{fontSize:9},
headStyles:{fillColor:[37,99,235]}
});

/* SIGNATURE */

let finalY = doc.lastAutoTable.finalY + 20;

doc.text("Controller of Examination",150,finalY);

doc.save("CGC_DateSheet.pdf");

}

/* EXPORT EXCEL */

function exportExcel(){

let table = document.querySelector("#result table");

if(!table){
alert("Generate first");
return;
}

let html = table.outerHTML.replace(/ /g,"%20");

let link = document.createElement("a");

link.href="data:application/vnd.ms-excel,"+html;
link.download="datesheet.xls";
link.click();

}

/* LOGIN */

function logout(){

sessionStorage.removeItem("loggedIn");
window.location.replace("login.html");

}

function disableSystem(){

localStorage.setItem("system","OFF");
alert("System Disabled by Admin");
logout();

}

/* GOOGLE SHEET */

fetch(SHEET_URL)
.then(res => res.json())
.then(data => {
sheetData = data;
})
.catch(()=>{
alert("Google Sheet not connected");
});

/* EXCEL UPLOAD */

function uploadExcel(){

let file = document.getElementById("excelFile").files[0];

if(!file){
alert("Select Excel file");
return;
}

let reader = new FileReader();

reader.onload=function(e){

let data = new Uint8Array(e.target.result);
let workbook = XLSX.read(data,{type:"array"});

let sheet = workbook.Sheets[workbook.SheetNames[0]];
let rows = XLSX.utils.sheet_to_json(sheet);

rows.forEach(r=>{

let college=r.College;
let course=r.Course;
let stream=r.Stream;
let semester=r.Semester;

let parts=r.Subject.split("|");

let subject={
code:parts[0].trim(),
name:parts[1].trim()
};

if(!colleges[college]){
colleges[college]=[];
}

let existing=colleges[college].find(c=>
c.course===course &&
c.stream===stream &&
c.semester===semester
);

if(existing){
existing.subjects.push(subject);
}else{
colleges[college].push({
course,
stream,
semester,
subjects:[subject]
});
}

});

showPreview();

};

reader.readAsArrayBuffer(file);

}
updateCourses();