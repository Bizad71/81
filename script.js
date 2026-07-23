const cards=document.getElementById("cards");
const btn=document.getElementById("createBtn");
const input=document.getElementById("faWord");
const category=document.getElementById("category");
const loading=document.getElementById("loading");
const searchInput=document.getElementById("searchInput");
const myWords=document.getElementById("myWords");
const myWordsBtn=document.getElementById("myWordsBtn");
const backBtn=document.getElementById("backBtn");
const filterCategory=document.getElementById("filterCategory");
const quizBtn=document.getElementById("quizBtn");
const quizModal=document.getElementById("quizModal");
const quizContent=document.getElementById("quizContent");
const startQuiz=document.getElementById("startQuiz");
let data=JSON.parse(localStorage.getItem("flashcards")||"[]");
let learned=JSON.parse(localStorage.getItem("learnedWords")||"[]");

render();
renderLearned();

btn.onclick=async()=>{

const fa=input.value.trim();

if(!fa)return;

loading.style.display="block";

try{

const res=await fetch(
"https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl=en&dt=t&q="+encodeURIComponent(fa)
);

const json=await res.json();

const en=json[0][0][0];

const card={
id:Date.now(),
fa,
en,
category:category.value
};

data.unshift(card);

localStorage.setItem("flashcards",JSON.stringify(data));

render();

input.value="";

}catch{

alert("خطا در ترجمه");

}

loading.style.display="none";

};

function render(){

cards.innerHTML="";

const keyword=searchInput.value.trim().toLowerCase();

data
.filter(item=>
item.fa.toLowerCase().includes(keyword) ||
item.en.toLowerCase().includes(keyword)
)
.forEach(item=>{

const temp=document.getElementById("cardTemplate").content.cloneNode(true);

const card=temp.querySelector(".card");
const en=temp.querySelector(".en");
const fa=temp.querySelector(".fa");
const cat=temp.querySelector(".category");
const ok=temp.querySelector(".ok");
const del=temp.querySelector(".delete");
const speak=temp.querySelector(".speak");

en.textContent=item.en;
fa.textContent=item.fa;
cat.textContent=item.category;

card.onclick=e=>{

if(
e.target.classList.contains("ok")||
e.target.classList.contains("delete")||
e.target.classList.contains("speak")
)return;

card.classList.toggle("flip");

};

speak.onclick=e=>{

e.stopPropagation();

speechSynthesis.cancel();

const u=new SpeechSynthesisUtterance(item.en);

u.lang="en-US";
u.rate=.9;

speechSynthesis.speak(u);

};

ok.onclick=e=>{

e.stopPropagation();

learned.unshift(item);

data=data.filter(x=>x.id!==item.id);

localStorage.setItem("flashcards",JSON.stringify(data));
localStorage.setItem("learnedWords",JSON.stringify(learned));

render();
renderLearned();

};

del.onclick=e=>{

e.stopPropagation();

if(!confirm("فلش کارت حذف شود؟")) return;

data=data.filter(x=>x.id!==item.id);

localStorage.setItem("flashcards",JSON.stringify(data));

render();

};

cards.appendChild(temp);

});

}

function renderLearned(){

myWords.innerHTML="";

let list=learned;

if(filterCategory.value!=="همه"){

list=learned.filter(x=>x.category===filterCategory.value);

}

list.forEach(item=>{

const temp=document.getElementById("cardTemplate").content.cloneNode(true);

const card=temp.querySelector(".card");
const en=temp.querySelector(".en");
const fa=temp.querySelector(".fa");
const cat=temp.querySelector(".category");
const ok=temp.querySelector(".ok");
const del=temp.querySelector(".delete");
const speak=temp.querySelector(".speak");

en.textContent=item.en;
fa.textContent=item.fa;
cat.textContent=item.category;

ok.remove();

card.onclick=e=>{

if(
e.target.classList.contains("delete")||
e.target.classList.contains("speak")
)return;

card.classList.toggle("flip");

};

speak.onclick=e=>{

e.stopPropagation();

speechSynthesis.cancel();

const u=new SpeechSynthesisUtterance(item.en);

u.lang="en-US";
u.rate=.9;

speechSynthesis.speak(u);

};

del.onclick=e=>{

e.stopPropagation();

if(!confirm("کلمه حذف شود؟")) return;

learned=learned.filter(x=>x.id!==item.id);

localStorage.setItem("learnedWords",JSON.stringify(learned));

renderLearned();

};

myWords.appendChild(temp);

});

}

filterCategory.onchange=()=>{

renderLearned();

};

