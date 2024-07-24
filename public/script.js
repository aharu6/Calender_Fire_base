import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
  let clickCount = 0;

  let clickedDates = JSON.parse(localStorage.getItem("clickedDates")) || {};
  //generate calender
  function generateCalender(year, month) {
    calender.innerHTML = "";
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    //空白セルのための前の月の日数
    const firstWeekDay = firstDay.getDay();
    for (let i = 0; i < firstWeekDay; i++) {
      const emptycell = document.createElement("th");
      calender.appendChild(emptycell);
    }

    //日付セル
    for (let date = Number(1); date <= lastDay.getDate(); date++) {
      const cell = document.createElement("th");
      calender.appendChild(cell);
      cell.textContent = date;
      cell.classList.add("cell");
      cell.setAttribute("id", `${year}-${month + 1}-${date}`);
      //クリック状態の復元
      const dateKey = `${year}-${month + 1}-${date}`;
      if (clickedDates[dateKey]) {
        cell.classList.add("clicked");
        clickCount++;
      }
      cell.addEventListener("click", async (event) => {
        updateCalender(`${year}-${month + 1}-${date}`, !clickedDates[dateKey]);
        saveData(`${year}-${month + 1}-${date}`, !clickedDates[dateKey]);
      });
    }
  }
  const today = new Date();

  generateCalender(today.getFullYear(), today.getMonth());

  //dates には作成した日付の全てが入る「dateで合わせた日付でクリックしたデータを紐づけて表示する
  const lastDayRe = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  //全ての日付にてforを回す
  for (let date; date <= lastDayRe.getDate(); date++) {
    console.log(date);
    let clicked = await getClickdata(date);
    updateCalender(date, clicked);
  }

  function updateCalender(date, clicked) {
    let dateElement = document.getElementById(date);
    if (dateElement) {
      if (clicked) {
        dateElement.classList.add("clicked");
      } else {
        dateElement.classList.remove("clicked");
      }
    }
  }

  const month = document.getElementById("month");
  month.textContent = today.getMonth() + 1;
  //prev month
  const prev = document.getElementById("preview");
  prev.addEventListener("click", function () {
    today.setMonth(today.getMonth() - 1);
    generateCalender(today.getFullYear(), today.getMonth());
    month.textContent = today.getMonth() + 1;
  });
  //next month
  const next = document.getElementById("next");
  next.addEventListener("click", function () {
    today.setMonth(today.getMonth() + 1);
    generateCalender(today.getFullYear(), today.getMonth());
    month.textContent = today.getMonth() + 1;
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

  //clickdata save
  async function saveData(date, clicked) {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "calender", date);
        await setDoc(docRef, { clicked: clicked, userId: user.uid });
        console.log("Document written with ID;", docRef.id);
      } else {
        console.error("No user is sign in");
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

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
            console.log(`${doc.id} => ${doc.data()}`);
            updateCalender(doc.id, doc.data);
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
    } else {
      console.log("User is logged out");
    }
  });
  //retrieve click data
  async function getClickdata(date) {
    const docRef = doc(db, "clickData", date);
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data());
    if (docSnap.exists()) {
      return docSnap.data().clicked;
    } else {
      console.log("No such document!");
      return null;
    }
  }
});
