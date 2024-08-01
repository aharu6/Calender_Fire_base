import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getCountFromServer } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
document.addEventListener("DOMContentLoaded", async () => {
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
          console.log("Document data:", docSnap.data().clicked);
          saveData(`${year}-${month + 1}-${date}`, docSnap.data().clicked);
          updateCalender(
            `${year}-${month + 1}-${date}`,
            !docSnap.data().clicked
          );
          console.log("updatecalender");
        } else {
          newSaveData(`${year}-${month + 1}-${date}`, !clickedDates[dateKey]);
          updateCalender(
            `${year}-${month + 1}-${date}`,
            !clickedDates[dateKey]
          );
          console.log("newSaveData");
        }
        //countClick();
      });
    }
  }
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  const dateKey = `${year}-${month + 1}-${date}`;

  generateCalender(today.getFullYear(), today.getMonth());

  //dates には作成した日付の全てが入る「dateで合わせた日付でクリックしたデータを紐づけて表示する
  const lastDayRe = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  //全ての日付にてforを回す
  for (let date; date <= lastDayRe.getDate(); date++) {
    let clicked = await getClickdata(date);
    console.log(clicked);
    updateCalender(date, clicked);
  }

  //updatecalender
  function updateCalender(date, clicked) {
    let dateElement = document.getElementById(date);
    if (dateElement) {
      if (clicked === true) {
        dateElement.classList.add("clicked");
        console.log("updatecalenderclicked=true");
      } else if (clicked === false) {
        dateElement.classList.remove("clicked");
        console.log("updatecalenderclicked = false");
      } else {
        console.log("not clicked");
      }
    }
    console.log("updatecalenderfunction");
  }

  const head_month = document.getElementById("month");
  head_month.textContent = today.getMonth() + 1;

  //prev month
  const prev = document.getElementById("preview");
  prev.addEventListener("click", function () {
    const prevwMonth = document.getElementById("month");
    today.setMonth(today.getMonth() - 1);
    generateCalender(today.getFullYear(), today.getMonth());
    prevwMonth.textContent = today.getMonth() + 1;
    const previewMonth = today.setMonth(today.getMonth() - 1);
    const lastdayPre = new Date(today.getFullYear(), previewMonth, 0);
    for (let date; date <= lastdayPre.getDate(); date++) {
      let clicked = getClickdata(date);
      console.log(clicked);
      updateCalender(date, clicked);
    }
    loadData();
  });

  //next month
  const next = document.getElementById("next");
  next.addEventListener("click", function () {
    const nextMonth = document.getElementById("month");
    today.setMonth(today.getMonth() + 1);
    generateCalender(today.getFullYear(), today.getMonth());
    nextMonth.textContent = today.getMonth() + 1;
    loadData();
  });

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
  window.signUp = signUp;

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
  window.signIn = signIn;

  //clickdata save　if docsnap.data().clickedが存在する時
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
        await setDoc(docRef, { clicked: newClickedData, userId: user.uid });
        console.log("Document written with ID;", docRef.id, newClickedData);
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
        await setDoc(docRef, { clicked: newClickedData, userId: user.uid });
      } else {
        console.error("No user is signed in");
      }
    } catch (e) {
      console.error("Error adding document:", e);
    }
  }
  document.querySelectorAll;

  //load data
  async function loadData() {
    try {
      const user = auth.currentUser;
      console.log(user.uid);
      if (user) {
        const querySnapshot = await getDocs(collection(db, "calender"));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.uid) {
            console.log(`${doc.id} => ${doc.data().clicked}`);
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
  window.onload = loadData;

  //observe user
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadData(user);
      console.log("User is logged in:", auth.currentUser.uid);
      //id = dropdownMenuButtonにatuth.CurrentUser.uidを入れる
      const dropdownMenuButton = document.getElementById("dropdownMenuButton");
      dropdownMenuButton.textContent = auth.currentUser.uid;
      //login noView
      document.getElementById("signInEmail").style.display = "none";
      document.getElementById("signInPassword").style.display = "none";
      document.getElementById("signIn").style.display = "none";
      document.getElementById("logout").style.display = "block";
      console.log(auth.currentUser.uid);
    } else {
      console.log("User is logged out");
    }
  });

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

  //logout
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    signOut(auth);
  });
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
  async function countClick() {
    const coll = collection(db, "calender");
    const q = query(coll, where("clicked", "==", "true"));
    const snapshot = await getAggregate(q, {
      totalpopulationa: sum("clicked"),
    });
  }
});

//誰がログインしているかの表示//ユーザー名が設定できれば良いか
//signup機能している？新規ユーザー登録
//ユーザーごとにデータ分かれているか
//ログアウト機能 //
//ログインしている時はログインボタン不要//
//カレンダーのデザイン
//ログイン画面のデザイン
//非ログイン時はカレンダーを表示しない
//ログイン→カレンダー画面の遷移
//クリックした日付のカウント
//件数の入力
//計算結果の表示
