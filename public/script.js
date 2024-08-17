//hambarger menu
document.addEventListener("DOMContentLoaded", () => {
  const hambargerMenu = document.getElementById("hambergarMenuButton");
  const menu = document.getElementById("hambergarMenu");
  hambargerMenu.addEventListener("click", () => {
    menu.classList.toggle("is-active");
  });

  //設定した期間をfirebaseに保管
  //読み込んだときは最後に保存したデータを表示
  //なければその時の1月1日をとりあえず設定
  const saveDate = document.getElementById("saveDatePeriod");
  saveDate.addEventListener("click", async (event) => {
    const docRef = doc(db, "datePeriod", "datePeriod");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await saveDatePeriod();
    } else {
      const startDate = document.getElementById("startDate");
      const endDate = document.getElementById("endDate");
      const newStartDate = startDate.value;
      const newEndDate = endDate.value;
      await newSaveDatePeriod(newStartDate, newEndDate);
    }
    console.log("saveDatePeriod");
  });
});
//loadDatePeriod
window.addEventListener("load", loadDatePeriod);

async function saveDatePeriod() {
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const docRef = doc(db, "datePeriod", "datePeriod");
  const docSnap = getDoc(docRef);
  try {
    const user = auth.currentUser;
    if (user) {
      setDoc(docRef, {
        startDate: startDate.value,
        endDate: endDate.value,
        userid: user.uid,
      });
    }
  } catch (e) {
    console.error("Error save datePeriod:", e);
  }
}
async function newSaveDatePeriod(startDate, endDate) {
  try {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "datePeriod", "datePeriod");
      let newStartDate = startDate;
      let newEndDate = endDate;
      await setDoc(docRef, {
        startDate: newStartDate,
        endDate: newEndDate,
        userid: user.uid,
      });
    }
  } catch (e) {
    console.error("Error adding document:", e);
  }
}
async function loadDatePeriod() {
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  try {
    const docRef = doc(db, "datePeriod", "datePeriod");
    const docSnap = await getDoc(docRef);
    startDate.value = docSnap.data().startDate;
    endDate.value = docSnap.data().endDate;
  } catch (e) {
    console.error("Error load datePeriod:", e);
  }
}
//overlay
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const hambargerMenu = document.getElementById("hambergarMenuButton");
  const menu = document.getElementById("hambergarMenu");
  hambargerMenu.addEventListener("click", () => {
    overlay.classList.add("is-active");
    hambargerMenu.classList.add("is-open");
  });

  overlay.addEventListener("click", () => {
    overlay.classList.remove("is-active");
    hambargerMenu.classList.remove("is-open");
    menu.classList.remove("is-active");
  });

  const close = document.getElementById("close-navPage");
  close.addEventListener("click", () => {
    overlay.classList.remove("is-active");
    hambargerMenu.classList.remove("is-open");
    menu.classList.remove("is-active");
  });
});

// Firebase SDK の最新バージョンを使用
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  getCountFromServer,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2HsK3flCN9hzKYFU1_iz9CzHEhO8s8mc",
  authDomain: "calender-1c549.firebaseapp.com",
  projectId: "calender-1c549",
  storageBucket: "calender-1c549.appspot.com",
  messagingSenderId: "242227279891",
  appId: "1:242227279891:web:b1df4c5be7edb2424fe7e6",
  measurementId: "G-HQHL3M2B1D",
};
//firebase initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

