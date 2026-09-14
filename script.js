/* =====================================================
   BILLNAROX
   Firebase + Tiiny.host
===================================================== */


/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAnalytics,
  isSupported
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAnKMKKLv8hwoMK4S5KEf3SZCLTJ2k87h8",
  authDomain: "billnarox.firebaseapp.com",
  projectId: "billnarox",
  storageBucket: "billnarox.firebasestorage.app",
  messagingSenderId: "869985782872",
  appId: "1:869985782872:web:65032c6e0d9702660a8e2d",
  measurementId: "G-V97CEJFRCZ"
};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


/* =====================================================
   ANALYTICS
===================================================== */

isSupported()
  .then((supported) => {

    if (supported) {
      getAnalytics(app);
    }

  })
  .catch(() => {
    console.log("Analytics unavailable.");
  });


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentUser = null;

let currentShop = null;

let selectedCustomer = null;

let currentInvoiceNumber = "";

let currentInvoiceDate = "";

let currentLogoData = "";

let invoiceRows = [];


/* =====================================================
   ELEMENTS
===================================================== */

const loginScreen =
  document.getElementById("login");

const setupScreen =
  document.getElementById("setup");

const homeScreen =
  document.getElementById("home");

const invoiceScreen =
  document.getElementById("invoice");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const authMessage =
  document.getElementById("authMessage");

const signupBtn =
  document.getElementById("signupBtn");

const loginBtn =
  document.getElementById("loginBtn");

const googleBtn =
  document.getElementById("googleBtn");

const shopNameInput =
  document.getElementById("shopName");

const shopPhoneInput =
  document.getElementById("shopPhone");

const shopAddressInput =
  document.getElementById("shopAddress");

const shopLogoInput =
  document.getElementById("shopLogo");

const logoPreview =
  document.getElementById("logoPreview");

const logoStatus =
  document.getElementById("logoStatus");

const saveShopBtn =
  document.getElementById("saveShopBtn");

const logoutSetupBtn =
  document.getElementById("logoutSetupBtn");

const homeShopName =
  document.getElementById("homeShopName");

const customerList =
  document.getElementById("customerList");

const addCustomerBtn =
  document.getElementById("addCustomerBtn");

const shopMenuBtn =
  document.getElementById("shopMenuBtn");

const customerModal =
  document.getElementById("customerModal");

const closeCustomerModal =
  document.getElementById("closeCustomerModal");

const customerNameInput =
  document.getElementById("customerName");

const customerPhoneInput =
  document.getElementById("customerPhone");

const customerAddressInput =
  document.getElementById("customerAddress");

const saveCustomerBtn =
  document.getElementById("saveCustomerBtn");

const customerMessage =
  document.getElementById("customerMessage");

const backInvoiceBtn =
  document.getElementById("backInvoiceBtn");

const printBtn =
  document.getElementById("printBtn");

const invoiceLogo =
  document.getElementById("invoiceLogo");

const sName =
  document.getElementById("sName");

const sPhone =
  document.getElementById("sPhone");

const sAddress =
  document.getElementById("sAddress");

const cName =
  document.getElementById("cName");

const cPhone =
  document.getElementById("cPhone");

const cAddress =
  document.getElementById("cAddress");

const invNo =
  document.getElementById("invNo");

const invoiceDate =
  document.getElementById("invoiceDate");

const tableBody =
  document.getElementById("tableBody");

const addRowBtn =
  document.getElementById("addRowBtn");

const total =
  document.getElementById("total");

const saveInvoiceBtn =
  document.getElementById("saveInvoiceBtn");


/* =====================================================
   SCREEN SWITCH
===================================================== */

function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach((item) => {

      item.classList.remove("active");

    });

  screen.classList.add("active");

  window.scrollTo(0, 0);
}


/* =====================================================
   MESSAGES
===================================================== */

function showAuthMessage(message, error = false) {

  authMessage.textContent = message;

  authMessage.classList.toggle(
    "error",
    error
  );
}


