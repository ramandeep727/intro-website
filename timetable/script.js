function generateTimetable(){

const classes = document.getElementById("classes").value.split(",").map(c=>c.trim());

const subjectInput = document.getElementById("subjects").value;
const teacherInput = document.getElementById("teachers").value;

const days = parseInt(document.getElementById("days").value);
const periods = parseInt(document.getElementById("periods").value);

const lunch = parseInt(document.getElementById("lunch").value)-1;
const teacherLimit = parseInt(document.getElementById("teacherLimit").value);

const dayNames=["Mon","Tue","Wed","Thu","Fri","Sat"];

/* SUBJECT PARSE */

let subjects={};

subjectInput.split(",").forEach(s=>{
let p=s.split("-");
subjects[p[0].trim()] = parseInt(p[1]);
});

/* TEACHERS */

let teachers={};

teacherInput.split(",").forEach(s=>{

let p=s.split("-");
let subject=p[0].trim();
let count=parseInt(p[1]);

teachers[subject]=[];

for(let i=1;i<=count;i++){
teachers[subject].push(subject+"_T"+i);
}

});

/* GLOBAL TEACHER SCHEDULE */

let teacherSchedule={};
let teacherDailyLoad={};

let allTables={};

classes.forEach(cls=>{

let pool=[];

for(let sub in subjects){
for(let i=0;i<subjects[sub];i++){
pool.push(sub);
}
}

/* shuffle */

pool.sort(()=>Math.random()-0.5);

let timetable=[];

for(let d=0;d<days;d++){

let row=[];
let usedToday=[];

for(let p=0;p<periods;p++){

if(p===lunch){
row.push("LUNCH");
continue;
}

/* refill pool if empty */

if(pool.length===0){
for(let sub in subjects){
for(let i=0;i<subjects[sub];i++){
pool.push(sub);
}
}
}

/* choose subject */

let available=pool.filter(s=>!usedToday.includes(s));

if(available.length===0){
available=pool;
}

let subject=available[Math.floor(Math.random()*available.length)];

let teacherAssigned=null;

for(let teacher of teachers[subject]){

if(!teacherSchedule[teacher]) teacherSchedule[teacher]={};
if(!teacherDailyLoad[teacher]) teacherDailyLoad[teacher]={};

let slot=d+"-"+p;

if(!teacherSchedule[teacher][slot]){

let load = teacherDailyLoad[teacher][d] || 0;

if(load < teacherLimit){

teacherAssigned=teacher;
teacherSchedule[teacher][slot]=cls;
teacherDailyLoad[teacher][d]=load+1;

break;

}

}

}

/* assign */

if(teacherAssigned){
row.push(subject+" ("+teacherAssigned+")");
pool.splice(pool.indexOf(subject),1);
usedToday.push(subject);
}
else{
row.push(subject);
}

}

timetable.push(row);

}

allTables[cls]=timetable;

});

/* DISPLAY */

let html="";

for(let cls in allTables){

html+="<h2>Class "+cls+"</h2>";
html+="<table>";

html+="<tr><th>Day</th>";

for(let i=1;i<=periods;i++){
html+="<th>P"+i+"</th>";
}

html+="</tr>";

for(let d=0;d<days;d++){

html+="<tr>";
html+="<td>"+dayNames[d]+"</td>";

for(let p=0;p<periods;p++){
html+="<td>"+allTables[cls][d][p]+"</td>";
}

html+="</tr>";

}

html+="</table>";

}

document.getElementById("output").innerHTML=html;
enableDrag();
updateStats();

}

/* PRINT ONLY TIMETABLE */

function printPage(){

let content=document.getElementById("output").innerHTML;

let win=window.open("");

win.document.write(`
<html>
<head>
<title>Print Timetable</title>
<style>
table{width:100%;border-collapse:collapse;}
th,td{border:1px solid #000;padding:6px;text-align:center;}
th{background:#ddd;}
</style>
</head>
<body>
${content}
</body>
</html>
`);

win.print();

}

/* EXPORT PDF */let teacherData=[];
let subjectData=[];

function loadExcel(){

let teacherFile=document.getElementById("teacherExcel").files[0];
let subjectFile=document.getElementById("subjectExcel").files[0];

readExcel(teacherFile,data=>{
teacherData=data;
console.log("Teachers Loaded",teacherData);
});

readExcel(subjectFile,data=>{
subjectData=data;
console.log("Subjects Loaded",subjectData);
});

}

function readExcel(file,callback){

const reader=new FileReader();

reader.onload=function(e){

let data=new Uint8Array(e.target.result);
let workbook=XLSX.read(data,{type:'array'});

let sheet=workbook.Sheets[workbook.SheetNames[0]];
let json=XLSX.utils.sheet_to_json(sheet);

callback(json);

};

reader.readAsArrayBuffer(file);

}

function exportPDF(){

const element=document.getElementById("output");

html2pdf()
.set({
margin:10,
filename:"school_timetable.pdf",
html2canvas:{scale:2},
jsPDF:{orientation:"landscape"}
})
.from(element)
.save();

}
function toggleDarkMode(){
document.body.classList.toggle("dark");
}

function enableDrag(){

document.querySelectorAll("tbody").forEach(body=>{

new Sortable(body,{
animation:150,
ghostClass:"dragging"
});

});

}
function generateTeacherView(){

let teacherTables={};

for(let teacher in teacherSchedule){

teacherTables[teacher]=[];

}

classes.forEach(cls=>{

let table=allTables[cls];

table.forEach((row,day)=>{

row.forEach((cell,period)=>{

if(cell.includes("(")){

let teacher=cell.split("(")[1].replace(")","");

if(!teacherTables[teacher]) teacherTables[teacher]=[];

teacherTables[teacher].push({
class:cls,
day:day,
period:period
});

}

});

});

});

console.log("Teacher Timetables",teacherTables);

}

let rooms=["R101","R102","R103","LAB1"];
let room=rooms[Math.floor(Math.random()*rooms.length)];

row.push(subject+" ("+teacherAssigned+") ["+room+"]");

function resolveConflict(subject,day,period){

for(let teacher of teachers[subject]){

if(!teacherSchedule[teacher][day+"-"+period]){
return teacher;
}

}

return null;

}

classes.forEach(cls=>{

let subjectPool=[];

subjectData.forEach(s=>{

for(let i=0;i<s.WeeklyPeriods;i++){
subjectPool.push(s.Subject);
}

});

});

let bestScore=999;
let bestTable;

for(let i=0;i<200;i++){

let table=generateAttempt();
let score=countConflicts(table);

if(score<bestScore){
bestScore=score;
bestTable=table;
}

}

function updateStats(){

let classes = document.getElementById("classes").value.split(",");
let subjects = document.getElementById("subjects").value.split(",");
let teachers = document.getElementById("teachers").value.split(",");

document.getElementById("classCount").innerText = classes.length;
document.getElementById("subjectCount").innerText = subjects.length;
document.getElementById("teacherCount").innerText = teachers.length;

let days = document.getElementById("days").value;
let periods = document.getElementById("periods").value;

document.getElementById("periodCount").innerText = days * periods;

}

function filterClass(){

let search = document.getElementById("classSearch").value.toLowerCase();

document.querySelectorAll("#output h2").forEach(title=>{

let table = title.nextElementSibling;

if(title.innerText.toLowerCase().includes(search)){
title.style.display="block";
table.style.display="table";
}else{
title.style.display="none";
table.style.display="none";
}

});

}