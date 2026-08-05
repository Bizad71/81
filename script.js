const cards=document.getElementById("cards");
const btn=document.getElementById("createBtn");
const input=document.getElementById("faWord");
const category=document.getElementById("category");
const langSelect=document.getElementById("langSelect");
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


// ذخیره اطلاعات
let data=JSON.parse(
localStorage.getItem("flashcards") || "[]"
);

let learned=JSON.parse(
localStorage.getItem("learnedWords") || "[]"
);


// زبان انتخابی
let currentLang=
localStorage.getItem("language") || "en";


// تنظیم زبان در صفحه
if(langSelect){

langSelect.value=currentLang;

langSelect.onchange=()=>{

currentLang=langSelect.value;

localStorage.setItem(
"language",
currentLang
);

render();
renderLearned();

};

}


// نمایش اولیه
render();
renderLearned();



// ساخت فلش کارت
btn.onclick=async()=>{

const fa=input.value.trim();


if(!fa)return;


loading.style.display="block";


try{


const res=await fetch(

"https://translate.googleapis.com/translate_a/single?client=gtx&sl=fa&tl="
+
currentLang+
"&dt=t&q="
+
encodeURIComponent(fa)

);


const json=await res.json();


const translate=json[0][0][0];


const card={

id:Date.now(),

fa:fa,

en:translate,

category:category.value,

lang:currentLang

};


data.unshift(card);


localStorage.setItem(

"flashcards",

JSON.stringify(data)

);


render();


input.value="";


}

catch{

alert("خطا در ترجمه");

}


loading.style.display="none";


};



// نمایش کارت‌ها
function render(){


cards.innerHTML="";


const keyword=
searchInput.value
.trim()
.toLowerCase();



data

.filter(item=>

item.lang===currentLang &&

(

item.fa.toLowerCase()
.includes(keyword)

||

item.en.toLowerCase()
.includes(keyword)

)

)

.forEach(item=>{


const temp=
document
.getElementById("cardTemplate")
.content
.cloneNode(true);



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

e.target.classList.contains("ok")

||

e.target.classList.contains("delete")

||

e.target.classList.contains("speak")

)

return;



card.classList.toggle("flip");


};



speak.onclick=e=>{


e.stopPropagation();


speechSynthesis.cancel();


const u=
new SpeechSynthesisUtterance(item.en);


u.lang=
currentLang==="de"
?
"de-DE"
:
"en-US";


u.rate=.9;


speechSynthesis.speak(u);


};



ok.onclick=e=>{


e.stopPropagation();


learned.unshift(item);


data=data.filter(

x=>x.id!==item.id

);


localStorage.setItem(
"flashcards",
JSON.stringify(data)
);


localStorage.setItem(
"learnedWords",
JSON.stringify(learned)
);



render();

renderLearned();


};



del.onclick=e=>{


e.stopPropagation();



if(!confirm("فلش کارت حذف شود؟"))
return;



data=data.filter(
x=>x.id!==item.id
);



localStorage.setItem(
"flashcards",
JSON.stringify(data)
);



render();


};



cards.appendChild(temp);


});


}
function renderLearned(){

myWords.innerHTML="";


let list=learned.filter(x=>
x.lang===currentLang
);



if(filterCategory.value!=="همه"){

list=list.filter(x=>
x.category===filterCategory.value
);

}



list.forEach(item=>{


const temp=
document
.getElementById("cardTemplate")
.content
.cloneNode(true);



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

e.target.classList.contains("delete")

||

e.target.classList.contains("speak")

)

return;


card.classList.toggle("flip");


};



speak.onclick=e=>{


e.stopPropagation();


speechSynthesis.cancel();


const u=
new SpeechSynthesisUtterance(item.en);



u.lang=
currentLang==="de"
?
"de-DE"
:
"en-US";


u.rate=.9;


speechSynthesis.speak(u);


};



del.onclick=e=>{


e.stopPropagation();


if(!confirm("کلمه حذف شود؟"))
return;



learned=
learned.filter(x=>
x.id!==item.id
);



localStorage.setItem(
"learnedWords",
JSON.stringify(learned)
);



renderLearned();


};



myWords.appendChild(temp);


});


}



filterCategory.onchange=()=>{

renderLearned();

};



// نمایش کلمات یادگرفته شده