function showCustomerMessage(
  message,
  error = false
) {

  customerMessage.textContent = message;

  customerMessage.classList.toggle(
    "error",
    error
  );
}


/* =====================================================
   FIREBASE ERROR
===================================================== */

function friendlyFirebaseError(error) {

  const code = error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "This email is already registered. Please Login.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password should be at least 6 characters.";

    case "auth/invalid-credential":
      return "Email or password is incorrect.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/popup-closed-by-user":
      return "Google login was cancelled.";

    case "auth/popup-blocked":
      return "Google popup was blocked by the browser.";

    case "auth/unauthorized-domain":
      return "This website is not authorized in Firebase Authentication.";

    case "permission-denied":
      return "Firebase permission denied. Check Firestore Rules.";

    case "unavailable":
      return "Firebase is temporarily unavailable. Try again.";

    default:
      return error?.message ||
        "Something went wrong.";
  }
}


/* =====================================================
   SIGN UP
===================================================== */

signupBtn.addEventListener(
  "click",
  async () => {

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value.trim();

    if (!email || !password) {

      showAuthMessage(
        "Please enter email and password.",
        true
      );

      return;
    }

    if (password.length < 6) {

      showAuthMessage(
        "Password must be at least 6 characters.",
        true
      );

      return;
    }

    signupBtn.disabled = true;

    signupBtn.textContent =
      "Creating Account...";

    try {

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(
        result.user,
        {
          displayName:
            email.split("@")[0]
        }
      );

      showAuthMessage(
        "Account created successfully."
      );

    } catch (error) {

      console.error(error);

      showAuthMessage(
        friendlyFirebaseError(error),
        true
      );

    } finally {

      signupBtn.disabled = false;

      signupBtn.textContent =
        "Sign Up";
    }

  }
);


/* =====================================================
   LOGIN
===================================================== */

loginBtn.addEventListener(
  "click",
  async () => {

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value.trim();

    if (!email || !password) {

      showAuthMessage(
        "Please enter email and password.",
        true
      );

      return;
    }

    loginBtn.disabled = true;

    loginBtn.textContent =
      "Logging in...";

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      showAuthMessage(
        "Login successful."
      );

    } catch (error) {

      console.error(error);

      showAuthMessage(
        friendlyFirebaseError(error),
        true
      );

    } finally {

      loginBtn.disabled = false;

      loginBtn.textContent =
        "Login";
    }

  }
);


/* =====================================================
   GOOGLE LOGIN
===================================================== */

googleBtn.addEventListener(
  "click",
  async () => {

    googleBtn.disabled = true;

    googleBtn.textContent =
      "Connecting...";

    try {

      await signInWithPopup(
        auth,
        googleProvider
      );

    } catch (error) {

      console.error(error);

      showAuthMessage(
        friendlyFirebaseError(error),
        true
      );

    } finally {

      googleBtn.disabled = false;

      googleBtn.innerHTML =
        "<b>G</b> Login with Google";
    }

  }
);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async (user) => {

    currentUser = user;

    if (!user) {

      showScreen(loginScreen);

      return;
    }

    try {

      await loadShop();

    } catch (error) {

      console.error(error);

      showAuthMessage(
        friendlyFirebaseError(error),
        true
      );
    }

  }
);


/* =====================================================
   SHOP DOCUMENT
===================================================== */

function shopDocRef() {

  return doc(
    db,
    "users",
    currentUser.uid,
    "settings",
    "shop"
  );
}


/* =====================================================
   LOAD SHOP
===================================================== */

async function loadShop() {

  if (!currentUser) return;

  const snapshot =
    await getDoc(shopDocRef());

  if (snapshot.exists()) {

    currentShop =
      snapshot.data();

    fillShopForm();

    homeShopName.textContent =
      currentShop.name ||
      "BillnaroX";

    showScreen(homeScreen);

    await loadCustomers();

  } else {

    currentShop = null;

    clearShopForm();

    showScreen(setupScreen);
  }

}


/* =====================================================
   FILL SHOP FORM
===================================================== */