myWordsBtn.onclick=()=>{

document.querySelector(".creator").style.display="none";
cards.style.display="none";
loading.style.display="none";

myWords.style.display="grid";
filterCategory.style.display="block";

myWordsBtn.style.display="none";
backBtn.style.display="block";

renderLearned();

};

backBtn.onclick=()=>{

document.querySelector(".creator").style.display="flex";
cards.style.display="grid";

myWords.style.display="none";

filterCategory.style.display="none";
filterCategory.value="همه";

myWordsBtn.style.display="block";
backBtn.style.display="none";

};
searchInput.addEventListener("input",()=>{
render();
});

//================== QUIZ ==================

const questionNumber=document.getElementById("questionNumber");
const questionText=document.getElementById("questionText");
const progressBar=document.getElementById("progressBar");
const answerBtns=document.querySelectorAll(".answerBtn");
const quizStart=document.getElementById("quizStart");
const quizGame=document.getElementById("quizGame");
const quizResult=document.getElementById("quizResult");
const scoreText=document.getElementById("scoreText");
const detailText=document.getElementById("detailText");
const finishQuiz=document.getElementById("finishQuiz");

let quizQuestions=[];
let currentQuestion=0;
let score=0;
let allWords=[];

quizBtn.onclick=()=>{

allWords=[...data,...learned];

console.log("Flashcards:", data.length);
console.log("Learned:", learned.length);
console.log("All:", allWords.length);
if(allWords.length<10){

alert("حداقل باید ۱۰ کلمه داشته باشید.");

return;

}

quizModal.style.display="flex";

quizStart.style.display="block";
quizGame.style.display="none";
quizResult.style.display="none";

};

quizModal.onclick=e=>{

if(e.target===quizModal){

quizModal.style.display="none";

}

};

startQuiz.onclick=()=>{
console.log("Quiz questions:", quizQuestions);
console.log("All words:", allWords);
  
quizQuestions=[...allWords]
.sort(()=>Math.random()-0.5)
.slice(0,10);

currentQuestion=0;
score=0;

quizStart.style.display="none";
quizGame.style.display="block";
quizResult.style.display="none";
console.log("Starting quiz...");
showQuestion();

};

function showQuestion(){

const q=quizQuestions[currentQuestion];

questionNumber.textContent=
`سؤال ${currentQuestion+1} از 10`;

progressBar.style.width=
((currentQuestion)/10*100)+"%";

questionText.textContent=q.fa;

let answers=[q.en];

let randoms=allWords
.filter(x=>x.id!==q.id)
.sort(()=>Math.random()-0.5)
.slice(0,3);

randoms.forEach(x=>answers.push(x.en));

answers=answers.sort(()=>Math.random()-0.5);

const answerBtns=document.querySelectorAll(".answerBtn");

answerBtns.forEach((btn,index)=>{

btn.disabled=false;

btn.style.background="#4d9b7d";

btn.textContent=answers[index];

btn.onclick=()=>{

answerBtns.forEach(b=>b.disabled=true);

if(btn.textContent===q.en){

score++;

btn.style.background="#22c55e";

}else{

btn.style.background="#ef4444";

answerBtns.forEach(b=>{

if(b.textContent===q.en){

b.style.background="#22c55e";

}

});

}

setTimeout(nextQuestion,1000);

};

});

}

function nextQuestion(){

currentQuestion++;

if(currentQuestion>=10){

showResult();

return;

}

showQuestion();

}

function showResult(){

quizGame.style.display="none";

quizResult.style.display="block";

progressBar.style.width="100%";

scoreText.textContent=`امتیاز شما : ${score} از 10`;

let msg="";

if(score==10){

msg="🏆 عالی بود! همه جواب‌ها درست بودند.";

}else if(score>=8){

msg="🌟 خیلی خوب! فقط چند اشتباه داشتی.";

}else if(score>=6){

msg="👍 خوب بود، کمی بیشتر تمرین کن.";

}else if(score>=4){

msg="📚 نیاز به تمرین بیشتری داری.";

}else{

msg="💪 دوباره امتحان کن، موفق میشی.";

}

detailText.textContent=msg;

}

finishQuiz.onclick=()=>{

quizModal.style.display="none";

quizStart.style.display="block";

quizGame.style.display="none";

quizResult.style.display="none";

progressBar.style.width="0%";

};

//================ WORD GAME ================