myWordsBtn.onclick=()=>{


document.querySelector(".creator")
.style.display="none";


cards.style.display="none";


loading.style.display="none";


myWords.style.display="grid";


filterCategory.style.display="block";


myWordsBtn.style.display="none";


backBtn.style.display="block";


renderLearned();


};



// برگشت

backBtn.onclick=()=>{


document.querySelector(".creator")
.style.display="flex";


cards.style.display="grid";


myWords.style.display="none";


filterCategory.style.display="none";


filterCategory.value="همه";


myWordsBtn.style.display="block";


backBtn.style.display="none";


};



// جستجو

searchInput.addEventListener(
"input",
()=>{

render();

}
);



// ================= QUIZ =================


const questionNumber=
document.getElementById("questionNumber");

const questionText=
document.getElementById("questionText");

const progressBar=
document.getElementById("progressBar");

const quizStart=
document.getElementById("quizStart");

const quizGame=
document.getElementById("quizGame");

const quizResult=
document.getElementById("quizResult");

const scoreText=
document.getElementById("scoreText");

const detailText=
document.getElementById("detailText");

const finishQuiz=
document.getElementById("finishQuiz");


let quizQuestions=[];

let currentQuestion=0;

let score=0;

let allWords=[];



quizBtn.onclick=()=>{


allWords=
[...data,...learned]
.filter(x=>x.lang===currentLang);



if(allWords.length<10){

alert("حداقل ۱۰ کلمه لازم است");

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


quizQuestions=
[...allWords]
.sort(()=>Math.random()-0.5)
.slice(0,10);



currentQuestion=0;

score=0;



quizStart.style.display="none";

quizGame.style.display="block";

quizResult.style.display="none";


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



let randoms=
allWords
.filter(x=>x.id!==q.id)
.sort(()=>Math.random()-0.5)
.slice(0,3);



randoms.forEach(x=>
answers.push(x.en)
);



answers.sort(()=>Math.random()-0.5);



const buttons=
document.querySelectorAll(".answerBtn");



buttons.forEach((button,index)=>{


button.disabled=false;

button.style.background="#4d9b7d";


button.textContent=answers[index];



button.onclick=()=>{


buttons.forEach(b=>
b.disabled=true
);



const u=
new SpeechSynthesisUtterance(
button.textContent
);



u.lang=
currentLang==="de"
?
"de-DE"
:
"en-US";


speechSynthesis.speak(u);



if(button.textContent===q.en){


score++;


button.style.background="#22c55e";


}else{


button.style.background="#ef4444";



buttons.forEach(b=>{


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



scoreText.textContent=
`امتیاز شما : ${score} از 10`;



let msg="";



if(score===10){

msg="🏆 عالی بود!";

}
else if(score>=8){

msg="🌟 خیلی خوب!";

}
else if(score>=6){

msg="👍 خوب بود.";

}
else{

msg="📚 بیشتر تمرین کن.";

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




//================ BACKUP =================


const backupBtn=document.getElementById("backupBtn");
const restoreBtn=document.getElementById("restoreBtn");
const restoreFile=document.getElementById("restoreFile");



// گرفتن بکاپ

if(backupBtn){

backupBtn.onclick=()=>{


const backup={


flashcards:data,


learnedWords:learned,


language:currentLang,


bestScore:Number(
localStorage.getItem("bestScore")||0
)


};



const blob=new Blob(

[
JSON.stringify(backup,null,2)
],

{
type:"application/json"
}

);



const url=
URL.createObjectURL(blob);



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


}




// انتخاب فایل بازیابی

if(restoreBtn){

restoreBtn.onclick=()=>{


restoreFile.click();



};

}





// بازیابی بکاپ

if(restoreFile){


restoreFile.onchange=e=>{


const file=e.target.files[0];


if(!file)return;



const reader=new FileReader();



reader.onload=()=>{


try{


const backup=
JSON.parse(reader.result);



if(
!backup.flashcards ||
!backup.learnedWords
){

alert("❌ فایل معتبر نیست.");

return;

}




const addMode=
confirm(
"OK = اضافه کردن به کلمات فعلی\n\nCancel = جایگزینی کامل"
);




if(addMode){



const flashMap=new Map();



data.forEach(x=>{

flashMap.set(
x.fa+"|"+x.en,
x
);

});



backup.flashcards.forEach(x=>{

flashMap.set(
x.fa+"|"+x.en,
x
);

});



data=[
...flashMap.values()
];





const learnedMap=new Map();



learned.forEach(x=>{

learnedMap.set(
x.fa+"|"+x.en,
x
);

});



backup.learnedWords.forEach(x=>{

learnedMap.set(
x.fa+"|"+x.en,
x
);

});



learned=[
...learnedMap.values()
];



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



if(backup.language){


currentLang=backup.language;


localStorage.setItem(
"language",
currentLang
);


}



alert(
"✅ بکاپ با موفقیت بازیابی شد."
);



location.reload();



}

catch(err){


console.error(err);


alert(
"❌ فایل بکاپ خراب است."
);


}


};



reader.readAsText(file);


restoreFile.value="";


};


}
const downloadSelect = document.getElementById("downloadSelect");

if(downloadSelect){

downloadSelect.onchange = function(){

    const link = document.createElement("a");

    link.href = this.value;

    link.download = "";

    document.body.appendChild(link);

    link.click();

    link.remove();

    this.selectedIndex = 0;

};

}
document.getElementById("restorePreset").onchange = async function () {

    const res = await fetch(this.value);

    const backup = await res.json();

    data = backup.flashcards;
    learned = backup.learnedWords;

    localStorage.setItem("flashcards", JSON.stringify(data));
    localStorage.setItem("learnedWords", JSON.stringify(learned));

    location.reload();

};
//================ MEMORY GAME =================

const memoryBtn = document.getElementById("memoryBtn");
const memoryModal = document.getElementById("memoryModal");
const startMemory = document.getElementById("startMemory");
const memoryStart = document.getElementById("memoryStart");
const memoryGame = document.getElementById("memoryGame");
const memoryGrid = document.getElementById("memoryGrid");

let memoryWords = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let startTime = 0;

memoryBtn.onclick = () => {

    let all = [...data, ...learned]
        .filter(x => x.lang === currentLang);

    if (all.length < 12) {

        alert("حداقل ۱۲ کلمه لازم است");
        return;

    }

    memoryModal.style.display = "flex";
    memoryStart.style.display = "block";
    memoryGame.style.display = "none";

};

memoryModal.onclick = e => {

    if (e.target === memoryModal) {

        memoryModal.style.display = "none";

    }

};

startMemory.onclick = () => {

    let all = [...data, ...learned]
        .filter(x => x.lang === currentLang);

    memoryWords = all
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);

    let cards = [];

    memoryWords.forEach(item => {

cards.push({
    pair: item.fa + "|" + item.en,
    text: item.fa
});

cards.push({
    pair: item.fa + "|" + item.en,
    text: item.en
});

    });

    cards.sort(() => Math.random() - 0.5);

    memoryGrid.innerHTML = "";

    firstCard = null;
    secondCard = null;
    matchedPairs = 0;
    moves = 0;
    lockBoard = false;
    startTime = Date.now();

    cards.forEach(card => {

        const div = document.createElement("div");

        div.className = "memoryCard";

        div.textContent = card.text;

div.dataset.pair = card.pair;

        div.onclick = () => selectMemoryCard(div);

        memoryGrid.appendChild(div);

    });

    memoryStart.style.display = "none";
    memoryGame.style.display = "block";

};
function selectMemoryCard(card){

    if(lockBoard) return;

    if(card.classList.contains("correct")) return;

    if(card===firstCard) return;

    card.classList.add("selected");

    if(!firstCard){

        firstCard=card;
        return;

    }

    secondCard=card;

    lockBoard=true;

    moves++;

   if(firstCard.dataset.pair===secondCard.dataset.pair){

        firstCard.classList.remove("selected");
        secondCard.classList.remove("selected");

        firstCard.classList.add("correct");
        secondCard.classList.add("correct");

        firstCard=null;
        secondCard=null;

        lockBoard=false;

        matchedPairs++;

        if(matchedPairs===memoryWords.length){

            const sec=Math.floor((Date.now()-startTime)/1000);

            setTimeout(()=>{

                alert(
`🎉 تبریک

زمان: ${sec} ثانیه

حرکت: ${moves}`
                );

                memoryModal.style.display="none";

            },300);

        }

    }else{

        firstCard.classList.remove("selected");
        secondCard.classList.remove("selected");

        firstCard.classList.add("wrong");
        secondCard.classList.add("wrong");

        setTimeout(()=>{

            firstCard.classList.remove("wrong");
            secondCard.classList.remove("wrong");

            firstCard=null;
            secondCard=null;

            lockBoard=false;

        },800);

    }

}