document.addEventListener("DOMContentLoaded", async () => {
  //emulator
  initializeApp(firebaseConfig);
  const isEmulating = window.location.hostname === "localhost";
  if (isEmulating) {
    connectFirestoreEmulator(db, "localhost", 8080);
  }

  const calnederheader = document.getElementById("calendar-header");
  const dayWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayWeek.forEach((day) => {
    const th = document.createElement("th");
    th.classList.add("day-of-week");
    th.textContent = day;
    calnederheader.appendChild(th);
  });

  const calender = document.getElementById("calender");
  const click = document.getElementById("click");
  let clickedDates = JSON.parse(localStorage.getItem("clickedDates")) || {};

  generateCalender(today.getFullYear(), today.getMonth());
  countClick();

  //dates には作成した日付の全てが入る「dateで合わせた日付でクリックしたデータを紐づけて表示する
  const lastDayRe = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  //全ての日付にてforを回す
  for (let date; date <= lastDayRe.getDate(); date++) {
    let clicked = await getClickdata(date);
    console.log(clicked);
    updateCalender(date, clicked);
  }

  //prev month
  const prev = document.getElementById("preview");
  prev.addEventListener("click", function () {
    const prevwMonth = document.getElementById("month");
    today.setMonth(today.getMonth() - 1);
    generateCalender(today.getFullYear(), today.getMonth());
    prevwMonth.textContent = `${today.getFullYear()}-${today.getMonth() + 1}`;
    loadData();
    countClick();
    loadOperateNum();
  });

  //next month
  const next = document.getElementById("next");
  next.addEventListener("click", function () {
    const nextMonth = document.getElementById("month");
    today.setMonth(today.getMonth() + 1);
    generateCalender(today.getFullYear(), today.getMonth());
    nextMonth.textContent = `${today.getFullYear()}- ${today.getMonth() + 1}`;
    loadData();
    countClick();
    loadOperateNum();
  });

  window.signUp = signUp;

  window.signIn = signIn;

  document.querySelectorAll;

  //operate-num　of month　月毎の件数入力部分後にカレンダーの下に行く予定
  const Num = document.getElementById("operate-num");
  Num.addEventListener("change", (operateNum) => {
    const month = document.getElementById("month");
    //いつも今の月のデータを保存することになるから、loaddataに組み込む形でその月のデータを表示保存するときは表示している月の数値にて保存するようにする
    setoperateNum(month.innerText);
    loadTotalNum();
    console.log("operateNum run");
  });

  //observe user
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadData(user);
      console.log("User is logged in:", auth.currentUser.uid);
      //id = dropdownMenuButtonにatuth.CurrentUser.uidを入れる
      const dropdownMenuButton = document.getElementById("dropdownMenuButton");
      dropdownMenuButton.textContent = auth.currentUser.uid;
      //login noView
      document.getElementById("signUptitle").style.display = "none";
      document.getElementById("signUpEmail").style.display = "none";
      document.getElementById("signUpPassword").style.display = "none";
      document.getElementById("signUp").style.display = "none";
      document.getElementById("signIntitle").style.display = "none";
      document.getElementById("signInEmail").style.display = "none";
      document.getElementById("signInPassword").style.display = "none";
      document.getElementById("signIn").style.display = "none";
      document.getElementById("logout").style.display = "block";
      console.log(auth.currentUser.uid);
    } else {
      console.log("User is logged out");
    }
  });

  //logout
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    signOut(auth);
  });
});

//window load
window.addEventListener("load", loadData);
window.addEventListener("load", loadOperateNum);
const reloadButton = document.getElementById("reload");
reloadButton.addEventListener("click", perDay);
//totalnum 設定した月の期間の合計日数を表示する
window.addEventListener("load", loadTotalNum);