function fillShopForm() {

  shopNameInput.value =
    currentShop?.name || "";

  shopPhoneInput.value =
    currentShop?.phone || "";

  shopAddressInput.value =
    currentShop?.address || "";

  currentLogoData =
    currentShop?.logo || "";

  if (currentLogoData) {

    logoPreview.src =
      currentLogoData;

    logoPreview.style.display =
      "block";

    logoStatus.textContent =
      "Current shop logo loaded.";

  } else {

    logoPreview.removeAttribute(
      "src"
    );

    logoPreview.style.display =
      "none";

    logoStatus.textContent =
      "No shop logo selected.";
  }

}


/* =====================================================
   CLEAR SHOP
===================================================== */

function clearShopForm() {

  shopNameInput.value = "";

  shopPhoneInput.value = "";

  shopAddressInput.value = "";

  shopLogoInput.value = "";

  currentLogoData = "";

  logoPreview.removeAttribute(
    "src"
  );

  logoPreview.style.display =
    "none";

  logoStatus.textContent = "";
}


/* =====================================================
   IMAGE COMPRESSION
===================================================== */

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        (event) => {

          const image =
            new Image();

          image.onload =
            () => {

              const maxSize = 500;

              let width =
                image.width;

              let height =
                image.height;

              if (width > height) {

                if (width > maxSize) {

                  height =
                    Math.round(
                      height *
                      maxSize /
                      width
                    );

                  width =
                    maxSize;
                }

              } else {

                if (height > maxSize) {

                  width =
                    Math.round(
                      width *
                      maxSize /
                      height
                    );

                  height =
                    maxSize;
                }
              }

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                width;

              canvas.height =
                height;

              const ctx =
                canvas.getContext(
                  "2d"
                );

              ctx.fillStyle =
                "#ffffff";

              ctx.fillRect(
                0,
                0,
                width,
                height
              );

              ctx.drawImage(
                image,
                0,
                0,
                width,
                height
              );

              const result =
                canvas.toDataURL(
                  "image/jpeg",
                  0.75
                );

              resolve(result);
            };

          image.onerror =
            () => {

              reject(
                new Error(
                  "Could not read image."
                )
              );

            };

          image.src =
            event.target.result;
        };

      reader.onerror =
        () => {

          reject(
            new Error(
              "Could not read file."
            )
          );

        };

      reader.readAsDataURL(file);

    }
  );

}


/* =====================================================
   SHOP LOGO
===================================================== */

shopLogoInput.addEventListener(
  "change",
  async () => {

    const file =
      shopLogoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      logoStatus.textContent =
        "Please select an image.";

      return;
    }

    logoStatus.textContent =
      "Preparing logo...";

    try {

      currentLogoData =
        await compressImage(file);

      logoPreview.src =
        currentLogoData;

      logoPreview.style.display =
        "block";

      logoStatus.textContent =
        "Logo ready to save ✓";

    } catch (error) {

      console.error(error);

      currentLogoData = "";

      logoPreview.style.display =
        "none";

      logoStatus.textContent =
        "Unable to load this image.";
    }

  }
);


/* =====================================================
   SAVE SHOP
===================================================== */

saveShopBtn.addEventListener(
  "click",
  async () => {

    if (!currentUser) {

      alert("Please login first.");

      return;
    }

    const name =
      shopNameInput.value.trim();

    const phone =
      shopPhoneInput.value.trim();

    const address =
      shopAddressInput.value.trim();

    if (!name) {

      alert(
        "Please enter your shop name."
      );

      shopNameInput.focus();

      return;
    }

    saveShopBtn.disabled = true;

    saveShopBtn.textContent =
      "Saving Shop...";

    try {

      const shopData = {

        name: name,

        phone: phone,

        address: address,

        logo:
          currentLogoData || "",

        updatedAt:
          serverTimestamp()

      };

      await setDoc(
        shopDocRef(),
        shopData,
        {
          merge: true
        }
      );

      currentShop = {
        ...currentShop,
        ...shopData
      };

      homeShopName.textContent =
        name;

      alert(
        "Shop saved successfully ✓"
      );

      showScreen(homeScreen);

      await loadCustomers();

    } catch (error) {

      console.error(
        "SAVE SHOP ERROR:",
        error
      );

      alert(
        "Could not save shop:\n\n" +
        friendlyFirebaseError(error)
      );

    } finally {

      saveShopBtn.disabled = false;

      saveShopBtn.textContent =
        "Save Shop";
    }

  }
);