const gameBtn=document.getElementById("gameBtn");
const wordGame=document.getElementById("wordGame");
const fallingArea=document.getElementById("fallingArea");
const gameTarget=document.getElementById("gameTarget");
const gameScore=document.getElementById("gameScore");
const closeGame=document.getElementById("closeGame");


let gameScoreNum=0;
let targetWord=null;
let gameTimer;


gameBtn.onclick=()=>{

let allWords=[...data,...learned];

if(allWords.length<4){

alert("حداقل ۴ کلمه لازم است");

return;

}


wordGame.style.display="block";

gameScoreNum=0;

gameScore.textContent=0;

startWordGame();

};



function startWordGame(){

let allWords=[...data,...learned];

targetWord=
allWords[Math.floor(Math.random()*allWords.length)];


gameTarget.textContent=
"معنی: "+targetWord.fa;


fallingArea.innerHTML="";


clearInterval(gameTimer);


gameTimer=setInterval(()=>{


createFallingWord(allWords);


},1200);


}



function createFallingWord(allWords){


let correct=targetWord.en;


let words=[correct];


while(words.length<4){

let w=
allWords[Math.floor(Math.random()*allWords.length)].en;


if(!words.includes(w)){

words.push(w);

}

}


words.sort(()=>Math.random()-0.5);


words.forEach(word=>{


let div=document.createElement("div");

div.className="fallWord";

div.textContent=word;


div.style.left=
Math.random()*80+"%";


div.style.animationDuration=
(3+Math.random()*3)+"s";



div.onclick=()=>{


if(word===correct){


gameScoreNum++;

gameScore.textContent=gameScoreNum;

nextGameWord();


}else{

alert("باختی 😢 امتیاز: "+gameScoreNum);

endGame();

}


};


fallingArea.appendChild(div);



setTimeout(()=>{

if(div.parentNode){

if(word===correct){

alert("فرصت از دست رفت 😢");

endGame();

}

div.remove();

}


},6000);



});


}



function nextGameWord(){

targetWord=
[...data,...learned]
[Math.floor(Math.random()*([...data,...learned].length))];


gameTarget.textContent=
"معنی: "+targetWord.fa;

}



function endGame(){

clearInterval(gameTimer);

wordGame.style.display="none";

fallingArea.innerHTML="";

}



closeGame.onclick=endGame;

//================ BACKUP =================

const backupBtn=document.getElementById("backupBtn");
const restoreBtn=document.getElementById("restoreBtn");
const restoreFile=document.getElementById("restoreFile");


// گرفتن بکاپ
backupBtn.onclick=()=>{

const backup={

flashcards:data,

learnedWords:learned,

bestScore:Number(localStorage.getItem("bestScore")||0)

};

const blob=new Blob(
[JSON.stringify(backup,null,2)],
{type:"application/json"}
);

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="flashcards-backup.json";

document.body.appendChild(a);

a.click();

a.remove();

setTimeout(()=>{
URL.revokeObjectURL(url);
},500);

};


// انتخاب فایل
restoreBtn.onclick=()=>{

restoreFile.click();

};


// بازیابی
restoreFile.onchange=e=>{

const file=e.target.files[0];

if(!file)return;

const reader=new FileReader();

reader.onload=()=>{

try{

const backup=JSON.parse(reader.result);

if(!backup.flashcards || !backup.learnedWords){

alert("❌ فایل معتبر نیست.");

return;

}

const addMode=confirm(
"OK = اضافه به کلمات فعلی\n\nCancel = جایگزین کامل"
);

if(addMode){

const flashMap=new Map();

data.forEach(x=>{
flashMap.set(x.fa+"|"+x.en,x);
});

backup.flashcards.forEach(x=>{
flashMap.set(x.fa+"|"+x.en,x);
});

data=[...flashMap.values()];


const learnedMap=new Map();

learned.forEach(x=>{
learnedMap.set(x.fa+"|"+x.en,x);
});

backup.learnedWords.forEach(x=>{
learnedMap.set(x.fa+"|"+x.en,x);
});

learned=[...learnedMap.values()];

}else{

data=backup.flashcards;

learned=backup.learnedWords;

}

localStorage.setItem(
"flashcards",
JSON.stringify(data)
);

localStorage.setItem(
"learnedWords",
JSON.stringify(learned)
);

if(backup.bestScore!=null){

localStorage.setItem(
"bestScore",
backup.bestScore
);

}

alert("✅ بکاپ با موفقیت بازیابی شد.");

location.reload();

}catch(err){

console.error(err);

alert("❌ فایل بکاپ خراب یا نامعتبر است.");

}

};

reader.readAsText(file);

restoreFile.value="";

};