//generate calender
function generateCalender(year, month) {
  calender.innerHTML = "";
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  //first week day
  const firstWeekDay = firstDay.getDay();
  for (let i = 0; i < firstWeekDay; i++) {
    const emptycell = document.createElement("th");
    calender.appendChild(emptycell);
  }

  //date cell
  //状態の復元
  for (let date = Number(1); date <= lastDay.getDate(); date++) {
    const cell = document.createElement("th");
    calender.appendChild(cell);
    cell.textContent = date;
    cell.classList.add("cell");
    cell.setAttribute("id", `${year}-${month + 1}-${date}`);
    const dateKey = `${year}-${month + 1}-${date}`;
    //クリック時の動作
    cell.addEventListener("click", async (event) => {
      const docRef = doc(db, "calender", dateKey);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        //console.log("Document data:", docSnap.data().clicked);
        await saveData(`${year}-${month + 1}-${date}`, docSnap.data().clicked);
        updateCalender(`${year}-${month + 1}-${date}`, !docSnap.data().clicked);
        console.log("updatecalender");
      } else {
        await newSaveData(`${year}-${month + 1}-${date}`, true);
        updateCalender(`${year}-${month + 1}-${date}`, true);
        console.log("newSaveData");
      }
      await countClick();
    });
  }
}
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const date = today.getDate();
const dateKey = `${year}-${month + 1}-${date}`;

//updatecalender
function updateCalender(date, clicked) {
  let dateElement = document.getElementById(date);
  if (dateElement) {
    if (clicked === true) {
      dateElement.classList.add("clicked");
    } else if (clicked === false) {
      dateElement.classList.remove("clicked");
    } else {
      console.log("not clicked");
    }
  }
}

const head_month = document.getElementById("month");
head_month.textContent = `${today.getFullYear()}- ${today.getMonth() + 1}`;