/* =====================================================
   SHOP SETTINGS
===================================================== */

shopMenuBtn.addEventListener(
  "click",
  () => {

    if (!currentShop) {

      clearShopForm();

    } else {

      fillShopForm();
    }

    showScreen(setupScreen);
  }
);


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

  try {

    await signOut(auth);

    currentUser = null;

    currentShop = null;

    selectedCustomer = null;

    showScreen(loginScreen);

  } catch (error) {

    console.error(error);

    alert(
      friendlyFirebaseError(error)
    );
  }

}

logoutSetupBtn.addEventListener(
  "click",
  logout
);


/* =====================================================
   CUSTOMER MODAL
===================================================== */

addCustomerBtn.addEventListener(
  "click",
  () => {

    customerNameInput.value = "";

    customerPhoneInput.value = "";

    customerAddressInput.value = "";

    showCustomerMessage("");

    customerModal.classList.add(
      "show"
    );

    setTimeout(
      () => {
        customerNameInput.focus();
      },
      100
    );

  }
);


closeCustomerModal.addEventListener(
  "click",
  () => {

    customerModal.classList.remove(
      "show"
    );

  }
);


customerModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      customerModal
    ) {

      customerModal.classList.remove(
        "show"
      );
    }

  }
);


/* =====================================================
   SAVE CUSTOMER
===================================================== */

saveCustomerBtn.addEventListener(
  "click",
  async () => {

    if (!currentUser) {

      showCustomerMessage(
        "Please login first.",
        true
      );

      return;
    }

    const name =
      customerNameInput.value.trim();

    const phone =
      customerPhoneInput.value.trim();

    const address =
      customerAddressInput.value.trim();

    if (!name) {

      showCustomerMessage(
        "Please enter customer name.",
        true
      );

      customerNameInput.focus();

      return;
    }

    saveCustomerBtn.disabled = true;

    saveCustomerBtn.textContent =
      "Saving...";

    try {

      await addDoc(
        collection(
          db,
          "users",
          currentUser.uid,
          "customers"
        ),
        {

          name: name,

          phone: phone,

          address: address,

          createdAt:
            serverTimestamp()

        }
      );

      showCustomerMessage(
        "Customer saved successfully."
      );

      await loadCustomers();

      setTimeout(
        () => {

          customerModal.classList.remove(
            "show"
          );

        },
        400
      );

    } catch (error) {

      console.error(error);

      showCustomerMessage(
        friendlyFirebaseError(error),
        true
      );

    } finally {

      saveCustomerBtn.disabled = false;

      saveCustomerBtn.textContent =
        "Save Customer";
    }

  }
);


/* =====================================================
   LOAD CUSTOMERS
===================================================== */

async function loadCustomers() {

  if (!currentUser) return;

  customerList.innerHTML = "";

  const customersQuery =
    query(
      collection(
        db,
        "users",
        currentUser.uid,
        "customers"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

  try {

    const snapshot =
      await getDocs(
        customersQuery
      );

    if (snapshot.empty) {

      customerList.appendChild(
        createEmptyMessage()
      );

      return;
    }

    snapshot.forEach(
      (customerDoc) => {

        const customer =
          customerDoc.data();

        customerList.appendChild(
          createCustomerElement(
            customerDoc.id,
            customer
          )
        );

      }
    );

  } catch (error) {

    console.error(error);

    customerList.appendChild(
      createEmptyMessage(
        "Unable to load customers."
      )
    );

  }

}


/* =====================================================
   EMPTY MESSAGE
===================================================== */

function createEmptyMessage(
  text = null
) {

  const div =
    document.createElement("div");

  div.className = "empty";

  div.innerHTML =
    text ||
    `
      No customers yet.
      <br>
      Tap + to add a customer.
    `;

  return div;
}


/* =====================================================
   CUSTOMER ELEMENT
===================================================== */

function createCustomerElement(
  id,
  customer
) {

  const div =
    document.createElement("div");

  div.className =
    "customer";

  const firstLetter =
    (
      customer.name ||
      "?"
    )
      .charAt(0)
      .toUpperCase();

  div.innerHTML = `

    <div class="avatar">
      ${escapeHtml(firstLetter)}
    </div>

    <div>

      <div class="customer-name">
        ${escapeHtml(
          customer.name ||
          "Unnamed"
        )}
      </div>

      <div class="customer-phone">
        ${escapeHtml(
          customer.phone ||
          "No phone"
        )}
      </div>

      ${
        customer.address
          ? `
            <div class="customer-address">
              ${escapeHtml(
                customer.address
              )}
            </div>
          `
          : ""
      }

    </div>

  `;

  div.addEventListener(
    "click",
    () => {

      openInvoice(
        id,
        customer
      );

    }
  );

  return div;
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =====================================================
   OPEN INVOICE
===================================================== */

function openInvoice(
  customerId,
  customer
) {

  selectedCustomer = {
    id: customerId,
    ...customer
  };

  sName.textContent =
    currentShop?.name ||
    "Shop Name";

  sPhone.textContent =
    currentShop?.phone ||
    "";

  sAddress.textContent =
    currentShop?.address ||
    "";

  cName.textContent =
    customer.name ||
    "";

  cPhone.textContent =
    customer.phone ||
    "";

  cAddress.textContent =
    customer.address ||
    "";


  /* SHOP LOGO */

  if (currentShop?.logo) {

    invoiceLogo.src =
      currentShop.logo;

    invoiceLogo.style.display =
      "block";

  } else {

    invoiceLogo.removeAttribute(
      "src"
    );

    invoiceLogo.style.display =
      "none";
  }


  /* INVOICE NUMBER */

  currentInvoiceNumber =
    generateInvoiceNumber();

  currentInvoiceDate =
    formatDate(new Date());

  invNo.textContent =
    currentInvoiceNumber;

  invoiceDate.textContent =
    currentInvoiceDate;


  /* RESET */

  invoiceRows = [];

  tableBody.innerHTML = "";

  addInvoiceRow();

  showScreen(invoiceScreen);
}


/* =====================================================
   INVOICE NUMBER
===================================================== */

function generateInvoiceNumber() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );

  return `BNX-${year}${month}${day}-${random}`;
}


/* =====================================================
   DATE
===================================================== */

function formatDate(date) {

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}


/* =====================================================
   ADD INVOICE ROW
===================================================== */

addRowBtn.addEventListener(
  "click",
  () => {

    addInvoiceRow();

  }
);


function addInvoiceRow(
  existing = null
) {

  const row = {

    date:
      existing?.date ||
      getTodayInputDate(),

    particulars:
      existing?.particulars ||
      "",

    amount:
      existing?.amount ?? 0,

    paid:
      existing?.paid ?? 0

  };

  invoiceRows.push(row);

  renderInvoiceTable();
}


/* =====================================================
   RENDER TABLE
===================================================== */

function renderInvoiceTable() {

  tableBody.innerHTML = "";

  invoiceRows.forEach(
    (row, index) => {

      const tr =
        document.createElement("tr");

      const balance =
        calculateBalance(
          row.amount,
          row.paid
        );


      /* S.NO */

      const sno =
        document.createElement("td");

      sno.textContent =
        index + 1;

      tr.appendChild(sno);


      /* DATE */

      const dateTd =
        document.createElement("td");

      const dateInput =
        document.createElement("input");

      dateInput.type = "date";

      dateInput.value =
        toInputDate(row.date);

      dateInput.dataset.field =
        "date";

      dateInput.dataset.index =
        index;

      dateTd.appendChild(
        dateInput
      );

      tr.appendChild(dateTd);


      /* PARTICULARS */

      const particularsTd =
        document.createElement("td");

      const particularsInput =
        document.createElement("input");

      particularsInput.type = "text";

      particularsInput.placeholder =
        "Particulars";

      particularsInput.value =
        row.particulars || "";

      particularsInput.dataset.field =
        "particulars";

      particularsInput.dataset.index =
        index;

      particularsTd.appendChild(
        particularsInput
      );

      tr.appendChild(particularsTd);


      /* AMOUNT */

      const amountTd =
        document.createElement("td");

      const amountInput =
        document.createElement("input");

      amountInput.type = "number";

      amountInput.min = "0";

      amountInput.step = "0.01";

      amountInput.inputMode =
        "decimal";

      amountInput.value =
        Number(row.amount) || 0;

      amountInput.dataset.field =
        "amount";

      amountInput.dataset.index =
        index;

      amountTd.appendChild(
        amountInput
      );

      tr.appendChild(amountTd);


      /* PAID */

      const paidTd =
        document.createElement("td");

      const paidInput =
        document.createElement("input");

      paidInput.type = "number";

      paidInput.min = "0";

      paidInput.step = "0.01";

      paidInput.inputMode =
        "decimal";

      paidInput.value =
        Number(row.paid) || 0;

      paidInput.dataset.field =
        "paid";

      paidInput.dataset.index =
        index;

      paidTd.appendChild(
        paidInput
      );

      tr.appendChild(paidTd);


      /* BALANCE */

      const balanceTd =
        document.createElement("td");

      balanceTd.className =
        "balance-cell";

      balanceTd.textContent =
        `₹${balance.toFixed(2)}`;

      tr.appendChild(
        balanceTd
      );


      /* DELETE */

      const actionTd =
        document.createElement("td");

      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "delete-row";

      deleteButton.textContent =
        "Delete";

      deleteButton.dataset.delete =
        index;

      actionTd.appendChild(
        deleteButton
      );

      tr.appendChild(
        actionTd
      );


      tableBody.appendChild(tr);


      /* INPUT EVENTS */

      dateInput.addEventListener(
        "input",
        handleRowInput
      );

      dateInput.addEventListener(
        "change",
        handleRowInput
      );

      particularsInput.addEventListener(
        "input",
        handleRowInput
      );

      amountInput.addEventListener(
        "input",
        handleRowInput
      );

      paidInput.addEventListener(
        "input",
        handleRowInput
      );


      /* DELETE EVENT */

      deleteButton.addEventListener(
        "click",
        () => {

          invoiceRows.splice(
            index,
            1
          );

          if (
            invoiceRows.length === 0
          ) {

            addInvoiceRow();

          } else {

            renderInvoiceTable();

          }

        }
      );

    }
  );


  updateTotal();
}


/* =====================================================
   HANDLE ROW INPUT
===================================================== */

function handleRowInput(event) {

  const input =
    event.target;

  const index =
    Number(
      input.dataset.index
    );

  const field =
    input.dataset.field;

  if (!invoiceRows[index]) {
    return;
  }


  /* DATE */

  if (field === "date") {

    invoiceRows[index].date =
      input.value;

  }


  /* PARTICULARS */

  else if (
    field === "particulars"
  ) {

    invoiceRows[index].particulars =
      input.value;

  }


  /* AMOUNT */

  else if (
    field === "amount"
  ) {

    /*
      IMPORTANT:
      Do not renderInvoiceTable() here.
      That would remove the input and
      move the cursor while typing.
    */

    invoiceRows[index].amount =
      input.value === ""
        ? 0
        : Number(input.value);

  }


  /* PAID */

  else if (
    field === "paid"
  ) {

    /*
      Same here:
      don't rebuild the table.
    */

    invoiceRows[index].paid =
      input.value === ""
        ? 0
        : Number(input.value);

  }


  /* UPDATE ONLY THE CURRENT BALANCE */

  updateRowBalance(index);

  /* UPDATE TOTAL */

  updateTotal();
}


/* =====================================================
   UPDATE ONE ROW BALANCE
===================================================== */

function updateRowBalance(index) {

  const row =
    invoiceRows[index];

  if (!row) {
    return;
  }

  const rows =
    tableBody.querySelectorAll(
      "tr"
    );

  const tr =
    rows[index];

  if (!tr) {
    return;
  }

  const balance =
    calculateBalance(
      row.amount,
      row.paid
    );

  const balanceCell =
    tr.querySelector(
      ".balance-cell"
    );

  if (balanceCell) {

    balanceCell.textContent =
      `₹${balance.toFixed(2)}`;

  }
}


/* =====================================================
   BALANCE
===================================================== */

function calculateBalance(
  amount,
  paid
) {

  const amountValue =
    Number(amount) || 0;

  const paidValue =
    Number(paid) || 0;

  return Math.max(
    0,
    amountValue - paidValue
  );
}


/* =====================================================
   TOTAL
===================================================== */

function updateTotal() {

  let totalBalance = 0;

  invoiceRows.forEach(
    (row) => {

      totalBalance +=
        calculateBalance(
          row.amount,
          row.paid
        );

    }
  );

  total.textContent =
    totalBalance.toFixed(2);
}


/* =====================================================
   TODAY INPUT DATE
===================================================== */

function getTodayInputDate() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =====================================================
   DATE CONVERSION
===================================================== */

function toInputDate(value) {

  if (!value) {
    return getTodayInputDate();
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {

    return value;
  }

  const parts =
    String(value).split("/");

  if (parts.length === 3) {

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

  }

  return getTodayInputDate();
}


/* =====================================================
   SAVE INVOICE
===================================================== */

saveInvoiceBtn.addEventListener(
  "click",
  async () => {

    if (!currentUser) {

      alert(
        "Please login first."
      );

      return;
    }

    if (!selectedCustomer) {

      alert(
        "Customer not selected."
      );

      return;
    }


    saveInvoiceBtn.disabled =
      true;

    saveInvoiceBtn.textContent =
      "Saving Invoice...";


    try {

      const invoiceData = {

        invoiceNumber:
          currentInvoiceNumber,

        invoiceDate:
          currentInvoiceDate,

        customerId:
          selectedCustomer.id,

        customerName:
          selectedCustomer.name ||
          "",

        customerPhone:
          selectedCustomer.phone ||
          "",

        customerAddress:
          selectedCustomer.address ||
          "",

        rows:
          invoiceRows.map(
            (row) => ({

              date:
                row.date || "",

              particulars:
                row.particulars || "",

              amount:
                Number(row.amount) || 0,

              paid:
                Number(row.paid) || 0,

              balance:
                calculateBalance(
                  row.amount,
                  row.paid
                )

            })
          ),

        totalBalance:
          invoiceRows.reduce(
            (sum, row) => {

              return sum +
                calculateBalance(
                  row.amount,
                  row.paid
                );

            },
            0
          ),

        createdAt:
          serverTimestamp()

      };


      await addDoc(
        collection(
          db,
          "users",
          currentUser.uid,
          "invoices"
        ),
        invoiceData
      );


      alert(
        "Invoice saved successfully ✓"
      );


    } catch (error) {

      console.error(
        "SAVE INVOICE ERROR:",
        error
      );

      alert(
        "Could not save invoice:\n\n" +
        friendlyFirebaseError(error)
      );


    } finally {

      saveInvoiceBtn.disabled =
        false;

      saveInvoiceBtn.textContent =
        "💾 Save Invoice";

    }

  }
);


/* =====================================================
   BACK
===================================================== */

backInvoiceBtn.addEventListener(
  "click",
  () => {

    showScreen(homeScreen);

  }
);


/* =====================================================
   PRINT
===================================================== */

printBtn.addEventListener(
  "click",
  () => {

    window.print();

  }
);


/* =====================================================
   START
===================================================== */

showScreen(loginScreen);