//add user
//signUp
function signUp(email, password) {
  const emailsakado = document.getElementById("signUpEmail").value;
  const passWord = document.getElementById("signUpPassword").value;
  createUserWithEmailAndPassword(auth, emailsakado, passWord)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User refisterd:", user);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

//signIn
function signIn(email, password) {
  const email_sign = document.getElementById("signInEmail").value;
  const password_sign = document.getElementById("signInPassword").value;
  try {
    signInWithEmailAndPassword(auth, email_sign, password_sign).then(
      (userCredential) => {
        const user = userCredential.user;
        console.log("User logged in:", user);
      }
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

//clickdata save　if docsnap.data().clickedが存在する時の保存
async function saveData(date, clicked) {
  try {
    const user = auth.currentUser;
    //ifdataexits なら!で反転させる
    if (user) {
      const docRef = doc(db, "calender", date);
      const docSnap = await getDoc(docRef);
      let newClickedData = !clicked;
      const data = docSnap.data();
      console.log(newClickedData);
      await setDoc(docRef, {
        clicked: newClickedData,
        userId: user.uid,
        date: new Date(date),
      });
    } else {
      console.error("No user is signed in");
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

//docsnap.data().clickedが存在しない時のsaveData関数
async function newSaveData(date, clicked) {
  try {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "calender", date);
      const docSnap = await getDoc(docRef);
      let newClickedData = clicked;
      await setDoc(docRef, {
        clicked: newClickedData,
        userId: user.uid,
        date: new Date(date),
      });
    } else {
      console.error("No user is signed in");
    }
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

//load data
async function loadData() {
  try {
    const user = auth.currentUser;
    if (user) {
      const querySnapshot = await getDocs(collection(db, "calender"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === user.uid) {
          //console.log(`${doc.id} => ${doc.data().clicked}`);
          updateCalender(doc.id, doc.data().clicked);
        }
      });
    } else {
      console.error("No user is signed in");
    }
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

//retrieve click data
async function getClickdata(date) {
  const docRef = doc(db, "clickData", date);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().clicked;
  } else {
    console.log("No such document!");
    return null;
  }
}

function signOut(auth) {
  auth.signOut().then(() => {
    console.log("User is signed out");
    generateCalender(today.getFullYear(), today.getMonth());
    const dropdownMenuButton = document.getElementById("dropdownMenuButton");
    dropdownMenuButton.textContent = "NoUser";
    //signIn review
    document.getElementById("signInEmail").style.display = "block";
    document.getElementById("signInPassword").style.display = "block";
    document.getElementById("signIn").style.display = "block";
    document.getElementById("logout").style.display = "none";
  });
}

//click day count
//setting period set
async function countClick() {
  //setting period
  const docRef = doc(db, "datePeriod", "datePeriod");
  const setdayDoc = await getDoc(docRef);
  //start month
  const startDate = new Date(setdayDoc.data().startDate);
  //end month
  const endDate = new Date(setdayDoc.data().endDate);
  //clicked count start~end
  const coll = collection(db, "calender");
  const q = query(
    coll,
    where("clicked", "==", true),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  try {
    const snapshot = await getCountFromServer(q);
    const day_count = document.getElementById("day-count");
    day_count.textContent = snapshot.data().count;
  } catch (e) {
    console.log("Error getting count:", error);
  }
}
//operate-numに入力された数値をfirebaseに保存
async function setoperateNum(month) {
  const operateNum = document.getElementById("operate-num").value;
  const user = auth.currentUser;
  const docRef = doc(db, "operateNum", month);
  let newOperateNum = operateNum;
  //後に設定期間分を合計するのでmonthはdate型での保管が必要 西暦-月 をdate型にすると自動的にその月の1日になるらしい
  await setDoc(docRef, {
    operateNum: newOperateNum,
    month: new Date(month),
    userId: user.uid,
  });
}
//すでにデータがある場合は、そのデータを取得して表示する
async function loadOperateNum() {
  const month = await document.getElementById("month").innerText;
  const docRef = await doc(db, "operateNum", month);
  try {
    const docSnap = await getDoc(docRef, where("month", "==", month));
    const operateNum = document.getElementById("operate-num");
    if (docSnap.exists()) {
      const data = docSnap.data();
      operateNum.value = data.operateNum;
    } else {
      operateNum.value = 0;
    }
  } catch (e) {
    console.error("Error adding document:", e);
  }
}
//totalnum of settig petiod
async function loadTotalNum() {
  //load setting period
  const docRef = doc(db, "datePeriod", "datePeriod");
  const docSnap = await getDoc(docRef);
  const startDate = new Date(docSnap.data().startDate);
  const endDate = new Date(docSnap.data().endDate);
  //count num setting period
  const numbox = document.getElementById("totalNum");
  const coll = collection(db, "operateNum");
  //serarch data while setting period
  const q = query(
    coll,
    where("month", ">=", startDate),
    where("month", "<=", endDate)
  );
  const qSnapshot = await getDocs(q);
  let totalNum = 0;
  qSnapshot.forEach((doc) => {
    const data = doc.data().operateNum;
    console.log(data);
    const operateNum = parseInt(data, 10);
    if (!isNaN(operateNum)) {
      totalNum += operateNum;
    }
  });
  numbox.textContent = totalNum;
}

//perday
async function perDay(day, num) {
  const month = await document.getElementById("month").innerText;
  const docRef = await doc(db, "operateNum", month);
  const docSnap = await getDoc(docRef, where("month", "==", month));
  const operateNum = document.getElementById("totalNum");
  const CountNum = operateNum.innerText;
  
  let CountDay = 0;
  const coll = collection(db, "calender");
  const q = query(coll, where("clicked", "==", true));
  const snapshot = await getCountFromServer(q);
  CountDay = snapshot.data().count;

  const perDayOrigin = CountNum / CountDay;
  const perDayResult = Math.round(perDayOrigin * 100) / 100;

  const perDay = document.getElementById("per-day");
  perDay.textContent = perDayResult;
}
//誰がログインしているかの表示//ユーザー名が設定できれば良いか
//signup機能している？新規ユーザー登録
//ユーザーごとにデータ分かれているか
//ログアウト機能 //
//ログインしている時はログインボタン不要//
//カレンダーのデザイン
//ログイン画面のデザイン
//非ログイン時はカレンダーを表示しない
//ログイン→カレンダー画面の遷移
//クリックした日付のカウント//
//件数の入力//
//計算結果の表示//
//日付と件数を集計する期間を設定できるようにする//
//設定した期間で合計日数と件数を表示するようにする
